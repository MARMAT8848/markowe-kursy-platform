import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PanelHeader from "@/components/dashboard/PanelHeader";
import SiteFooter from "@/components/SiteFooter";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Panel kursanta — MARKOWE KURSY",
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL") : "—";

interface Row {
  id: string;
  slug: string;
  title: string;
  thumbUrl?: string;
  activeNow: boolean;
  completed: boolean;
  end: string;
  percent: number;
}

function LessonRowThumb({ thumbUrl }: { thumbUrl?: string }) {
  return (
    <span
      className={`lrow-thumb${thumbUrl ? "" : " lrow-thumb-placeholder"}`}
      style={
        thumbUrl
          ? { background: `#fff url('${thumbUrl}') center / contain no-repeat` }
          : undefined
      }
    ></span>
  );
}

function Section({
  tag,
  title,
  children,
}: {
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="module">
      <div className="module-head">
        <span className="module-tag">{tag}</span>
        <span className="module-title">{title}</span>
      </div>
      <div className="module-lessons">{children}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const fullName =
    profile?.full_name || (user.user_metadata?.full_name as string) || "";

  const nowIso = new Date().toISOString();
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("id, status, course_id, access_start_at, access_expires_at, courses(slug)")
    .order("created_at", { ascending: false });

  const dbNotReady =
    !!error && (error.code === "42P01" || error.code === "PGRST205");

  const { data: progressRows } = dbNotReady
    ? { data: null }
    : await supabase
        .from("course_progress")
        .select("course_id, progress_percent, status");
  const progressByCourse = new Map(
    (progressRows ?? []).map((p) => [p.course_id as string, p])
  );

  // wiersze + deduplikacja po kursie (aktywny enrollment wygrywa,
  // np. po ponownym zakupie wygasłego kursu)
  const bySlug = new Map<string, Row>();
  for (const e of enrollments ?? []) {
    const slug = (e.courses as unknown as { slug: string } | null)?.slug ?? "";
    if (!slug) continue;
    const course = getCourse(slug);
    const activeNow =
      e.status === "active" &&
      !!e.access_start_at &&
      e.access_start_at <= nowIso &&
      !!e.access_expires_at &&
      e.access_expires_at > nowIso;
    const progress = progressByCourse.get(e.course_id as string);
    const row: Row = {
      id: e.id as string,
      slug,
      title: course?.title ?? slug.toUpperCase(),
      thumbUrl: course?.thumbUrl,
      activeNow,
      completed: progress?.status === "completed",
      end: fmtDate(e.access_expires_at),
      percent: Math.round(Number(progress?.progress_percent ?? 0)),
    };
    const existing = bySlug.get(slug);
    if (!existing || (row.activeNow && !existing.activeNow)) bySlug.set(slug, row);
  }
  const rows = [...bySlug.values()];

  const activeRows = rows.filter((r) => r.activeNow && !r.completed);
  const completedRows = rows.filter((r) => r.completed);
  const expiredRows = rows.filter((r) => !r.activeNow && !r.completed);

  return (
    <>
      <PanelHeader fullName={fullName} showSignOut />

      <section style={{ padding: "34px 0 44px", minHeight: "55vh" }}>
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">PANEL KURSANTA</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              margin: "0 0 22px",
            }}
          >
            <h1
              style={{
                margin: 0,
                font: "600 26px/1.15 var(--sans)",
                letterSpacing: "-.025em",
                color: "var(--ink)",
              }}
            >
              {fullName ? `Witaj, ${fullName.split(" ")[0]}` : "Twoje kursy"}
            </h1>
            <Link className="btn btn-primary" href="/courses">
              Katalog kursów
            </Link>
          </div>

          {dbNotReady ? (
            <div className="form-confirm" style={{ maxWidth: 640 }}>
              Baza danych nie została jeszcze zainicjalizowana (migracja +
              seed). Uruchom `npm run db:apply`.
            </div>
          ) : rows.length === 0 ? (
            <div style={{ maxWidth: 640 }}>
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--sub)",
                }}
              >
                Nie masz jeszcze żadnego kursu. Wybierz szkolenie z katalogu —
                dostęp aktywuje się automatycznie po opłaceniu.
              </p>
              <Link className="btn btn-primary" href="/courses">
                Przeglądaj kursy
              </Link>
            </div>
          ) : (
            <div className="modules" style={{ maxWidth: 860 }}>
              {activeRows.length > 0 && (
                <Section tag="W TRAKCIE" title="Aktywne kursy">
                  {activeRows.map((r) => (
                    <Link
                      key={r.id}
                      className="lrow"
                      href={`/dashboard/courses/${r.slug}`}
                    >
                      <LessonRowThumb thumbUrl={r.thumbUrl} />
                      <span className="lrow-mid">
                        <span className="lrow-kicker">
                          DOSTĘP DO {r.end} · POSTĘP {r.percent}%
                        </span>
                        <span className="lrow-title">{r.title}</span>
                      </span>
                      <span className="lrow-cta">
                        <svg
                          viewBox="0 0 24 24"
                          width="13"
                          height="13"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z"></path>
                        </svg>
                        <span className="lrow-cta-lbl">Kontynuuj</span>
                      </span>
                    </Link>
                  ))}
                </Section>
              )}

              {completedRows.length > 0 && (
                <Section tag="GRATULACJE" title="Ukończone kursy">
                  {completedRows.map((r) => (
                    <Link
                      key={r.id}
                      className="lrow"
                      href={
                        r.activeNow
                          ? `/dashboard/courses/${r.slug}`
                          : "/dashboard/certificates"
                      }
                    >
                      <LessonRowThumb thumbUrl={r.thumbUrl} />
                      <span className="lrow-mid">
                        <span className="lrow-kicker">
                          UKOŃCZONY
                          {r.activeNow ? ` · DOSTĘP DO ${r.end}` : ""} ·
                          CERTYFIKAT W ZAKŁADCE CERTYFIKATY
                        </span>
                        <span className="lrow-title">{r.title}</span>
                      </span>
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
                        <span className="lrow-cta-lbl">Ukończony</span>
                      </span>
                    </Link>
                  ))}
                </Section>
              )}

              {expiredRows.length > 0 && (
                <Section tag="DO ODNOWIENIA" title="Dostęp wygasł">
                  {expiredRows.map((r) => (
                    <Link
                      key={r.id}
                      className="lrow"
                      href={`/courses/${r.slug}`}
                      style={{ background: "var(--bg-off)" }}
                    >
                      <LessonRowThumb thumbUrl={r.thumbUrl} />
                      <span className="lrow-mid">
                        <span className="lrow-kicker" style={{ color: "#B0AFAB" }}>
                          DOSTĘP WYGASŁ {r.end}
                        </span>
                        <span className="lrow-title">{r.title}</span>
                      </span>
                      <span className="lrow-cta">
                        <span className="lrow-cta-lbl">Odnów dostęp</span>
                      </span>
                    </Link>
                  ))}
                </Section>
              )}
            </div>
          )}

          <p style={{ margin: "22px 0 0", display: "flex", gap: 24 }}>
            <Link
              href="/dashboard/certificates"
              style={{
                font: "600 13px var(--sans)",
                color: "var(--ink)",
                textDecoration: "none",
              }}
            >
              Twoje certyfikaty →
            </Link>
            <Link
              href="/dashboard/settings"
              style={{
                font: "600 13px var(--sans)",
                color: "var(--ink)",
                textDecoration: "none",
              }}
            >
              Ustawienia konta →
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
