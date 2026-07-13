import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PanelHeader from "@/components/dashboard/PanelHeader";
import { canAccessCourse } from "@/lib/access";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getCourse, CAT_BREADCRUMB } from "@/lib/courses";

/* eslint-disable @next/next/no-img-element */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return {
    title: course
      ? `${course.title} - Panel kursu - MARKOWE KURSY`
      : "Panel kursu - MARKOWE KURSY",
  };
}

interface LessonRow {
  id: string;
  slug: string;
  sort_order: number;
  estimated_minutes: number | null;
  content_path: string | null;
  thumbnail_url: string | null;
  lesson_translations: { title: string; language: string }[];
}
interface ModuleRow {
  id: string;
  sort_order: number;
  module_translations: { title: string; language: string }[];
  lessons: LessonRow[];
}

export default async function CoursePanelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const access = await canAccessCourse(slug);
  if (!access.allowed) {
    if (access.reason === "not_authenticated")
      redirect(`/login?next=/dashboard/courses/${slug}`);
    if (access.reason === "db_not_ready") redirect("/dashboard");
    redirect(`/courses/${slug}`);
  }

  const supabase = await createSupabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .maybeSingle();

  const { data: modulesRaw } = await supabase
    .from("modules")
    .select(
      "id, sort_order, module_translations(title, language), lessons(id, slug, sort_order, status, estimated_minutes, content_path, thumbnail_url, lesson_translations(title, language))"
    )
    .eq("course_id", access.courseId)
    .eq("status", "published")
    .order("sort_order");

  const modules = ((modulesRaw ?? []) as unknown as ModuleRow[])
    .map((m) => ({
      ...m,
      lessons: [...m.lessons].sort((a, b) => a.sort_order - b.sort_order),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("course_id", access.courseId);
  const done = new Set(
    (progressRows ?? [])
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id as string)
  );

  const allLessons = modules.flatMap((m) => m.lessons);
  const total = allLessons.length;
  const completed = allLessons.filter((l) => done.has(l.id)).length;
  const firstAvailable = allLessons.find((l) => l.content_path);
  // globalna numeracja lekcji (bez mutacji podczas renderu)
  const lessonNumById = new Map(allLessons.map((l, i) => [l.id, i + 1]));

  // procent ze źródła prawdy (API complete utrzymuje course_progress);
  // fallback: wyliczenie z lekcji
  const { data: courseProgress } = await supabase
    .from("course_progress")
    .select("progress_percent, status")
    .eq("course_id", access.courseId)
    .maybeSingle();
  const pct =
    courseProgress != null
      ? Math.round(Number(courseProgress.progress_percent))
      : total
        ? Math.round((completed / total) * 100)
        : 0;

  // certyfikat (jeśli już wygenerowany) — link w karcie postępu
  const { data: certificate } = await supabase
    .from("certificates")
    .select("id")
    .eq("course_id", access.courseId)
    .eq("status", "generated")
    .maybeSingle();

  const tTitle = (
    tr: { title: string; language: string }[] | undefined,
    fallback: string
  ) => tr?.find((t) => t.language === "pl")?.title ?? tr?.[0]?.title ?? fallback;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PanelHeader fullName={profile?.full_name ?? ""} leaveHref="/dashboard" leaveLabel="Opuść kurs" />

      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/courses">Kursy</Link> /{" "}
          <Link href={`/courses/${slug}`}>{CAT_BREADCRUMB[course.catKey]}</Link>{" "}
          / <span className="bc-code">{course.code}</span>
        </div>
      </div>

      {/* HERO + KARTA POSTĘPU */}
      <section className="panel-hero">
        <img
          className="panel-hero-bg"
          src="/assets/separator-technologia.jpg"
          alt="Prefabrykacja blacharska"
        />
        <div className="panel-hero-scrim"></div>
        <div className="panel-hero-inner">
          <div className="panel-hero-main">
            <div className="hero-kicker-row">
              <span className="hero-kicker-line"></span>
              <span className="hero-kicker">
                KURS · {course.catLabel.replace("DOKUMENTACJA TECHNICZNA", "DOKUMENTACJA")}
              </span>
            </div>
            <h1>{course.title}</h1>
            <p className="panel-hero-para">{course.desc}</p>
            <div className="panel-hero-meta">
              <span>
                <i></i>
                {total || 15} lekcji
              </span>
              <span>
                <i></i>
                {course.hoursLabel.replace(" materiału", "")}
              </span>
              <span className="d-only">
                <i></i>
                {course.levelLabel}
              </span>
            </div>
          </div>
          <div className="progress-card">
            <div className="progress-top">
              <span className="progress-label">TWÓJ POSTĘP</span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <div className="progress-text">
              {completed === 0
                ? "Nie rozpoczęto - zacznij od pierwszej lekcji."
                : `${completed} z ${total} lekcji ukończonych`}
            </div>
            <a
              className="progress-cta"
              href={
                firstAvailable
                  ? `/learn/${slug}/${firstAvailable.slug}`
                  : `/dashboard/courses/${slug}`
              }
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              {completed === 0 ? "Rozpocznij naukę" : "Kontynuuj naukę"}
            </a>
            {certificate && (
              <a
                href={`/api/certificates/${certificate.id}/download`}
                style={{
                  display: "block",
                  marginTop: 12,
                  textAlign: "center",
                  font: "600 12.5px var(--sans)",
                  color: "#fff",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Pobierz certyfikat (PDF)
              </a>
            )}
          </div>
        </div>
      </section>

      {/* PROGRAM KURSU */}
      <section className="panel-program">
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">PROGRAM KURSU</span>
          </div>
          <h2 className="section-h2">Lekcje</h2>

          <div className="modules" style={{ marginTop: 22 }}>
            {modules.map((m, mi) => (
              <div className="module" key={m.id}>
                <div className="module-head">
                  <span className="module-tag">MODUŁ {mi + 1}</span>
                  <span className="module-title">
                    {tTitle(m.module_translations, `Moduł ${mi + 1}`)}
                  </span>
                  <span className="module-meta">
                    {m.lessons.length}{" "}
                    {m.lessons.length === 1
                      ? "lekcja"
                      : m.lessons.length < 5
                        ? "lekcje"
                        : "lekcji"}
                  </span>
                </div>
                <div className="module-lessons">
                  {m.lessons.map((l) => {
                    const num = String(lessonNumById.get(l.id) ?? 0).padStart(
                      2,
                      "0"
                    );
                    const available = !!l.content_path;
                    const isDone = done.has(l.id);
                    const row = (
                      <>
                        <span
                          className={`lrow-thumb${l.thumbnail_url ? "" : " lrow-thumb-placeholder"}`}
                          style={
                            l.thumbnail_url
                              ? {
                                  background: `#fff url('${l.thumbnail_url}') center / contain no-repeat`,
                                }
                              : undefined
                          }
                        ></span>
                        <span className="lrow-mid">
                          <span className="lrow-kicker">
                            LEKCJA {num}
                            {l.estimated_minutes
                              ? ` · ${l.estimated_minutes} min`
                              : ""}
                          </span>
                          <span className="lrow-title">
                            {tTitle(l.lesson_translations, l.slug)}
                          </span>
                        </span>
                        {available ? (
                          isDone ? (
                            <span
                              className="lrow-cta"
                              style={{ background: "#EAF3EC", color: "#2E7D46" }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="13"
                                height="13"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                              <span className="lrow-cta-lbl">Ukończono</span>
                            </span>
                          ) : (
                            <span className="lrow-cta">
                              <svg
                                viewBox="0 0 24 24"
                                width="13"
                                height="13"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z"></path>
                              </svg>
                              <span className="lrow-cta-lbl">Rozpocznij</span>
                            </span>
                          )
                        ) : (
                          <span
                            style={{
                              flex: "none",
                              padding: "8px 14px",
                              fontFamily: "var(--mono)",
                              fontSize: 11,
                              letterSpacing: ".06em",
                              color: "#B0AFAB",
                            }}
                          >
                            WKRÓTCE
                          </span>
                        )}
                      </>
                    );
                    return available ? (
                      <a className="lrow" key={l.id} href={`/learn/${slug}/${l.slug}`}>
                        {row}
                      </a>
                    ) : (
                      <span
                        className="lrow"
                        key={l.id}
                        style={{ background: "var(--bg-off)", cursor: "default" }}
                      >
                        {row}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
