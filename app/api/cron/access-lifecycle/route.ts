import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { queueAndSend } from "@/lib/emails";
import { getCourse } from "@/lib/courses";

/**
 * Cron dzienny — cykl życia dostępu:
 *  1. Wygasłe aktywne dostępy → status 'expired' + e-mail o wygaśnięciu.
 *  2. Przypomnienia 30 i 7 dni przed wygaśnięciem (raz — znaczniki w bazie).
 *
 * Autorytatywne pozostaje `access_expires_at` (sprawdzane przy każdym
 * żądaniu w canAccessCourse). Ten cron aktualizuje status dla UI/raportów
 * i wysyła powiadomienia — nie jest jedynym mechanizmem wygaszania.
 */
const fmt = (iso: string) => new Date(iso).toLocaleDateString("pl-PL");

interface EnrRow {
  id: string;
  user_id: string;
  access_expires_at: string;
  courses: { slug: string } | null;
  profiles: { email: string } | null;
}

async function emailCtx(row: EnrRow) {
  const slug = row.courses?.slug ?? "";
  return {
    to: row.profiles?.email ?? "",
    payload: {
      courseTitle: getCourse(slug)?.title ?? slug,
      courseSlug: slug,
      accessExpires: fmt(row.access_expires_at),
    },
    userId: row.user_id,
  };
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const admin = createSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();
  const in7 = new Date(now.getTime() + 7 * 864e5).toISOString();
  const in30 = new Date(now.getTime() + 30 * 864e5).toISOString();

  const sel =
    "id, user_id, access_expires_at, courses(slug), profiles(email)";
  let expired = 0;
  let r30 = 0;
  let r7 = 0;

  // 1. wygasłe aktywne dostępy
  const { data: toExpire } = await admin
    .from("enrollments")
    .select(sel)
    .eq("status", "active")
    .lte("access_expires_at", nowIso)
    .limit(500);
  for (const row of (toExpire ?? []) as unknown as EnrRow[]) {
    await admin
      .from("enrollments")
      .update({ status: "expired", expired_notified_at: nowIso })
      .eq("id", row.id);
    const ctx = await emailCtx(row);
    if (ctx.to) {
      await queueAndSend("access_expired", ctx.to, ctx.payload, {
        userId: ctx.userId,
      });
    }
    expired++;
  }

  // 2a. przypomnienie 30 dni (aktywne, wygasa w oknie now..in30, jeszcze nie wysłane)
  const { data: rem30 } = await admin
    .from("enrollments")
    .select(sel)
    .eq("status", "active")
    .gt("access_expires_at", nowIso)
    .lte("access_expires_at", in30)
    .is("reminder_30_sent_at", null)
    .limit(500);
  for (const row of (rem30 ?? []) as unknown as EnrRow[]) {
    const ctx = await emailCtx(row);
    if (ctx.to) {
      await queueAndSend("expiry_reminder_30", ctx.to, ctx.payload, {
        userId: ctx.userId,
      });
    }
    await admin
      .from("enrollments")
      .update({ reminder_30_sent_at: nowIso })
      .eq("id", row.id);
    r30++;
  }

  // 2b. przypomnienie 7 dni
  const { data: rem7 } = await admin
    .from("enrollments")
    .select(sel)
    .eq("status", "active")
    .gt("access_expires_at", nowIso)
    .lte("access_expires_at", in7)
    .is("reminder_7_sent_at", null)
    .limit(500);
  for (const row of (rem7 ?? []) as unknown as EnrRow[]) {
    const ctx = await emailCtx(row);
    if (ctx.to) {
      await queueAndSend("expiry_reminder_7", ctx.to, ctx.payload, {
        userId: ctx.userId,
      });
    }
    await admin
      .from("enrollments")
      .update({ reminder_7_sent_at: nowIso })
      .eq("id", row.id);
    r7++;
  }

  return NextResponse.json({
    ok: true,
    expired,
    reminders30: r30,
    reminders7: r7,
  });
}
