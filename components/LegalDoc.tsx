import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { LegalDocument } from "@/lib/legal/consents";

/**
 * Renderer dokumentów prawnych. Treść dokumentu jest przechowywana
 * jako tekst (lib/legal/*) — dokładnie w brzmieniu dostarczonym przez
 * właściciela — i parsowana do nagłówków/akapitów.
 */
function renderBody(body: string) {
  const blocks: { type: "h2" | "h3" | "p"; text: string }[] = [];
  let para: string[] = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join("\n") });
      para = [];
    }
  };

  for (const raw of body.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4) });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.trim() === "") {
      flush();
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

export default function LegalDoc({ doc }: { doc: LegalDocument }) {
  const blocks = renderBody(doc.body);
  return (
    <>
      <SiteHeader />
      <section className="kontakt-head">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">DOKUMENTY PRAWNE</span>
          </div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "600 28px/1.15 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
              maxWidth: 760,
            }}
          >
            {doc.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            Data obowiązywania: {doc.effectiveDate} · Wersja dokumentu:{" "}
            {doc.version}
          </p>
        </div>
      </section>
      <section style={{ padding: "36px 0 56px", background: "#fff" }}>
        <div className="wrap">
          <article style={{ maxWidth: 820 }}>
            {blocks.map((b, i) =>
              b.type === "h2" ? (
                <h2
                  key={i}
                  style={{
                    margin: "34px 0 12px",
                    font: "600 19px/1.25 var(--sans)",
                    letterSpacing: "-.02em",
                    color: "var(--ink)",
                  }}
                >
                  {b.text}
                </h2>
              ) : b.type === "h3" ? (
                <h3
                  key={i}
                  style={{
                    margin: "22px 0 10px",
                    font: "600 15.5px/1.3 var(--sans)",
                    color: "var(--ink)",
                  }}
                >
                  {b.text}
                </h3>
              ) : (
                <p
                  key={i}
                  style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#3A3A3A",
                    whiteSpace: "pre-line",
                  }}
                >
                  {b.text}
                </p>
              )
            )}
          </article>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
