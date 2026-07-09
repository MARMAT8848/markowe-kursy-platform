import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  enrollSubscriberInActiveSequences,
  processSequences,
} from "@/lib/newsletter-funnel";

/**
 * GET /api/newsletter/confirm?token=...
 * Domknięcie double opt-in: pending -> subscribed (data potwierdzenia
 * = dowód zgody). Ponowne kliknięcie / zły token -> czytelna strona.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const admin = createSupabaseAdmin();

  const { data: sub } = token
    ? await admin
        .from("newsletter_subscribers")
        .select("id, status")
        .eq("confirm_token", token)
        .maybeSingle()
    : { data: null };

  if (!sub) {
    return NextResponse.redirect(
      new URL("/newsletter/potwierdzono?status=invalid", url.origin),
      { status: 303 }
    );
  }

  if (sub.status === "pending") {
    await admin
      .from("newsletter_subscribers")
      .update({ status: "subscribed", confirmed_at: new Date().toISOString() })
      .eq("id", sub.id);
    // pierwszy kontakt: wejście do aktywnych lejków i wysłanie kroku 1
    // (opóźnienie 0). Best-effort - nie blokuje potwierdzenia.
    try {
      await enrollSubscriberInActiveSequences(sub.id);
      await processSequences(50);
    } catch (e) {
      console.error("[newsletter/confirm] lejek:", e);
    }
  }
  // 'subscribed' -> idempotentnie ta sama strona sukcesu

  return NextResponse.redirect(
    new URL("/newsletter/potwierdzono?status=ok", url.origin),
    { status: 303 }
  );
}
