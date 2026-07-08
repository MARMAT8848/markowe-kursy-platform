import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { queueAndSend } from "@/lib/emails";
import { isValidEmail, newsletterToken } from "@/lib/newsletter";

/**
 * POST /api/newsletter/subscribe  { email }
 *
 * Double opt-in: zapis tworzy subskrybenta 'pending' i wysyła e-mail
 * z linkiem potwierdzającym. Bez potwierdzenia NIC nie wysyłamy.
 * Odpowiedź jest neutralna (nie zdradza, czy adres już istnieje).
 * Pole-pułapka "website" (honeypot) odcina proste boty.
 */
export async function POST(req: Request) {
  let body: { email?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  // honeypot: prawdziwy formularz zostawia to pole puste
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "INVALID_EMAIL", message: "Podaj prawidłowy adres e-mail." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent") || null;

  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("id, status, confirm_token")
    .eq("email", email)
    .maybeSingle();

  let confirmToken: string | null = null;

  if (!existing) {
    confirmToken = newsletterToken();
    const { error } = await admin.from("newsletter_subscribers").insert({
      email,
      status: "pending",
      confirm_token: confirmToken,
      unsubscribe_token: newsletterToken(),
      consent_given_at: nowIso,
      consent_ip: ip,
      consent_user_agent: ua,
      source: "footer",
    });
    if (error) {
      console.error("[newsletter] insert:", error.message);
      return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
    }
  } else if (existing.status === "pending") {
    // ponowny zapis przed potwierdzeniem -> wyślij link jeszcze raz
    confirmToken = existing.confirm_token as string;
  } else if (existing.status === "unsubscribed") {
    // powrót po wypisie -> nowa zgoda, nowy token, znów double opt-in
    confirmToken = newsletterToken();
    await admin
      .from("newsletter_subscribers")
      .update({
        status: "pending",
        confirm_token: confirmToken,
        consent_given_at: nowIso,
        consent_ip: ip,
        consent_user_agent: ua,
        confirmed_at: null,
        unsubscribed_at: null,
      })
      .eq("id", existing.id);
  }
  // status 'subscribed' -> nic nie wysyłamy (neutralna odpowiedź niżej)

  if (confirmToken) {
    const envSite = process.env.NEXT_PUBLIC_SITE_URL;
    const site =
      envSite && !envSite.includes("localhost")
        ? envSite
        : new URL(req.url).origin;
    await queueAndSend("newsletter_confirm", email, {
      confirmUrl: `${site}/api/newsletter/confirm?token=${confirmToken}`,
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "Sprawdź skrzynkę - wysłaliśmy link potwierdzający zapis (zajrzyj też do spamu).",
  });
}
