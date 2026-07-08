import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";

/**
 * Dyskretna stopka — jedyny celowy dodatek względem projektu 1:1.
 * Wymagana prawnie: dokumenty (regulamin, polityki) muszą być łatwo
 * dostępne z każdej strony; wymaga tego też Stripe.
 * Górny rząd: zapis do newslettera (double opt-in).
 */
export default function SiteFooter() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "var(--bg-dark)",
        borderTop: "1px solid #2A2A2A",
      }}
    >
      <div
        className="wrap"
        style={{ padding: "22px 34px 4px" }}
      >
        <NewsletterSignup />
      </div>
      <div
        className="wrap"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px 22px",
          padding: "14px 34px 18px",
        }}
      >
        <span
          style={{
            font: "600 12px var(--sans)",
            letterSpacing: "-.01em",
            color: "#fff",
          }}
        >
          MARKOWE <span style={{ color: "var(--accent)" }}>KURSY</span>
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            color: "#6F6F6F",
          }}
        >
          © {new Date().getFullYear()}
        </span>
        <span style={{ flex: 1 }}></span>
        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 18px",
          }}
        >
          {[
            { label: "Regulamin", href: "/regulamin" },
            { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
            { label: "Polityka cookies", href: "/polityka-cookies" },
            { label: "Zwroty i reklamacje", href: "/zwroty-i-reklamacje" },
            { label: "Kontakt", href: "/kontakt" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                font: "500 11.5px var(--sans)",
                color: "#9C9B98",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
