import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, Table, Td, StatusPill } from "@/components/admin/ui";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Zamówienia - Panel admina",
  robots: { index: false },
};

const fmtDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pl-PL") : "-";
const zl = (grosze: number) => `${(grosze / 100).toFixed(2)} zł`;

export default async function AdminOrdersPage() {
  const { admin } = await requireAdmin();

  const { data: orders } = await admin
    .from("orders")
    .select(
      "id, status, amount, currency, created_at, customer_email, terms_accepted_at, courses(slug), profiles(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <>
      <AdminH1>Zamówienia</AdminH1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "var(--sub)", maxWidth: 660 }}>
        Widok tylko do odczytu. Zamówienia pojawią się po uruchomieniu płatności
        (Stripe). Każde zawiera zapis zgód prawnych (data akceptacji Regulaminu
        w kolumnie „Zgody”).
      </p>
      <Table
        head={["Data", "Kursant", "Kurs", "Kwota", "Status", "Zgody"]}
      >
        {(orders ?? []).map((o) => {
          const slug =
            (o.courses as unknown as { slug: string } | null)?.slug ?? "";
          const prof = o.profiles as unknown as { full_name: string } | null;
          return (
            <tr key={o.id as string}>
              <Td mono>{fmtDateTime(o.created_at as string)}</Td>
              <Td>
                <div style={{ fontWeight: 600 }}>{prof?.full_name || "-"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {o.customer_email}
                </div>
              </Td>
              <Td>{getCourse(slug)?.title ?? slug}</Td>
              <Td mono>{zl(o.amount as number)}</Td>
              <Td>
                <StatusPill status={o.status as string} />
              </Td>
              <Td mono color={o.terms_accepted_at ? "#2E7D46" : "var(--muted)"}>
                {o.terms_accepted_at ? "✓ zapisane" : "-"}
              </Td>
            </tr>
          );
        })}
      </Table>
      {(orders ?? []).length === 0 && (
        <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 13 }}>
          Brak zamówień (płatności jeszcze nieuruchomione).
        </p>
      )}
    </>
  );
}
