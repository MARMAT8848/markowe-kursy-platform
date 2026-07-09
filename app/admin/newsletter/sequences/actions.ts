"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin";
import { queueAndSend } from "@/lib/emails";
import { renderCampaignContent } from "@/lib/newsletter";
import { FUNNEL_TEMPLATE } from "@/lib/newsletter-funnel-template";
import { PUBLIC_SITE } from "@/lib/site-url";

type ActionResult = { ok: boolean; error?: string };

async function siteUrl(): Promise<string> {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSite && !envSite.includes("localhost")) return envSite;
  const h = await headers();
  const host = h.get("host");
  if (host && !host.includes("localhost")) {
    return `${h.get("x-forwarded-proto") || "https"}://${host}`;
  }
  return `http://${host ?? "localhost:3000"}`;
}

/** Wgraj gotowy lejek TOFU→BOFU (7 wiadomości) jako nową sekwencję (szkic). */
export async function seedFunnelAction(): Promise<void> {
  const { admin, userId } = await requireAdmin();
  // CTA zawsze na produkcyjny adres (nie localhost) - linki w mailach muszą
  // działać niezależnie od tego, skąd wgrano lejek.
  const site = PUBLIC_SITE;

  const { data: seq, error } = await admin
    .from("newsletter_sequences")
    .insert({
      name: FUNNEL_TEMPLATE.name,
      description: FUNNEL_TEMPLATE.description,
      status: "paused",
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !seq) redirect("/admin/newsletter/sequences?error=seed");

  const rows = FUNNEL_TEMPLATE.steps.map((s, i) => ({
    sequence_id: seq.id,
    position: i + 1,
    delay_days: s.delayDays,
    subject: s.subject,
    preheader: s.preheader,
    content: s.content,
    cta_label: s.ctaLabel,
    cta_url: `${site}${s.ctaPath}`,
  }));
  const { error: stepErr } = await admin
    .from("newsletter_sequence_steps")
    .insert(rows);
  if (stepErr) {
    await admin.from("newsletter_sequences").delete().eq("id", seq.id);
    redirect("/admin/newsletter/sequences?error=seed");
  }

  revalidatePath("/admin/newsletter/sequences");
  redirect(`/admin/newsletter/sequences/${seq.id}`);
}

/** Pusty, własny lejek. */
export async function createSequenceAction(formData: FormData) {
  const { admin, userId } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim() || "Nowy lejek";
  const { data: seq } = await admin
    .from("newsletter_sequences")
    .insert({ name, status: "paused", created_by: userId })
    .select("id")
    .single();
  revalidatePath("/admin/newsletter/sequences");
  redirect(`/admin/newsletter/sequences/${seq?.id ?? ""}`);
}

export async function toggleSequenceStatusAction(
  formData: FormData
): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  const id = String(formData.get("sequenceId"));
  const activate = String(formData.get("activate")) === "true";

  if (activate) {
    // nie aktywuj lejka bez kroków
    const { count } = await admin
      .from("newsletter_sequence_steps")
      .select("*", { count: "exact", head: true })
      .eq("sequence_id", id);
    if ((count ?? 0) === 0) {
      return { ok: false, error: "Dodaj przynajmniej jeden krok przed aktywacją." };
    }
  }

  const { error } = await admin
    .from("newsletter_sequences")
    .update({ status: activate ? "active" : "paused" })
    .eq("id", id);
  if (error) return { ok: false, error: "Nie udało się zmienić statusu." };
  revalidatePath("/admin/newsletter/sequences");
  revalidatePath(`/admin/newsletter/sequences/${id}`);
  return { ok: true };
}

export async function deleteSequenceAction(formData: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = String(formData.get("sequenceId"));
  await admin.from("newsletter_sequences").delete().eq("id", id);
  revalidatePath("/admin/newsletter/sequences");
  redirect("/admin/newsletter/sequences");
}

/** Dodaj/zapisz krok. Bez stepId = nowy krok na końcu. */
export async function saveStepAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const sequenceId = String(formData.get("sequenceId"));
  const stepId = String(formData.get("stepId") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!subject || !content) {
    redirect(`/admin/newsletter/sequences/${sequenceId}?error=empty`);
  }
  const payload = {
    subject,
    content,
    preheader: String(formData.get("preheader") ?? "").trim() || null,
    cta_label: String(formData.get("cta_label") ?? "").trim() || null,
    cta_url: String(formData.get("cta_url") ?? "").trim() || null,
    delay_days: Math.max(0, parseInt(String(formData.get("delay_days") ?? "2"), 10) || 0),
  };

  if (stepId) {
    await admin
      .from("newsletter_sequence_steps")
      .update(payload)
      .eq("id", stepId);
  } else {
    const { data: last } = await admin
      .from("newsletter_sequence_steps")
      .select("position")
      .eq("sequence_id", sequenceId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = ((last?.position as number) ?? 0) + 1;
    await admin
      .from("newsletter_sequence_steps")
      .insert({ sequence_id: sequenceId, position, ...payload });
  }
  revalidatePath(`/admin/newsletter/sequences/${sequenceId}`);
  redirect(`/admin/newsletter/sequences/${sequenceId}`);
}

export async function deleteStepAction(
  formData: FormData
): Promise<ActionResult> {
  const { admin } = await requireAdmin();
  const sequenceId = String(formData.get("sequenceId"));
  const stepId = String(formData.get("stepId"));
  await admin.from("newsletter_sequence_steps").delete().eq("id", stepId);
  // przenumeruj pozostałe kroki, żeby pozycje były ciągłe
  const { data: rest } = await admin
    .from("newsletter_sequence_steps")
    .select("id")
    .eq("sequence_id", sequenceId)
    .order("position", { ascending: true });
  let pos = 1;
  for (const r of rest ?? []) {
    await admin
      .from("newsletter_sequence_steps")
      .update({ position: pos++ })
      .eq("id", r.id);
  }
  revalidatePath(`/admin/newsletter/sequences/${sequenceId}`);
  return { ok: true };
}

/** Wyślij test danego kroku na adres admina. */
export async function sendStepTestAction(
  formData: FormData
): Promise<ActionResult> {
  const { admin, email } = await requireAdmin();
  const stepId = String(formData.get("stepId"));
  if (!email) return { ok: false, error: "Brak adresu e-mail admina." };

  const { data: step } = await admin
    .from("newsletter_sequence_steps")
    .select("subject, preheader, content, cta_label, cta_url")
    .eq("id", stepId)
    .maybeSingle();
  if (!step) return { ok: false, error: "Nie znaleziono kroku." };

  await queueAndSend("newsletter_campaign", email, {
    subject: `[TEST] ${step.subject}`,
    preheader: step.preheader,
    contentHtml: renderCampaignContent(step.content, step.cta_label, step.cta_url),
    unsubscribeUrl: `${await siteUrl()}/newsletter/wypisano?status=ok`,
  });
  return { ok: true };
}
