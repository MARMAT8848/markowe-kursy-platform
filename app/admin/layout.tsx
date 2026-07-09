import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const NAV = [
  { href: "/admin", label: "Przegląd" },
  { href: "/admin/stats", label: "Statystyki" },
  { href: "/admin/enrollments", label: "Dostępy" },
  { href: "/admin/users", label: "Użytkownicy" },
  { href: "/admin/courses", label: "Kursy" },
  { href: "/admin/certificates", label: "Certyfikaty" },
  { href: "/admin/orders", label: "Zamówienia" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/messages", label: "Wiadomości" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bramka na poziomie layoutu (dodatkowo każda strona re-weryfikuje).
  const { email, admin } = await requireAdmin();

  // Liczba nieobsłużonych wiadomości z formularza → czerwony badge przy
  // pozycji „Wiadomości". Zapytanie działa przy każdym wejściu do panelu
  // (layout renderuje się dynamicznie, bo requireAdmin czyta ciasteczka).
  const { count: unreadMessages } = await admin
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .is("handled_at", null);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "12px 34px",
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <Link
          href="/admin"
          style={{
            font: "700 16px var(--sans)",
            letterSpacing: "-.02em",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          MARKOWE <span style={{ color: "var(--accent)" }}>KURSY</span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".14em",
              color: "#9C9B98",
              marginLeft: 10,
            }}
          >
            PANEL ADMINA
          </span>
        </Link>
        <nav
          style={{
            display: "flex",
            gap: 18,
            marginLeft: 8,
            flexWrap: "wrap",
            font: "500 13px var(--sans)",
          }}
        >
          {NAV.map((n) => {
            const badge =
              n.href === "/admin/messages" && (unreadMessages ?? 0) > 0
                ? unreadMessages
                : null;
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  color: "#D8D6D4",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {n.label}
                {badge != null && (
                  <span
                    aria-label={`${badge} nieprzeczytanych wiadomości`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 17,
                      height: 17,
                      padding: "0 5px",
                      borderRadius: 999,
                      background: "var(--accent)",
                      color: "#fff",
                      font: "700 10.5px var(--mono)",
                      lineHeight: 1,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div style={{ flex: 1 }}></div>
        <span
          style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#9C9B98" }}
        >
          {email}
        </span>
        <Link
          href="/dashboard"
          style={{ font: "600 12px var(--sans)", color: "#fff", textDecoration: "none" }}
        >
          ← Panel kursanta
        </Link>
      </header>
      <main style={{ padding: "28px 34px 60px", maxWidth: 1200, margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
