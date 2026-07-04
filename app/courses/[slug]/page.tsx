import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ModulesAccordion from "@/components/course/ModulesAccordion";
import { CAT_BREADCRUMB, getCourse, isPurchasable } from "@/lib/courses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course
      ? `${course.title} — MARKOWE KURSY`
      : "Kurs — MARKOWE KURSY",
    description: course?.desc,
  };
}

/**
 * Logika przycisku (ETAP 5 specyfikacji):
 * - kurs coming_soon → „Wkrótce dostępny" (nieklikalne),
 * - kurs published → „Kup kurs" → /checkout/[slug] (zgody prawne),
 * - TODO Faza 2/4: zalogowany z aktywnym dostępem → „Przejdź do kursu";
 *   z wygasłym → „Odnów dostęp"; admin → „Edytuj kurs".
 */
function BuyButton({
  slug,
  purchasable,
  block,
}: {
  slug: string;
  purchasable: boolean;
  block?: boolean;
}) {
  if (!purchasable) {
    return (
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
        Wkrótce dostępny
      </span>
    );
  }
  return (
    <Link
      className="kurs-enroll"
      href={`/checkout/${slug}`}
      style={block ? { display: "block" } : undefined}
    >
      Kup kurs
    </Link>
  );
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const purchasable = isPurchasable(course);

  return (
    <>
      <SiteHeader active="kursy" />

      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/courses">Kursy</Link>{" "}
          <span className="d-only">/ {CAT_BREADCRUMB[course.catKey]}</span> /{" "}
          <span className="bc-code">{course.code}</span>
        </div>
      </div>

      {/* Mobilna miniatura kursu */}
      <div
        className="kurs-thumb-mobile m-only"
        style={{
          background: `#fff url('${course.thumbUrl}') center / ${course.thumbSize} no-repeat`,
        }}
      ></div>

      <div className="wrap">
        <section className="kurs-layout">
          <div>
            <div className="kurs-cat">{course.catLabel}</div>
            <h1>{course.title}</h1>
            <p className="kurs-desc">{course.desc}</p>
            <div className="kurs-meta">
              <span>
                <i></i>
                <span>{course.lessonsLabel}</span>
              </span>
              <span>
                <i></i>
                <span>{course.hoursLabel}</span>
              </span>
              <span>
                <i></i>
                <span>{course.levelLabel}</span>
              </span>
              <span className="d-only">
                <i></i>Dostęp 12 miesięcy
              </span>
            </div>

            {/* Mobilny blok ceny */}
            <div className="kurs-pricebox-mobile m-only">
              <div className="kurs-price">{course.priceLabel}</div>
              <BuyButton slug={course.slug} purchasable={purchasable} block />
            </div>

            <h2 className="kurs-h2">Czego się nauczysz</h2>
            <div className="kurs-learn">
              {course.learnBullets.map((b, i) => (
                <span key={i}>
                  <b>✔</b>
                  {b}
                </span>
              ))}
            </div>

            <h2 className="kurs-h2">Program kursu</h2>
            <ModulesAccordion modules={course.modules} />

            <h2 className="kurs-h2 kurs-forwhom-h2">Dla kogo jest ten kurs</h2>
            <p className="kurs-forwhom">{course.forWhom}</p>

            {/* Pozycjonowanie: projekty norweskie / NORSOK / rotacja */}
            <div
              style={{
                marginTop: 22,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                padding: 18,
                border: "1px solid var(--border)",
                borderRadius: 13,
                background: "var(--bg-off)",
                maxWidth: 600,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".1em",
                    color: "var(--accent)",
                    marginBottom: 6,
                  }}
                >
                  DOKUMENTACJA DWUJĘZYCZNA PL/EN
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "var(--sub)",
                  }}
                >
                  Poznajesz terminologię polską i angielską stosowaną w
                  dokumentacji technicznej na projektach norweskich — te same
                  pojęcia, którymi posługują się inżynier, brygadzista i dział
                  QA.
                </p>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".1em",
                    color: "var(--accent)",
                    marginBottom: 6,
                  }}
                >
                  PRACA W SYSTEMIE ROTACYJNYM
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "var(--sub)",
                  }}
                >
                  Kurs online dopasowany do rotacji: uczysz się między
                  wyjazdami, we własnym tempie, z dostępem przez 12 miesięcy —
                  bez sztywnych terminów i zjazdów.
                </p>
              </div>
            </div>
          </div>

          <div className="kurs-card d-only">
            <div
              className="kurs-thumb"
              style={{
                background: `#fff url('${course.thumbUrl}') center / ${course.thumbSize} no-repeat`,
              }}
            ></div>
            <div className="kurs-card-body">
              <div className="kurs-price">{course.priceLabel}</div>
              <BuyButton slug={course.slug} purchasable={purchasable} />
              <div className="kurs-card-checks">
                <span>
                  <b>✓</b>Dostęp przez 12 miesięcy
                </span>
                <span>
                  <b>✓</b>Certyfikat ukończenia
                </span>
                <span>
                  <b>✓</b>Materiały do pobrania
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
