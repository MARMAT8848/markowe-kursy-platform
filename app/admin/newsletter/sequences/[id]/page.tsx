import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatCard, StatusPill } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import FormButton from "@/components/admin/FormButton";
import EmailPreviewFrame from "@/components/admin/EmailPreviewFrame";
import { renderCampaignContent } from "@/lib/newsletter";
import { renderEmail } from "@/lib/emails/templates";
import { PUBLIC_SITE } from "@/lib/site-url";
import {
  deleteSequenceAction,
  deleteStepAction,
  saveStepAction,
  sendStepTestAction,
  toggleSequenceStatusAction,
} from "@/app/admin/newsletter/sequences/actions";

export const metadata: Metadata = {
  title: "Lejek - Panel admina",
  robots: { index: false },
};

const field = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid var(--border)",
  borderRadius: 8,
  font: "13.5px var(--sans)",
  background: "#fff",
  color: "var(--ink)",
} as const;
const label = {
  display: "block",
  font: "600 12px var(--sans)",
  color: "var(--ink)",
  margin: "0 0 5px",
} as const;

function StepForm({
  sequenceId,
  step,
}: {
  sequenceId: string;
  step?: {
    id: string;
    position: number;
    delay_days: number;
    subject: string;
    preheader: string | null;
    content: string;
    cta_label: string | null;
    cta_url: string | null;
  };
}) {
  return (
    <form
      action={saveStepAction}
      style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}
    >
      <input type="hidden" name="sequenceId" value={sequenceId} />
      {step && <input type="hidden" name="stepId" value={step.id} />}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "0 0 130px" }}>
          <label style={label}>Odstęp (dni)</label>
          <input
            type="number"
            name="delay_days"
            min={0}
            defaultValue={step?.delay_days ?? 2}
            style={field}
          />
        </div>
        <div style={{ flex: "1 1 300px" }}>
          <label style={label}>Temat *</label>
          <input name="subject" required maxLength={140} defaultValue={step?.subject ?? ""} style={field} />
        </div>
      </div>
      <div>
        <label style={label}>Preheader (podgląd w skrzynce)</label>
        <input name="preheader" maxLength={140} defaultValue={step?.preheader ?? ""} style={field} />
      </div>
      <div>
        <label style={label}>Treść *</label>
        <textarea
          name="content"
          required
          rows={8}
          defaultValue={step?.content ?? ""}
          style={{ ...field, resize: "vertical", lineHeight: 1.6 }}
        />
        <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
          {'Pusta linia = nowy akapit, „## ” na początku linii = śródtytuł.'}
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label style={label}>Przycisk CTA - etykieta</label>
          <input name="cta_label" maxLength={60} defaultValue={step?.cta_label ?? ""} style={field} />
        </div>
        <div style={{ flex: "2 1 280px" }}>
          <label style={label}>Przycisk CTA - adres (https://…)</label>
          <input name="cta_url" type="url" defaultValue={step?.cta_url ?? ""} style={field} />
        </div>
      </div>
      <div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "var(--ink)",
            color: "#fff",
            font: "600 13px var(--sans)",
            cursor: "pointer",
          }}
        >
          {step ? "Zapisz zmiany" : "Dodaj krok"}
        </button>
      </div>
    </form>
  );
}

export default async function SequenceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { admin, email } = await requireAdmin();

  const { data: seq } = await admin
    .from("newsletter_sequences")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!seq) notFound();

  const { data: steps } = await admin
    .from("newsletter_sequence_steps")
    .select("*")
    .eq("sequence_id", id)
    .order("position", { ascending: true });

  const head = { count: "exact" as const, head: true };
  const [inProgress, completed] = await Promise.all([
    admin
      .from("newsletter_sequence_progress")
      .select("*", head)
      .eq("sequence_id", id)
      .is("completed_at", null)
      .is("stopped_reason", null),
    admin
      .from("newsletter_sequence_progress")
      .select("*", head)
      .eq("sequence_id", id)
      .not("completed_at", "is", null),
  ]).then((r) => r.map((x) => x.count ?? 0));

  const isActive = seq.status === "active";
  const allSteps = steps ?? [];
  // dzień skumulowany (od zapisu) dla czytelności osi czasu — liczone z góry,
  // bez mutacji w trakcie renderu (reguła react-hooks/immutability)
  const cumulativeDays: number[] = [];
  allSteps.reduce((acc, s) => {
    const next = acc + (s.delay_days as number);
    cumulativeDays.push(next);
    return next;
  }, 0);

  return (
    <>
      <p style={{ margin: "0 0 8px" }}>
        <Link
          href="/admin/newsletter/sequences"
          style={{ font: "600 12.5px var(--sans)", color: "var(--sub)", textDecoration: "none" }}
        >
          ← Wróć do lejków
        </Link>
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <AdminH1>{seq.name as string}</AdminH1>
        <span style={{ marginBottom: 20 }}>
          <StatusPill status={seq.status as string} />
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "0 0 20px" }}>
        <StatCard label="KROKÓW" value={allSteps.length} />
        <StatCard label="W TRAKCIE" value={inProgress} hint="osób w lejku teraz" />
        <StatCard label="UKOŃCZYŁO" value={completed} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <ActionButton
          action={toggleSequenceStatusAction}
          fields={{ sequenceId: id, activate: String(!isActive) }}
          label={isActive ? "Wstrzymaj lejek" : "Aktywuj lejek"}
          confirmMsg={
            isActive
              ? "Wstrzymać lejek? Zaplanowane wiadomości poczekają do wznowienia."
              : "Aktywować lejek? Nowi potwierdzeni subskrybenci zaczną go otrzymywać, a pierwsza wiadomość wyjdzie od razu po zapisie."
          }
          danger={isActive}
        />
        <FormButton
          action={deleteSequenceAction}
          fields={{ sequenceId: id }}
          label="Usuń lejek"
          confirmMsg="Usunąć cały lejek wraz z krokami? Tej operacji nie można cofnąć."
          variant="subtle"
        />
      </div>
      <p style={{ margin: "0 0 24px", fontSize: 12.5, color: "var(--sub)", maxWidth: 700 }}>
        {isActive
          ? "Lejek jest AKTYWNY - potwierdzeni subskrybenci przechodzą przez kolejne kroki automatycznie. Wypis lub zakup kursu zatrzymuje lejek dla danej osoby."
          : "Lejek jest wstrzymany - nikt nie dostaje wiadomości. Ułóż kroki, przetestuj na swoim adresie, a potem aktywuj."}
      </p>

      {error === "empty" && (
        <p style={{ margin: "0 0 16px", padding: "10px 14px", background: "#FCE8E9", color: "var(--accent)", borderRadius: 9, fontSize: 13, maxWidth: 640, fontWeight: 600 }}>
          Temat i treść kroku są wymagane.
        </p>
      )}

      <h2 style={{ margin: "0 0 14px", font: "600 16px var(--sans)", color: "var(--ink)" }}>
        Kroki lejka
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
        {allSteps.map((s, i) => {
          const cumulative = cumulativeDays[i];
          const previewHtml = renderEmail("newsletter_campaign", {
            subject: s.subject,
            preheader: s.preheader,
            contentHtml: renderCampaignContent(
              s.content as string,
              s.cta_label as string | null,
              s.cta_url as string | null
            ),
            unsubscribeUrl: `${PUBLIC_SITE}/newsletter/wypisano?status=ok`,
          }).html;
          return (
            <article
              key={s.id as string}
              style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", background: "#fff" }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ font: "700 12px var(--mono)", color: "var(--accent)" }}>
                  KROK {s.position as number}
                </span>
                <span style={{ font: "500 11.5px var(--mono)", color: "var(--muted)" }}>
                  {(s.delay_days as number) === 0
                    ? "od razu po zapisie"
                    : `+${s.delay_days} dni od poprzedniego`}{" "}
                  · dzień {cumulative} lejka
                </span>
              </div>
              <strong style={{ display: "block", margin: "6px 0 4px", font: "600 15px var(--sans)", color: "var(--ink)" }}>
                {s.subject as string}
              </strong>
              {s.preheader && (
                <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--sub)" }}>
                  {s.preheader as string}
                </p>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <ActionButton
                  action={sendStepTestAction}
                  fields={{ stepId: s.id as string }}
                  label={`Test na ${email ?? "mój adres"}`}
                  pendingLabel="Wysyłanie…"
                  subtle
                />
                <ActionButton
                  action={deleteStepAction}
                  fields={{ sequenceId: id, stepId: s.id as string }}
                  label="Usuń krok"
                  confirmMsg="Usunąć ten krok? Pozostałe zostaną przenumerowane."
                  subtle
                />
              </div>

              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", font: "600 12.5px var(--sans)", color: "var(--sub)" }}>
                  Podgląd wiadomości
                </summary>
                <div style={{ maxWidth: 620, marginTop: 10 }}>
                  <EmailPreviewFrame html={previewHtml} />
                </div>
              </details>
              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: "pointer", font: "600 12.5px var(--sans)", color: "var(--sub)" }}>
                  Edytuj krok
                </summary>
                <StepForm
                  sequenceId={id}
                  step={{
                    id: s.id as string,
                    position: s.position as number,
                    delay_days: s.delay_days as number,
                    subject: s.subject as string,
                    preheader: s.preheader as string | null,
                    content: s.content as string,
                    cta_label: s.cta_label as string | null,
                    cta_url: s.cta_url as string | null,
                  }}
                />
              </details>
            </article>
          );
        })}
      </div>

      <details style={{ marginTop: 20, maxWidth: 820 }}>
        <summary
          style={{
            cursor: "pointer",
            display: "inline-block",
            padding: "10px 18px",
            borderRadius: 9,
            background: "var(--accent)",
            color: "#fff",
            font: "600 13px var(--sans)",
          }}
        >
          + Dodaj krok
        </summary>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginTop: 10 }}>
          <StepForm sequenceId={id} />
        </div>
      </details>
    </>
  );
}
