import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { stopSequencesForSubscriber } from "@/lib/newsletter-funnel";

/**
 * Wypis z newslettera — jednoklikowy, bez logowania, skuteczny
 * natychmiast. GET obsługuje link z e-maila; POST obsługuje
 * List-Unsubscribe=One-Click (klient pocztowy wysyła POST).
 */
async function unsubscribe(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const admin = createSupabaseAdmin();

  const { data: sub } = token
    ? await admin
        .from("newsletter_subscribers")
        .select("id, status")
        .eq("unsubscribe_token", token)
        .maybeSingle()
    : { data: null };

  if (sub && sub.status !== "unsubscribed") {
    await admin
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    // wypis zatrzymuje wszystkie lejki tej osoby
    await stopSequencesForSubscriber(sub.id, "unsubscribed");
  }

  return NextResponse.redirect(
    new URL(
      `/newsletter/wypisano?status=${sub ? "ok" : "invalid"}`,
      url.origin
    ),
    { status: 303 }
  );
}

export async function GET(req: Request) {
  return unsubscribe(req);
}

// One-Click unsubscribe (RFC 8058): klient pocztowy POST-uje na ten URL.
export async function POST(req: Request) {
  return unsubscribe(req);
}
