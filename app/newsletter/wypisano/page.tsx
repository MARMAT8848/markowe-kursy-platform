import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Newsletter - MARKOWE KURSY",
  robots: { index: false },
};

export default async function NewsletterUnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status !== "invalid";

  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">NEWSLETTER</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
            }}
          >
            {ok ? "Wypisano z newslettera" : "Nieprawidłowy link"}
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
            {ok
              ? "Nie będziemy już wysyłać newslettera na ten adres. Jeśli zmienisz zdanie, możesz zapisać się ponownie w stopce strony."
              : "Link wypisu jest niekompletny lub nieaktualny. Jeśli chcesz się wypisać, użyj linku ze stopki najnowszej wiadomości."}
          </p>
        </div>
      </section>
      <section style={{ padding: "32px 0 56px", background: "#fff" }}>
        <div className="wrap">
          <Link className="btn btn-primary" href="/">
            Wróć na stronę główną
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
