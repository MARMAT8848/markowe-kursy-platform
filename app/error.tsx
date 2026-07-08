"use client";

import Link from "next/link";

/**
 * Globalna strona błędu (App Router wymaga komponentu klienckiego).
 * Bez SiteHeader/SiteFooter - te są serwerowe; tu minimalny, spójny layout.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div
          style={{
            font: "600 11px var(--mono)",
            letterSpacing: ".14em",
            color: "var(--accent)",
            marginBottom: 14,
          }}
        >
          COŚ POSZŁO NIE TAK
        </div>
        <h1
          style={{
            margin: "0 0 12px",
            font: "600 26px/1.2 var(--sans)",
            letterSpacing: "-.03em",
            color: "var(--ink)",
          }}
        >
          Wystąpił nieoczekiwany błąd
        </h1>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--sub)",
          }}
        >
          Spróbuj ponownie - jeśli problem będzie się powtarzał, napisz do nas
          przez stronę kontaktową, a szybko się tym zajmiemy.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => reset()}>
            Spróbuj ponownie
          </button>
          <Link className="btn" href="/">
            Strona główna
          </Link>
        </div>
      </div>
    </main>
  );
}
