"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin";
import { enqueueCampaign, processOutbox, queueAndSend } from "@/lib/emails";
import { renderCampaignContent } from "@/lib/newsletter";

/**
 * Akcje kampanii newslettera. Każda re-weryfikuje admina.
 * Wysyłka: kolejkowanie do email_outbox (payload z osobistym linkiem
 * wypisu per odbiorca) + natychmiastowa próba wysyłki paczki; resztę
 * dosyła cron process-outbox. Bez Resend wszystko czeka w kolejce.
 */

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

export async function createCampaignAction(formData: FormData) {
  const { admin, userId } = await requireAdmin();
  const subject = String(formData.get("subject") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!subject || !content) {
    redirect("/admin/newsletter/new?error=empty");
  }
  const { data: campaign, error } = await admin
    .from("newsletter_campaigns")
    .insert({
      subject,
      preheader: String(formData.get("preheader") ?? "").trim() || null,
      content,
      cta_label: String(formData.get("cta_label") ?? "").trim() || null,
      cta_url: String(formData.get("cta_url") ?? "").trim() || null,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !campaign) {
    redirect("/admin/newsletter/new?error=save");
  }
  revalidatePath("/admin/newsletter");
  redirect(`/admin/newsletter/${campaign.id}`);
}

export async function deleteCampaignAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get("campaignId"));
  // tylko szkice — wysłane kampanie zostają jako archiwum
  const { error } = await admin
    .from("newsletter_campaigns")
    .delete()
    .eq("id", id)
    .eq("status", "draft");
  revalidatePath("/admin/newsletter");
  if (!error) redirect("/admin/newsletter");
  return { ok: false, error: "Nie udało się usunąć szkicu." };
}

export async function sendTestAction(formData: FormData) {
  const { admin, email } = await requireAdmin();
  const id = String(formData.get("campaignId"));
  if (!email) return { ok: false, error: "Brak adresu e-mail admina." };

  const { data: c } = await admin
    .from("newsletter_campaigns")
    .select("subject, preheader, content, cta_label, cta_url")
    .eq("id", id)
    .maybeSingle();
  if (!c) return { ok: false, error: "Nie znaleziono kampanii." };

  await queueAndSend("newsletter_campaign", email, {
    subject: `[TEST] ${c.subject}`,
    preheader: c.preheader,
    contentHtml: renderCampaignContent(c.content, c.cta_label, c.cta_url),
    unsubscribeUrl: `${await siteUrl()}/newsletter/wypisano?status=ok`,
  });
  return {
    ok: true,
    error: undefined as string | undefined,
  };
}

export async function sendCampaignAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get("campaignId"));

  const { data: c } = await admin
    .from("newsletter_campaigns")
    .select("id, subject, preheader, content, cta_label, cta_url, status")
    .eq("id", id)
    .maybeSingle();
  if (!c) return { ok: false, error: "Nie znaleziono kampanii." };
  if (c.status !== "draft") {
    return { ok: false, error: "Kampania została już wysłana." };
  }

  const { data: subs } = await admin
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "subscribed");
  if (!subs || subs.length === 0) {
    return { ok: false, error: "Brak potwierdzonych subskrybentów." };
  }

  const site = await siteUrl();
  const contentHtml = renderCampaignContent(c.content, c.cta_label, c.cta_url);
  const recipients = subs.map((s) => ({
    email: s.email as string,
    payload: {
      subject: c.subject,
      preheader: c.preheader,
      contentHtml,
      unsubscribeUrl: `${site}/api/newsletter/unsubscribe?token=${s.unsubscribe_token}`,
      campaignId: c.id,
    },
  }));

  const queued = await enqueueCampaign(c.id, c.subject, recipients);
  await admin
    .from("newsletter_campaigns")
    .update({
      status: "sending",
      recipients_count: queued,
      sent_at: new Date().toISOString(),
    })
    .eq("id", c.id);

  // natychmiastowa próba (bez Resend: no-op, kolejka czeka na cron)
  await processOutbox(100);
  await refreshCampaignStatus(id);

  revalidatePath(`/admin/newsletter/${id}`);
  revalidatePath("/admin/newsletter");
  return { ok: true, error: undefined as string | undefined };
}

export async function resumeCampaignAction(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get("campaignId"));
  void admin;
  await processOutbox(200);
  await refreshCampaignStatus(id);
  revalidatePath(`/admin/newsletter/${id}`);
  return { ok: true, error: undefined as string | undefined };
}

/** 'sending' -> 'sent', gdy w outboxie nie ma już nic w kolejce. */
async function refreshCampaignStatus(campaignId: string) {
  const { admin } = await requireAdmin();
  const { count: queued } = await admin
    .from("email_outbox")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", "queued");
  if ((queued ?? 0) === 0) {
    await admin
      .from("newsletter_campaigns")
      .update({ status: "sent" })
      .eq("id", campaignId)
      .eq("status", "sending");
  }
}
