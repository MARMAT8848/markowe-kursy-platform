import Link from "next/link";
import { CAREER_PATHS, pathCoursesCountLabel } from "@/lib/paths";

/**
 * Sekcja „Ścieżki kariery" — główny blok ofertowy strony głównej
 * (strategia: 5 ścieżek stanowiskowych). Wizualnie spójna z projektem:
 * te same karty, kickery i siatka co sekcja kursów.
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
          </div>
          <Link className="featured-link d-only" href="/courses">
            Zobacz wszystkie kursy →
          </Link>
        </div>
        <div className="course-grid" style={{ marginTop: 22 }}>
          {CAREER_PATHS.map((p) => (
            <Link key={p.slug} className="course-card" href="/courses">
              <div
                className="cc-head"
                style={{
                  background: "linear-gradient(158deg,#FAFAF9,#E2E1DD)",
                }}
              >
                <span className="cc-watermark" style={{ fontSize: 18 }}>
                  {p.name.toUpperCase()}
                </span>
                {p.badge && <span className="cc-badge">{p.badge}</span>}
              </div>
              <div className="cc-body">
                <div className="cc-cat">{p.levelLabel}</div>
                <div className="cc-title">Ścieżka: {p.name}</div>
                <div className="cc-desc">{p.teaser}</div>
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
          ))}
        </div>
      </div>
    </section>
  );
}
