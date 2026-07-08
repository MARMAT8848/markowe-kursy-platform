import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Nie znaleziono strony - MARKOWE KURSY",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">BŁĄD 404</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
            }}
          >
            Nie znaleziono takiej strony
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--sub)",
              maxWidth: 560,
            }}
          >
            Adres mógł się zmienić albo w linku wkradła się literówka.
            Zajrzyj do katalogu kursów lub wróć na stronę główną.
          </p>
        </div>
      </section>
      <section style={{ padding: "32px 0 56px", background: "#fff" }}>
        <div className="wrap" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/courses">
            Katalog kursów
          </Link>
          <Link className="btn" href="/">
            Strona główna
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
