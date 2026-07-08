import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatCard } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import {
  deleteMessageAction,
  toggleHandledAction,
} from "@/app/admin/messages/actions";

export const metadata: Metadata = {
  title: "Wiadomości - Panel admina",
  robots: { index: false },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pl-PL") : "-";

export default async function AdminMessagesPage() {
  const { admin } = await requireAdmin();

  const { data: messages } = await admin
    .from("contact_messages")
    .select("id, name, email, topic, message, handled_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const all = messages ?? [];
  const open = all.filter((m) => !m.handled_at);
  const handled = all.filter((m) => m.handled_at);

  return (
    <>
      <AdminH1>Wiadomości z formularza</AdminH1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "6px 0 28px" }}>
        <StatCard label="DO OBSŁUŻENIA" value={open.length} />
        <StatCard label="ZAŁATWIONE" value={handled.length} />
      </div>

      {all.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--sub)" }}>
          Brak wiadomości. Gdy ktoś napisze przez stronę Kontakt, zobaczysz
          to tutaj.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
          {[...open, ...handled].map((m) => {
            const isHandled = Boolean(m.handled_at);
            return (
              <article
                key={m.id as string}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "16px 18px",
                  background: isHandled ? "#FBFBFA" : "#fff",
                  opacity: isHandled ? 0.75 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ font: "600 14px var(--sans)", color: "var(--ink)" }}>
                    {m.name as string}
                  </strong>
                  <a
                    href={`mailto:${m.email as string}`}
                    style={{ font: "400 12.5px var(--mono)", color: "var(--sub)" }}
                  >
                    {m.email as string}
                  </a>
                  <span
                    style={{
                      font: "600 10.5px var(--mono)",
                      letterSpacing: ".08em",
                      color: "var(--accent)",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.topic as string}
                  </span>
                  <span style={{ marginLeft: "auto", font: "400 11.5px var(--mono)", color: "var(--muted)" }}>
                    {fmt(m.created_at as string)}
                  </span>
                </div>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "var(--ink)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.message as string}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <ActionButton
                    action={toggleHandledAction}
                    fields={{
                      messageId: m.id as string,
                      handled: String(isHandled),
                    }}
                    label={isHandled ? "Przywróć do obsłużenia" : "Oznacz jako załatwione"}
                    subtle
                  />
                  <ActionButton
                    action={deleteMessageAction}
                    fields={{ messageId: m.id as string }}
                    label="Usuń"
                    confirmMsg="Usunąć tę wiadomość bezpowrotnie?"
                    subtle
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
