import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  AdminH1,
  HeroFigure,
  Meter,
  StatCard,
  StatusPill,
  Table,
  Td,
} from "@/components/admin/ui";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Statystyki - Panel admina",
  robots: { index: false },
};

const zl = (grosze: number) =>
  `${(grosze / 100).toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} zł`;

const DAY = 864e5;

export default async function AdminStatsPage() {
  const { admin } = await requireAdmin();

  // Server Component renderuje się raz na żądanie — odczyt bieżącego czasu
  // jest tu zamierzony (spójnie z pozostałymi stronami panelu admina).
  const now = new Date().getTime();
  const nowIso = new Date(now).toISOString();
  const d7 = new Date(now - 7 * DAY).toISOString();
  const d30 = new Date(now - 30 * DAY).toISOString();
  const d60 = new Date(now - 60 * DAY).toISOString();
  const in30 = new Date(now + 30 * DAY).toISOString();

  const [
    { data: profiles },
    { data: enrollments },
    { data: courseProgress },
    { data: certificates },
    { data: orders },
    { data: lessonProgress },
    { data: outbox },
    { data: courses },
  ] = await Promise.all([
    admin.from("profiles").select("id, created_at"),
    admin
      .from("enrollments")
      .select("user_id, course_id, status, access_expires_at, created_at"),
    admin.from("course_progress").select("course_id, status"),
    admin.from("certificates").select("course_id, status, issued_at"),
    admin.from("orders").select("course_id, status, amount, created_at"),
    admin.from("lesson_progress").select("status, completed_at"),
    admin.from("email_outbox").select("status"),
    admin.from("courses").select("id, slug, status"),
  ]);

  const P = profiles ?? [];
  const E = enrollments ?? [];
  const CP = courseProgress ?? [];
  const C = certificates ?? [];
  const O = orders ?? [];
  const LP = lessonProgress ?? [];
  const OB = outbox ?? [];
  const CO = courses ?? [];

  // ---- przychód (tylko opłacone zamówienia) ----
  const paid = O.filter((o) => o.status === "paid");
  const sum = (rows: typeof paid) =>
    rows.reduce((a, o) => a + Number(o.amount ?? 0), 0);
  const revenueTotal = sum(paid);
  const revenue30 = sum(paid.filter((o) => (o.created_at as string) >= d30));
  const revenuePrev30 = sum(
    paid.filter(
      (o) => (o.created_at as string) >= d60 && (o.created_at as string) < d30
    )
  );

  // ---- użytkownicy ----
  const newUsers30 = P.filter((p) => (p.created_at as string) >= d30).length;
  const newUsersPrev30 = P.filter(
    (p) => (p.created_at as string) >= d60 && (p.created_at as string) < d30
  ).length;

  // ---- dostępy ----
  const isActive = (e: (typeof E)[number]) =>
    e.status === "active" &&
    !!e.access_expires_at &&
    (e.access_expires_at as string) > nowIso;
  const activeEnr = E.filter(isActive);
  const activeStudents = new Set(activeEnr.map((e) => e.user_id)).size;
  const expiringSoon = activeEnr.filter(
    (e) => (e.access_expires_at as string) <= in30
  ).length;
  const newEnr30 = E.filter((e) => (e.created_at as string) >= d30).length;
  const newEnrPrev30 = E.filter(
    (e) => (e.created_at as string) >= d60 && (e.created_at as string) < d30
  ).length;

  // ---- ukończenia i certyfikaty ----
  const completions = CP.filter((c) => c.status === "completed");
  const certsActive = C.filter((c) => c.status === "generated");
  const certs30 = certsActive.filter(
    (c) => c.issued_at && (c.issued_at as string) >= d30
  ).length;
  const completionRate =
    E.length > 0 ? Math.round((completions.length / E.length) * 100) : 0;

  // ---- aktywność nauki ----
  const lessonsDone = LP.filter((l) => l.status === "completed");
  const lessons7 = lessonsDone.filter(
    (l) => l.completed_at && (l.completed_at as string) >= d7
  ).length;
  const lessons30 = lessonsDone.filter(
    (l) => l.completed_at && (l.completed_at as string) >= d30
  ).length;

  // ---- wymagają uwagi ----
  const pendingOrders = O.filter((o) => o.status === "pending").length;
  const failedOrders = O.filter((o) => o.status === "failed").length;
  const mailQueued = OB.filter((m) => m.status === "queued").length;
  const mailFailed = OB.filter((m) => m.status === "failed").length;

  // ---- tabela: wyniki per kurs ----
  const perCourse = CO.map((c) => {
    const id = c.id as string;
    const slug = c.slug as string;
    const active = activeEnr.filter((e) => e.course_id === id).length;
    const total = E.filter((e) => e.course_id === id).length;
    return {
      slug,
      status: c.status as string,
      title: getCourse(slug)?.title ?? slug,
      code: getCourse(slug)?.code ?? slug.toUpperCase(),
      active,
      expired: total - active,
      completions: completions.filter((p) => p.course_id === id).length,
      certs: certsActive.filter((x) => x.course_id === id).length,
      revenue: sum(paid.filter((o) => o.course_id === id)),
    };
  }).sort((a, b) => b.active - a.active || b.revenue - a.revenue);

  const maxActive = Math.max(1, ...perCourse.map((c) => c.active));

  const attention: { label: string; count: number; status: string; href: string }[] =
    [
      {
        label: "Dostępy wygasające w ciągu 30 dni",
        count: expiringSoon,
        status: "pending",
        href: "/admin/enrollments",
      },
      {
        label: "Zamówienia oczekujące na płatność",
        count: pendingOrders,
        status: "pending",
        href: "/admin/orders",
      },
      {
        label: "Zamówienia nieudane",
        count: failedOrders,
        status: "failed",
        href: "/admin/orders",
      },
      {
        label: "E-maile w kolejce (czekają na Resend)",
        count: mailQueued,
        status: "pending",
        href: "/admin",
      },
      {
        label: "E-maile nieudane",
        count: mailFailed,
        status: "failed",
        href: "/admin",
      },
    ].filter((a) => a.count > 0);

  return (
    <>
      <AdminH1>Statystyki</AdminH1>

      {/* Liczba prowadząca pulpit + kluczowe wskaźniki */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 30,
          alignItems: "stretch",
        }}
      >
        <HeroFigure
          label="PRZYCHÓD ŁĄCZNIE"
          value={zl(revenueTotal)}
          hint={
            revenueTotal === 0
              ? "Sprzedaż ruszy po podłączeniu Stripe (Faza 4)."
              : `${zl(revenue30)} w ostatnich 30 dniach`
          }
        />
        <StatCard
          label="AKTYWNI KURSANCI"
          value={activeStudents}
          hint={`${activeEnr.length} aktywnych dostępów`}
        />
        <StatCard
          label="NOWI UŻYTKOWNICY (30 DNI)"
          value={newUsers30}
          delta={newUsers30 - newUsersPrev30}
          deltaLabel="vs poprzednie 30 dni"
        />
        <StatCard
          label="NOWE DOSTĘPY (30 DNI)"
          value={newEnr30}
          delta={newEnr30 - newEnrPrev30}
          deltaLabel="vs poprzednie 30 dni"
        />
        <StatCard
          label="CERTYFIKATY"
          value={certsActive.length}
          hint={`${certs30} w ostatnich 30 dniach`}
        />
      </div>

      {/* Zaangażowanie */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 30 }}>
        <StatCard
          label="WSKAŹNIK UKOŃCZENIA"
          value={`${completionRate}%`}
          hint={`${completions.length} ukończeń / ${E.length} dostępów`}
        />
        <StatCard
          label="LEKCJE UKOŃCZONE (7 DNI)"
          value={lessons7}
          hint={`${lessons30} w ostatnich 30 dniach`}
        />
        <StatCard
          label="PRZYCHÓD (30 DNI)"
          value={zl(revenue30)}
          delta={Math.round((revenue30 - revenuePrev30) / 100)}
          deltaLabel="zł vs poprzednie 30 dni"
        />
      </div>

      {/* Wymagają uwagi - status zawsze z etykietą, nigdy sam kolor */}
      <h2
        style={{
          margin: "0 0 12px",
          font: "600 16px var(--sans)",
          color: "var(--ink)",
        }}
      >
        Wymagają uwagi
      </h2>
      {attention.length === 0 ? (
        <p
          style={{
            margin: "0 0 30px",
            fontSize: 13.5,
            padding: "12px 14px",
            background: "#EAF3EC",
            color: "#2E7D46",
            borderRadius: 10,
            maxWidth: 620,
            fontWeight: 600,
          }}
        >
          ✓ Wszystko w porządku - nic nie wymaga teraz Twojej uwagi.
        </p>
      ) : (
        <div style={{ marginBottom: 30, maxWidth: 620 }}>
          <Table head={["Sprawa", "Liczba", "Status"]} minWidth={420}>
            {attention.map((a) => (
              <tr key={a.label}>
                <Td>
                  <Link
                    href={a.href}
                    style={{ color: "var(--ink)", textDecoration: "none" }}
                  >
                    {a.label}
                  </Link>
                </Td>
                <Td mono>{a.count}</Td>
                <Td>
                  <StatusPill status={a.status} />
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Wyniki per kurs - tabela, bo 5 klas niosących znaczenie */}
      <h2
        style={{
          margin: "0 0 12px",
          font: "600 16px var(--sans)",
          color: "var(--ink)",
        }}
      >
        Wyniki kursów
      </h2>
      <Table
        head={[
          "Kod",
          "Kurs",
          "Aktywne dostępy",
          "Wygasłe",
          "Ukończenia",
          "Certyfikaty",
          "Przychód",
        ]}
      >
        {perCourse.map((c) => (
          <tr key={c.slug}>
            <Td mono>{c.code}</Td>
            <Td>
              <div>{c.title}</div>
              <div style={{ marginTop: 3 }}>
                <StatusPill status={c.status} />
              </div>
            </Td>
            <Td>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 9 }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 18,
                  }}
                >
                  {c.active}
                </span>
                <Meter value={c.active} max={maxActive} />
              </span>
            </Td>
            <Td mono color="var(--muted)">
              {c.expired}
            </Td>
            <Td mono>{c.completions}</Td>
            <Td mono>{c.certs}</Td>
            <Td mono>{zl(c.revenue)}</Td>
          </tr>
        ))}
      </Table>

      <p
        style={{
          marginTop: 14,
          fontSize: 12,
          color: "var(--muted)",
          maxWidth: 640,
        }}
      >
        Przychód liczony wyłącznie z zamówień o statusie „paid”. Wskaźnik
        ukończenia to ukończone kursy względem wszystkich nadanych dostępów.
      </p>
    </>
  );
}
