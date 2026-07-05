import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ModulesAccordion from "@/components/course/ModulesAccordion";
import ProgramAccordion from "@/components/course/ProgramAccordion";
import { CAT_BREADCRUMB, getCourse, isPurchasable } from "@/lib/courses";
import { getCourseProgramBySlug } from "@/lib/course-program";
import { getUserCourseStates, type OwnState } from "@/lib/enrollment-state";

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
 * - aktywny dostęp → „Przejdź do kursu" (nie da się kupić ponownie),
 * - dostęp wygasł → „Odnów dostęp" → checkout,
 * - w pozostałych → „Kup kurs" → /checkout/[slug] (zgody prawne).
 */
function BuyButton({
  slug,
  purchasable,
  state,
  block,
}: {
  slug: string;
  purchasable: boolean;
  state?: OwnState;
  block?: boolean;
}) {
  const blockStyle = block ? { display: "block" as const } : undefined;

  if (state === "active") {
    return (
      <Link
        className="kurs-enroll"
        href={`/dashboard/courses/${slug}`}
        style={{ ...blockStyle, background: "#2E7D46" }}
      >
        Przejdź do kursu
      </Link>
    );
  }
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
    <Link className="kurs-enroll" href={`/checkout/${slug}`} style={blockStyle}>
      {state === "expired" ? "Odnów dostęp" : "Kup kurs"}
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
  const state = (await getUserCourseStates())[slug];
  // rzeczywisty program z bazy (BLA-110); dla kursów bez treści → zarys statyczny
  const program = await getCourseProgramBySlug(slug);

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
            {state === "active" && (
              <div
                className="form-confirm"
                style={{
                  maxWidth: 600,
                  margin: "0 0 20px",
                  background: "#EAF3EC",
                  color: "#2E7D46",
                }}
              >
                Masz aktywny dostęp do tego kursu. Przejdź do niego w panelu
                kursanta.
              </div>
            )}
            {state === "expired" && (
              <div
                className="form-confirm"
                style={{ maxWidth: 600, margin: "0 0 20px" }}
              >
                Twój dostęp do tego kursu wygasł. Odnów dostęp, aby wrócić do
                nauki (kolejne 12 miesięcy).
              </div>
            )}
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
              <BuyButton
                slug={course.slug}
                purchasable={purchasable}
                state={state}
                block
              />
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
            {program ? (
              <ProgramAccordion modules={program} />
            ) : (
              <ModulesAccordion modules={course.modules} />
            )}

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
                  UCZ SIĘ, GDZIEKOLWIEK JESTEŚ
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "var(--sub)",
                  }}
                >
                  Kurs jest w 100% online, więc uczysz się z dowolnego miejsca —
                  na kwaterze podczas rotacji, w delegacji czy w domu. Wystarczy
                  telefon, tablet lub komputer z internetem. Masz dostęp przez 12
                  miesięcy i realizujesz materiał we własnym tempie, bez
                  sztywnych terminów i zjazdów.
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
              <BuyButton
                slug={course.slug}
                purchasable={purchasable}
                state={state}
              />
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
