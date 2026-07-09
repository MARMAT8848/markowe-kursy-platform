import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatusPill } from "@/components/admin/ui";
import FormButton from "@/components/admin/FormButton";
import { seedFunnelAction } from "@/app/admin/newsletter/sequences/actions";

export const metadata: Metadata = {
  title: "Lejki sprzedażowe - Panel admina",
  robots: { index: false },
};

export default async function SequencesPage() {
  const { admin } = await requireAdmin();

  const { data: sequences } = await admin
    .from("newsletter_sequences")
    .select("id, name, description, status, created_at")
    .order("created_at", { ascending: false });

  // liczby kroków i osób w trakcie – per sekwencja
  const ids = (sequences ?? []).map((s) => s.id as string);
  const stepCounts: Record<string, number> = {};
  const activeCounts: Record<string, number> = {};
  if (ids.length) {
    const { data: steps } = await admin
      .from("newsletter_sequence_steps")
      .select("sequence_id")
      .in("sequence_id", ids);
    for (const s of steps ?? [])
      stepCounts[s.sequence_id as string] =
        (stepCounts[s.sequence_id as string] ?? 0) + 1;
    const { data: prog } = await admin
      .from("newsletter_sequence_progress")
      .select("sequence_id")
      .in("sequence_id", ids)
      .is("completed_at", null)
      .is("stopped_reason", null);
    for (const p of prog ?? [])
      activeCounts[p.sequence_id as string] =
        (activeCounts[p.sequence_id as string] ?? 0) + 1;
  }

  return (
    <>
      <p style={{ margin: "0 0 8px" }}>
        <Link
          href="/admin/newsletter"
          style={{ font: "600 12.5px var(--sans)", color: "var(--sub)", textDecoration: "none" }}
        >
          ← Wróć do newslettera
        </Link>
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <AdminH1>Lejki sprzedażowe</AdminH1>
        {(sequences ?? []).length === 0 && (
          <FormButton
            action={seedFunnelAction}
            label="+ Wgraj gotowy lejek (7 wiadomości)"
          />
        )}
      </div>

      <p style={{ margin: "0 0 24px", fontSize: 13.5, lineHeight: 1.6, color: "var(--sub)", maxWidth: 720 }}>
        Lejek to automatyczna seria wiadomości wysyłana krok po kroku od momentu
        potwierdzenia zapisu - od pierwszego kontaktu (wartość, zaufanie) aż po
        propozycję zakupu kursu. Wypis lub zakup kursu zatrzymuje lejek dla danej
        osoby. Wiadomości wychodzą raz dziennie (cron), pierwsza od razu po zapisie.
      </p>

      {(sequences ?? []).length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 14,
            padding: "28px 24px",
            maxWidth: 720,
            background: "#FBFBFA",
          }}
        >
          <h2 style={{ margin: "0 0 8px", font: "600 16px var(--sans)", color: "var(--ink)" }}>
            Zacznij od gotowego lejka
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.6, color: "var(--sub)" }}>
            Wgramy sprawdzony lejek powitalny (model TOFU → MOFU → BOFU): 7
            wiadomości prowadzących od zapisu do zakupu. Wszystko możesz potem
            edytować, a lejek pozostaje wstrzymany, dopóki go nie aktywujesz.
          </p>
          <FormButton
            action={seedFunnelAction}
            label="Wgraj gotowy lejek (7 wiadomości)"
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 820 }}>
          {(sequences ?? []).map((s) => (
            <Link
              key={s.id as string}
              href={`/admin/newsletter/sequences/${s.id}`}
              style={{
                display: "block",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 18px",
                textDecoration: "none",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ font: "600 15px var(--sans)", color: "var(--ink)" }}>
                  {s.name as string}
                </strong>
                <StatusPill status={s.status as string} />
                <span style={{ marginLeft: "auto", font: "500 12px var(--mono)", color: "var(--muted)" }}>
                  {stepCounts[s.id as string] ?? 0} kroków · {activeCounts[s.id as string] ?? 0} w trakcie
                </span>
              </div>
              {s.description && (
                <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--sub)" }}>
                  {s.description as string}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
