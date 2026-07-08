import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatCard, StatusPill } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import EmailPreviewFrame from "@/components/admin/EmailPreviewFrame";
import { renderCampaignContent } from "@/lib/newsletter";
import { PUBLIC_SITE } from "@/lib/site-url";
import { renderEmail } from "@/lib/emails/templates";
import {
  deleteCampaignAction,
  resumeCampaignAction,
  sendCampaignAction,
  sendTestAction,
} from "@/app/admin/newsletter/actions";

export const metadata: Metadata = {
  title: "Kampania - Panel admina",
  robots: { index: false },
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { admin, email } = await requireAdmin();

  const { data: c } = await admin
    .from("newsletter_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  const head = { count: "exact" as const, head: true };
  const [subscribers, queued, sent, failed] = await Promise.all([
    admin
      .from("newsletter_subscribers")
      .select("*", head)
      .eq("status", "subscribed"),
    admin.from("email_outbox").select("*", head).eq("campaign_id", id).eq("status", "queued"),
    admin.from("email_outbox").select("*", head).eq("campaign_id", id).eq("status", "sent"),
    admin.from("email_outbox").select("*", head).eq("campaign_id", id).eq("status", "failed"),
  ]).then((r) => r.map((x) => x.count ?? 0));

  const { html } = renderEmail("newsletter_campaign", {
    subject: c.subject,
    preheader: c.preheader,
    contentHtml: renderCampaignContent(
      c.content as string,
      c.cta_label as string | null,
      c.cta_url as string | null
    ),
    unsubscribeUrl: `${PUBLIC_SITE}/newsletter/wypisano?status=ok`,
  });

  const isDraft = c.status === "draft";

  return (
    <>
      <p style={{ margin: "0 0 8px" }}>
        <Link
          href="/admin/newsletter"
          style={{ font: "600 12.5px var(--sans)", color: "var(--sub)", textDecoration: "none" }}
        >
          ← Wróć do listy kampanii
        </Link>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <AdminH1>{c.subject as string}</AdminH1>
        <span style={{ marginBottom: 20 }}>
          <StatusPill status={c.status as string} />
        </span>
      </div>

      {!isDraft && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
          <StatCard label="ODBIORCY" value={c.recipients_count as number} />
          <StatCard label="WYSŁANE" value={sent} />
          <StatCard
            label="W KOLEJCE"
            value={queued}
            hint={queued > 0 ? "czekają na Resend / cron" : undefined}
          />
          <StatCard label="NIEUDANE" value={failed} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <ActionButton
          action={sendTestAction}
          fields={{ campaignId: id }}
          label={`Wyślij test na ${email ?? "mój adres"}`}
          pendingLabel="Wysyłanie…"
          subtle
        />
        {isDraft && (
          <>
            <ActionButton
              action={sendCampaignAction}
              fields={{ campaignId: id }}
              label={`Wyślij do ${subscribers} subskrybentów`}
              pendingLabel="Kolejkowanie…"
              confirmMsg={`Wysłać kampanię do ${subscribers} potwierdzonych subskrybentów? Tej operacji nie można cofnąć.`}
              danger
            />
            <ActionButton
              action={deleteCampaignAction}
              fields={{ campaignId: id }}
              label="Usuń szkic"
              confirmMsg="Usunąć ten szkic kampanii?"
              subtle
            />
          </>
        )}
        {!isDraft && queued > 0 && (
          <ActionButton
            action={resumeCampaignAction}
            fields={{ campaignId: id }}
            label={`Doślij zaległe (${queued})`}
            pendingLabel="Wysyłanie…"
            subtle
          />
        )}
      </div>

      {isDraft && (
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 12.5,
            color: "var(--sub)",
            maxWidth: 640,
          }}
        >
          Test trafia wyłącznie na Twój adres (z dopiskiem [TEST] w temacie).
          Wysyłka do subskrybentów obejmie tylko osoby z potwierdzonym zapisem
          (double opt-in) - każda wiadomość dostanie osobisty link wypisu.
        </p>
      )}

      <h2 style={{ margin: "0 0 12px", font: "600 16px var(--sans)", color: "var(--ink)" }}>
        Podgląd wiadomości
      </h2>
      <div style={{ maxWidth: 720 }}>
        <EmailPreviewFrame html={html} />
      </div>
    </>
  );
}
