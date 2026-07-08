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
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bramka na poziomie layoutu (dodatkowo każda strona re-weryfikuje).
  const { email } = await requireAdmin();

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
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{ color: "#D8D6D4", textDecoration: "none" }}
            >
              {n.label}
            </Link>
          ))}
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
