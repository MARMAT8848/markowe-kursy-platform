import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1 } from "@/components/admin/ui";
import { createCampaignAction } from "@/app/admin/newsletter/actions";

export const metadata: Metadata = {
  title: "Nowa kampania - Panel admina",
  robots: { index: false },
};

const field = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: 9,
  font: "14px var(--sans)",
  background: "#fff",
  color: "var(--ink)",
} as const;

const label = {
  display: "block",
  font: "600 12.5px var(--sans)",
  color: "var(--ink)",
  marginBottom: 6,
} as const;

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <>
      <AdminH1>Nowa kampania</AdminH1>
      {error && (
        <p
          style={{
            margin: "0 0 18px",
            padding: "10px 14px",
            background: "#FCE8E9",
            color: "var(--accent)",
            borderRadius: 9,
            fontSize: 13,
            maxWidth: 640,
            fontWeight: 600,
          }}
        >
          {error === "empty"
            ? "Temat i treść są wymagane."
            : "Nie udało się zapisać kampanii. Spróbuj ponownie."}
        </p>
      )}

      <form
        action={createCampaignAction}
        style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 640 }}
      >
        <div>
          <label style={label} htmlFor="subject">
            Temat wiadomości *
          </label>
          <input
            id="subject"
            name="subject"
            required
            maxLength={140}
            placeholder="np. Nowy kurs: Trójniki - już dostępny"
            style={field}
          />
        </div>

        <div>
          <label style={label} htmlFor="preheader">
            Preheader (podgląd w skrzynce, opcjonalnie)
          </label>
          <input
            id="preheader"
            name="preheader"
            maxLength={140}
            placeholder="krótkie zdanie widoczne obok tematu"
            style={field}
          />
        </div>

        <div>
          <label style={label} htmlFor="content">
            Treść *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            placeholder={
              "Pusta linia rozdziela akapity.\n\n## Linia zaczynająca się od ## to śródtytuł\n\nTreść jest zawsze osadzana w markowym szablonie z logo - o wygląd nie musisz dbać."
            }
            style={{ ...field, resize: "vertical", lineHeight: 1.6 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
            Format: pusta linia = nowy akapit, „## ” na początku linii =
            śródtytuł. Link wypisu dokleja się automatycznie do każdej
            wiadomości.
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}>
            <label style={label} htmlFor="cta_label">
              Przycisk CTA - etykieta (opcjonalnie)
            </label>
            <input
              id="cta_label"
              name="cta_label"
              maxLength={60}
              placeholder="np. Zobacz kurs"
              style={field}
            />
          </div>
          <div style={{ flex: "2 1 300px" }}>
            <label style={label} htmlFor="cta_url">
              Przycisk CTA - adres (https://…)
            </label>
            <input
              id="cta_url"
              name="cta_url"
              type="url"
              placeholder="https://markowekursy.pl/courses/…"
              style={field}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            style={{
              padding: "11px 22px",
              borderRadius: 9,
              border: "none",
              background: "var(--ink)",
              color: "#fff",
              font: "600 13.5px var(--sans)",
              cursor: "pointer",
            }}
          >
            Zapisz szkic i przejdź do podglądu
          </button>
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--muted)" }}>
            Nic nie zostanie wysłane - wysyłkę uruchamiasz osobno z podglądu,
            po obejrzeniu wiadomości i teście na własny adres.
          </p>
        </div>
      </form>
    </>
  );
}
