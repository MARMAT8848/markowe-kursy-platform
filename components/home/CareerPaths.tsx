import Link from "next/link";
import {
  CAREER_PATHS,
  maxSavingsLabel,
  pathCoursesCountLabel,
} from "@/lib/paths";

/**
 * Sekcja „Ścieżki kariery" — główny blok ofertowy strony głównej
 * (strategia: 5 ścieżek stanowiskowych). Każda karta prowadzi do
 * dedykowanej strony ścieżki (/sciezki/[slug]) z kursami dla danego
 * stanowiska i wyceną. Komunikat o oszczędności eksponowany.
 */
export default function CareerPaths() {
  return (
    <section
      style={{
        padding: "44px 0",
        background: "#fff",
        borderBottom: "1px solid var(--border-soft)",
      }}
    >
      <div className="wrap">
        <div className="featured-head">
          <div>
            <div className="kicker-row">
              <span className="kicker-line"></span>
              <span className="kicker">ŚCIEŻKI KARIERY</span>
            </div>
            <h2 className="section-h2">
              <span className="d-only">
                Wybierz ścieżkę dopasowaną do Twojego stanowiska
              </span>
              <span className="m-only">Wybierz swoją ścieżkę kariery</span>
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                lineHeight: 1.55,
                color: "var(--sub)",
                maxWidth: 560,
              }}
            >
              Ścieżka to zestaw kursów dla konkretnego stanowiska w jednej,
              niższej cenie — oszczędzasz nawet {maxSavingsLabel()} względem
              kupowania kursów osobno.
            </p>
          </div>
          <Link className="featured-link d-only" href="/courses">
            Zobacz wszystkie kursy →
          </Link>
        </div>
        <div className="course-grid" style={{ marginTop: 22 }}>
          {CAREER_PATHS.map((p) => {
            const savings = p.compareAtCents
              ? p.compareAtCents - p.priceCents
              : 0;
            return (
              <Link
                key={p.slug}
                className="course-card"
                href={`/sciezki/${p.slug}`}
              >
                <div
                  className="cc-head"
                  style={
                    p.imageUrl
                      ? {
                          background: `#fff url('${p.imageUrl}') center / cover no-repeat`,
                        }
                      : { background: "linear-gradient(158deg,#FAFAF9,#E2E1DD)" }
                  }
                >
                  {!p.imageUrl && (
                    <span className="cc-watermark" style={{ fontSize: 18 }}>
                      {p.name.toUpperCase()}
                    </span>
                  )}
                  {/* badge tylko dla kafelków bez obrazka — obecne ilustracje
                      mają plakietkę wtopioną */}
                  {p.badge && !p.imageUrl && (
                    <span className="cc-badge">{p.badge}</span>
                  )}
                </div>
                <div className="cc-body">
                  <div className="cc-cat">{p.levelLabel}</div>
                  <div className="cc-title">Ścieżka: {p.name}</div>
                  <div className="cc-desc">{p.teaser}</div>
                  {savings > 0 && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        padding: "3px 8px",
                        background: "#EAF3EC",
                        color: "#2E7D46",
                        borderRadius: 5,
                        font: "600 10.5px var(--sans)",
                      }}
                    >
                      Oszczędzasz {Math.round(savings / 100)} zł
                    </div>
                  )}
                  <div className="cc-foot">
                    <span className="cc-meta">
                      {pathCoursesCountLabel(p.courseSlugs.length)} · 12 MIESIĘCY
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <span className="cc-price" style={{ fontSize: 13 }}>
                        {p.priceLabel}
                      </span>
                      {p.compareAtLabel && (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--mono)",
                            fontSize: 10,
                            color: "var(--muted)",
                            textDecoration: "line-through",
                            marginTop: 2,
                          }}
                        >
                          zamiast {p.compareAtLabel}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
