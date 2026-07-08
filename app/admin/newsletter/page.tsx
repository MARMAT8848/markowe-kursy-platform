import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatCard, StatusPill, Table, Td } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Newsletter - Panel admina",
  robots: { index: false },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pl-PL") : "—";

export default async function AdminNewsletterPage() {
  const { admin } = await requireAdmin();
  const head = { count: "exact" as const, head: true };

  const [subscribed, pending, unsubscribed] = await Promise.all([
    admin.from("newsletter_subscribers").select("*", head).eq("status", "subscribed"),
    admin.from("newsletter_subscribers").select("*", head).eq("status", "pending"),
    admin.from("newsletter_subscribers").select("*", head).eq("status", "unsubscribed"),
  ]).then((r) => r.map((x) => x.count ?? 0));

  const { data: campaigns } = await admin
    .from("newsletter_campaigns")
    .select("id, subject, status, recipients_count, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: recentSubs } = await admin
    .from("newsletter_subscribers")
    .select("email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <AdminH1>Newsletter</AdminH1>
        <Link
          href="/admin/newsletter/new"
          style={{
            padding: "10px 18px",
            borderRadius: 9,
            background: "var(--accent)",
            color: "#fff",
            font: "600 13px var(--sans)",
            textDecoration: "none",
          }}
        >
          + Nowa kampania
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, margin: "6px 0 28px" }}>
        <StatCard label="SUBSKRYBENCI (POTWIERDZENI)" value={subscribed} />
        <StatCard
          label="OCZEKUJĄCY NA POTWIERDZENIE"
          value={pending}
          hint="double opt-in - czekają na klik w e-mailu"
        />
        <StatCard label="WYPISANI" value={unsubscribed} />
      </div>

      <h2 style={{ margin: "0 0 12px", font: "600 16px var(--sans)", color: "var(--ink)" }}>
        Kampanie
      </h2>
      {(campaigns ?? []).length === 0 ? (
        <p style={{ margin: "0 0 30px", fontSize: 13.5, color: "var(--sub)" }}>
          Brak kampanii. Utwórz pierwszą przyciskiem „Nowa kampania”.
        </p>
      ) : (
        <div style={{ marginBottom: 30 }}>
          <Table head={["Temat", "Status", "Odbiorcy", "Utworzona", "Wysłana"]}>
            {(campaigns ?? []).map((c) => (
              <tr key={c.id as string}>
                <Td>
                  <Link
                    href={`/admin/newsletter/${c.id}`}
                    style={{ color: "var(--ink)", fontWeight: 600, textDecoration: "none" }}
                  >
                    {c.subject as string}
                  </Link>
                </Td>
                <Td>
                  <StatusPill status={c.status as string} />
                </Td>
                <Td mono>{(c.recipients_count as number) || "—"}</Td>
                <Td mono>{fmt(c.created_at as string)}</Td>
                <Td mono>{fmt(c.sent_at as string)}</Td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <h2 style={{ margin: "0 0 12px", font: "600 16px var(--sans)", color: "var(--ink)" }}>
        Ostatni subskrybenci
      </h2>
      {(recentSubs ?? []).length === 0 ? (
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--sub)" }}>
          Jeszcze nikt się nie zapisał. Formularz jest w stopce każdej strony.
        </p>
      ) : (
        <div style={{ maxWidth: 620 }}>
          <Table head={["E-mail", "Status", "Zapis"]} minWidth={420}>
            {(recentSubs ?? []).map((s) => (
              <tr key={s.email as string}>
                <Td>{s.email as string}</Td>
                <Td>
                  <StatusPill status={s.status as string} />
                </Td>
                <Td mono>{fmt(s.created_at as string)}</Td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </>
  );
}
