import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, Table, Td } from "@/components/admin/ui";
import GrantAccess from "@/components/admin/GrantAccess";
import { grantAccessAction } from "@/app/admin/actions";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Użytkownicy - Panel admina",
  robots: { index: false },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pl-PL") : "-";

export default async function AdminUsersPage() {
  const { admin } = await requireAdmin();

  const [{ data: profiles }, { data: courses }, { data: enrollments }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(300),
      admin.from("courses").select("id, slug").order("slug"),
      admin
        .from("enrollments")
        .select("user_id, course_id, status, access_expires_at, courses(slug)"),
    ]);

  const nowIso = new Date().toISOString();
  const activeByUser = new Map<string, string[]>();
  const ownedCourseIdsByUser = new Map<string, Set<string>>();
  for (const e of enrollments ?? []) {
    const activeNow =
      e.status === "active" &&
      !!e.access_expires_at &&
      e.access_expires_at > nowIso;
    if (!activeNow) continue;
    const slug = (e.courses as unknown as { slug: string } | null)?.slug ?? "";
    const title = getCourse(slug)?.title ?? slug;
    const arr = activeByUser.get(e.user_id as string) ?? [];
    arr.push(title);
    activeByUser.set(e.user_id as string, arr);
    const owned = ownedCourseIdsByUser.get(e.user_id as string) ?? new Set();
    owned.add(e.course_id as string);
    ownedCourseIdsByUser.set(e.user_id as string, owned);
  }

  const courseOptions = (courses ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    title: getCourse(c.slug as string)?.title ?? (c.slug as string),
  }));

  return (
    <>
      <AdminH1>Użytkownicy</AdminH1>
      <Table head={["Użytkownik", "Rejestracja", "Aktywne kursy", "Nadaj dostęp"]}>
        {(profiles ?? []).map((p) => {
          const active = activeByUser.get(p.id as string) ?? [];
          return (
            <tr key={p.id as string}>
              <Td>
                <div style={{ fontWeight: 600 }}>{p.full_name || "-"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {p.email}
                </div>
              </Td>
              <Td mono>{fmt(p.created_at as string)}</Td>
              <Td color={active.length ? "var(--ink)" : "var(--muted)"}>
                {active.length ? active.join(", ") : "brak"}
              </Td>
              <Td>
                <GrantAccess
                  action={grantAccessAction}
                  userId={p.id as string}
                  courses={courseOptions.filter(
                    (c) =>
                      !(ownedCourseIdsByUser.get(p.id as string) ?? new Set()).has(
                        c.id
                      )
                  )}
                />
              </Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
