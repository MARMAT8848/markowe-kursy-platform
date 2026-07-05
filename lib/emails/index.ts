import "server-only";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { renderEmail, type TemplateKey } from "./templates";

/**
 * Warstwa e-maili transakcyjnych z wzorcem outbox (email_outbox).
 *
 * queueAndSend(): zapisuje rekord w outbox i próbuje wysłać od razu
 * (best-effort). Gdy Resend nieskonfigurowany albo wysyłka się nie uda,
 * rekord zostaje w statusie 'queued'/'failed' i zostanie ponowiony przez
 * cron (processOutbox). Dzięki temu logika biznesowa nie zależy od
 * dostępności dostawcy poczty.
 */

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY!);
}

async function deliver(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resendConfigured()) return { ok: false, error: "resend_not_configured" };
  try {
    const res = await getResend().emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html,
    });
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true, id: res.data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
  }
}

/**
 * Zakolejkuj (zapisz w outbox) i spróbuj wysłać natychmiast.
 * Zawsze zwraca — błąd wysyłki nie przerywa logiki biznesowej.
 */
export async function queueAndSend(
  templateKey: TemplateKey,
  to: string,
  payload: Record<string, unknown>,
  opts: { userId?: string | null; language?: string } = {}
): Promise<void> {
  const language = opts.language ?? "pl";
  const admin = createSupabaseAdmin();
  const { subject, html } = renderEmail(templateKey, payload, language);

  const { data: row } = await admin
    .from("email_outbox")
    .insert({
      user_id: opts.userId ?? null,
      email_to: to,
      template_key: templateKey,
      language,
      subject,
      payload,
      status: "queued",
      provider: "resend",
    })
    .select("id")
    .single();

  const sent = await deliver(to, subject, html);
  if (!row) return;
  if (sent.ok) {
    await admin
      .from("email_outbox")
      .update({
        status: "sent",
        provider_message_id: sent.id ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  } else if (sent.error !== "resend_not_configured") {
    await admin.from("email_outbox").update({ status: "failed" }).eq("id", row.id);
  }
}

/**
 * Ponowna wysyłka zaległych (queued/failed) — wywoływane przez cron.
 * Zwraca liczbę wysłanych. Bezpiecznie no-op, gdy Resend nieskonfigurowany.
 */
export async function processOutbox(limit = 50): Promise<{ sent: number; failed: number }> {
  if (!resendConfigured()) return { sent: 0, failed: 0 };
  const admin = createSupabaseAdmin();

  const { data: rows } = await admin
    .from("email_outbox")
    .select("id, email_to, template_key, language, payload")
    .in("status", ["queued", "failed"])
    .order("created_at", { ascending: true })
    .limit(limit);

  let sent = 0;
  let failed = 0;
  for (const r of rows ?? []) {
    const { subject, html } = renderEmail(
      r.template_key as TemplateKey,
      (r.payload as Record<string, unknown>) ?? {},
      (r.language as string) ?? "pl"
    );
    const res = await deliver(r.email_to as string, subject, html);
    if (res.ok) {
      await admin
        .from("email_outbox")
        .update({
          status: "sent",
          provider_message_id: res.id ?? null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", r.id);
      sent++;
    } else {
      await admin.from("email_outbox").update({ status: "failed" }).eq("id", r.id);
      failed++;
    }
  }
  return { sent, failed };
}
