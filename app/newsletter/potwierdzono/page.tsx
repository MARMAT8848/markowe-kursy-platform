import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Newsletter - MARKOWE KURSY",
  robots: { index: false },
};

export default async function NewsletterConfirmedPage({
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
            {ok ? "Zapis potwierdzony. Witamy!" : "Nieprawidłowy link"}
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
              ? "Od teraz będziesz otrzymywać informacje o nowych kursach, lekcjach i promocjach. Z newslettera możesz wypisać się w każdej chwili - link znajdziesz w stopce każdej wiadomości."
              : "Link potwierdzający jest niekompletny lub nieaktualny. Zapisz się ponownie w stopce strony - wyślemy nowy."}
          </p>
        </div>
      </section>
      <section style={{ padding: "32px 0 56px", background: "#fff" }}>
        <div className="wrap">
          <Link className="btn btn-primary" href="/courses">
            Zobacz kursy
          </Link>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
