import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { queueAndSend } from "@/lib/emails";
import { isValidEmail } from "@/lib/newsletter";

export const runtime = "nodejs";

const TOPICS = ["Kurs indywidualny", "Oferta dla firm", "Inne"];
const MAX_MESSAGE = 5000;

/**
 * Formularz kontaktowy. Wiadomość ZAWSZE ląduje w bazie
 * (contact_messages) - e-mail do admina jest tylko powiadomieniem
 * best-effort, więc nic nie ginie nawet bez działającej poczty.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot - boty wypełniają ukryte pole; odpowiadamy neutralnie.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  const topicRaw = String(body.topic ?? "Inne").trim();
  const topic = TOPICS.includes(topicRaw) ? topicRaw : "Inne";
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);

  if (!name || !message || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("contact_messages")
    .insert({ name, email, topic, message });
  if (error) {
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }

  // Powiadomienie do adminów (best-effort; klient nie czeka na pocztę).
  const { data: admins } = await admin
    .from("admin_users")
    .select("user_id, profiles(email)");
  for (const a of admins ?? []) {
    // PostgREST może zwrócić relację jako obiekt lub tablicę 1-elementową
    const prof = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
    const to = (prof as { email: string | null } | null)?.email;
    if (!to) continue;
    await queueAndSend("contact_message", to, {
      name,
      email,
      topic,
      message,
      replyTo: email,
    });
  }

  return NextResponse.json({ ok: true });
}
