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

  const rows = (enrollments ?? []).map((e) => {
    const slug = (e.courses as unknown as { slug: string } | null)?.slug ?? "";
    const course = getCourse(slug);
    const activeNow =
      e.status === "active" &&
      !!e.access_expires_at &&
      e.access_expires_at > nowIso;
    const progress = progressByCourse.get(e.course_id as string);
    return {
      id: e.id as string,
      slug,
      title: course?.title ?? slug.toUpperCase(),
      thumbUrl: course?.thumbUrl,
      activeNow,
      start: fmtDate(e.access_start_at),
      end: fmtDate(e.access_expires_at),
      percent: Math.round(Number(progress?.progress_percent ?? 0)),
    };
  });

  return (
    <>
      <PanelHeader fullName={fullName} showSignOut />

      <section style={{ padding: "34px 0 44px", minHeight: "55vh" }}>
        <div className="wrap">
          <div className="kicker-row">
            <span className="kicker-line"></span>
            <span className="kicker">PANEL KURSANTA</span>
          </div>
          <h1
            style={{
              margin: "0 0 22px",
              font: "600 26px/1.15 var(--sans)",
              letterSpacing: "-.025em",
              color: "var(--ink)",
            }}
          >
            {fullName ? `Witaj, ${fullName.split(" ")[0]}` : "Twoje kursy"}
          </h1>

          {dbNotReady ? (
            <div className="form-confirm" style={{ maxWidth: 640 }}>
              Baza danych nie została jeszcze zainicjalizowana (migracja +
              seed). Uruchom `npm run db:apply` lub wykonaj pliki SQL w
              Supabase SQL Editor.
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
            <div className="module-lessons" style={{ maxWidth: 860 }}>
              {rows.map((r) => (
                <Link
                  key={r.id}
                  className="lrow"
                  href={r.activeNow ? `/dashboard/courses/${r.slug}` : `/courses/${r.slug}`}
                >
                  <span
                    className="lrow-thumb"
                    style={
                      r.thumbUrl
                        ? {
                            background: `#fff url('${r.thumbUrl}') center / contain no-repeat`,
                          }
                        : undefined
                    }
                  ></span>
                  <span className="lrow-mid">
                    <span className="lrow-kicker">
                      {r.activeNow
                        ? `DOSTĘP DO ${r.end} · POSTĘP ${r.percent}%`
                        : `DOSTĘP WYGASŁ ${r.end}`}
                    </span>
                    <span className="lrow-title">{r.title}</span>
                  </span>
                  {r.activeNow ? (
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
                      ODNÓW DOSTĘP
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
