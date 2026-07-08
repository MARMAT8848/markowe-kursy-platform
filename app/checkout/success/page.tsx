import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Dziękujemy za zamówienie - MARKOWE KURSY",
};

/**
 * Strona powrotu z płatności. Celowo NIE aktywuje dostępu do kursu —
 * dostęp nadaje wyłącznie zweryfikowany webhook operatora płatności.
 */
export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">ZAMÓWIENIE</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
            }}
          >
            Dziękujemy za zamówienie
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
            Płatność jest przetwarzana. Dostęp do kursu pojawi się na Twoim
            koncie automatycznie po potwierdzeniu płatności przez operatora -
            zwykle w ciągu kilku minut. Potwierdzenie zakupu wraz ze złożonymi
            zgodami wyślemy na Twój adres e-mail.
          </p>
        </div>
      </section>
      <section style={{ padding: "32px 0 56px", background: "#fff" }}>
        <div className="wrap" style={{ display: "flex", gap: 14 }}>
          <Link className="btn btn-primary" href="/courses">
            Wróć do kursów
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
