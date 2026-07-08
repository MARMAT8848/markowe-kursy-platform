import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Płatność anulowana - MARKOWE KURSY",
};

export default function CheckoutCancelPage() {
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
            Płatność została anulowana
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
            Nic nie zostało pobrane z Twojego konta. Możesz wrócić do kursu i spróbować ponownie w dowolnym momencie.
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
