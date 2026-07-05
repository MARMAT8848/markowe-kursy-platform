import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, StatCard } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: "Panel admina — MARKOWE KURSY",
  robots: { index: false },
};

export default async function AdminOverviewPage() {
  const { admin } = await requireAdmin();
  const nowIso = new Date().toISOString();
  const head = { count: "exact" as const, head: true };

  const [users, activeEnr, certs, orders, paidOrders, coursesPublished] =
    await Promise.all([
      admin.from("profiles").select("*", head),
      admin
        .from("enrollments")
        .select("*", head)
        .eq("status", "active")
        .gt("access_expires_at", nowIso),
      admin.from("certificates").select("*", head).eq("status", "generated"),
      admin.from("orders").select("*", head),
      admin.from("orders").select("*", head).eq("status", "paid"),
      admin.from("courses").select("*", head).eq("status", "published"),
    ]).then((rows) => rows.map((r) => r.count ?? 0));

  return (
    <>
      <AdminH1>Przegląd</AdminH1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard label="UŻYTKOWNICY" value={users} />
        <StatCard label="AKTYWNE DOSTĘPY" value={activeEnr} />
        <StatCard label="CERTYFIKATY" value={certs} />
        <StatCard label="ZAMÓWIENIA (OPŁ./RAZEM)" value={`${paidOrders}/${orders}`} />
        <StatCard label="KURSY PUBLIKOWANE" value={coursesPublished} />
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 18,
          maxWidth: 620,
        }}
      >
        <div style={{ font: "600 14px var(--sans)", marginBottom: 10 }}>
          Najczęstsze operacje
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontSize: 13.5,
            lineHeight: 1.9,
            color: "var(--sub)",
          }}
        >
          <li>
            <Link href="/admin/enrollments" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Dostępy
            </Link>{" "}
            — nadaj, przedłuż o 12 miesięcy lub cofnij dostęp do kursu.
          </li>
          <li>
            <Link href="/admin/users" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Użytkownicy
            </Link>{" "}
            — nadaj komuś dostęp ręcznie (np. płatność offline).
          </li>
          <li>
            <Link href="/admin/courses" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Kursy
            </Link>{" "}
            — przełącz status publikacji (publikowany / wkrótce).
          </li>
          <li>
            <Link href="/admin/certificates" style={{ color: "var(--accent)", fontWeight: 600 }}>
              Certyfikaty
            </Link>{" "}
            — unieważnij lub wygeneruj ponownie.
          </li>
        </ul>
      </div>
    </>
  );
}
