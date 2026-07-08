import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

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
  }
  // 'subscribed' -> idempotentnie ta sama strona sukcesu

  return NextResponse.redirect(
    new URL("/newsletter/potwierdzono?status=ok", url.origin),
    { status: 303 }
  );
}
