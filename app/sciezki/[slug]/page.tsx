import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CAREER_PATHS, getCareerPath } from "@/lib/paths";
import { getCourse, isPurchasable } from "@/lib/courses";

export function generateStaticParams() {
  return CAREER_PATHS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getCareerPath(slug);
  return {
    title: path
      ? `Ścieżka: ${path.name} - MARKOWE KURSY`
      : "Ścieżka kariery - MARKOWE KURSY",
    description: path?.teaser,
  };
}

export default async function CareerPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = getCareerPath(slug);
  if (!path) notFound();

  const courses = path.courseSlugs
    .map((s) => getCourse(s))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const hasSavings = !!path.compareAtLabel && !!path.savingsLabel;

  return (
    <>
      <SiteHeader active="kursy" />

      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/courses">Kursy</Link> / Ścieżki kariery /{" "}
          <span className="bc-code">{path.name}</span>
        </div>
      </div>

      {/* Nagłówek ścieżki */}
      <section style={{ padding: "8px 0 8px" }}>
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">ŚCIEŻKA KARIERY · {path.levelLabel}</span>
          </div>
          <h1
            style={{
              margin: "0 0 12px",
              font: "600 32px/1.12 var(--sans)",
              letterSpacing: "-.03em",
              color: "var(--ink)",
              maxWidth: 680,
            }}
          >
            Ścieżka: {path.name}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--sub)",
              maxWidth: 620,
            }}
          >
            {path.teaser}
          </p>
        </div>
      </section>

      {/* Zawartość + wycena (układ responsywny — collapse na mobile) */}
      <section style={{ padding: "8px 0 56px" }}>
        <div className="wrap">
          <div className="kurs-layout" style={{ paddingTop: 20 }}>
          {/* lista kursów w ścieżce */}
          <div>
            <h2 className="kurs-h2">Kursy w tej ścieżce</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {courses.map((c) => {
                const buyable = isPurchasable(c);
                return (
                  <Link
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    className="lrow"
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      className="lrow-thumb"
                      style={{
                        background: `#fff url('${c.thumbUrl}') center / contain no-repeat`,
                      }}
                    ></span>
                    <span className="lrow-mid">
                      <span className="lrow-kicker">
                        {c.catLabel} · {c.lessonsLabel.toUpperCase()}
                      </span>
                      <span className="lrow-title">{c.title}</span>
                    </span>
                    <span
                      style={{
                        flex: "none",
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                        fontWeight: 600,
                        color: buyable ? "var(--ink)" : "#B0AFAB",
                      }}
                    >
                      {buyable ? c.priceLabel : "WKRÓTCE"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* karta wyceny z korzyścią ekonomiczną (widoczna też na mobile) */}
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {path.imageUrl && (
              <div
                style={{
                  height: 170,
                  background: `#fff url('${path.imageUrl}') center / cover no-repeat`,
                  borderBottom: "1px solid var(--border)",
                }}
              ></div>
            )}
            <div className="kurs-card-body">
              {hasSavings && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "var(--muted)",
                  }}
                >
                  <span>Kupując osobno</span>
                  <span style={{ textDecoration: "line-through" }}>
                    {path.compareAtLabel}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ font: "600 14px var(--sans)", color: "var(--ink)" }}>
                  Cena ścieżki
                </span>
                <span className="kurs-price">{path.priceLabel}</span>
              </div>
              {hasSavings && (
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#EAF3EC",
                    color: "#2E7D46",
                    borderRadius: 8,
                    font: "600 13px var(--sans)",
                    textAlign: "center",
                  }}
                >
                  {path.savingsLabel} taniej niż osobno
                </div>
              )}
              <span
                className="kurs-enroll"
                style={{
                  display: "block",
                  background: "#F2F1EE",
                  color: "var(--muted)",
                  cursor: "default",
                  textAlign: "center",
                }}
              >
                Ścieżka wkrótce dostępna
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: "var(--sub)",
                }}
              >
                Do premiery pakietu możesz kupić dostępne kursy pojedynczo -
                wybierz je z listy obok. Dostęp do każdego kursu: 12 miesięcy.
              </p>
              <div className="kurs-card-checks">
                <span>
                  <b>✓</b>Dostęp przez 12 miesięcy do każdego kursu
                </span>
                <span>
                  <b>✓</b>Certyfikat za każdy ukończony kurs
                </span>
                <span>
                  <b>✓</b>Materiały do pobrania
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
