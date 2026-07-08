import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminH1, Table, Td, StatusPill } from "@/components/admin/ui";
import ActionButton from "@/components/admin/ActionButton";
import { toggleCourseStatusAction } from "@/app/admin/actions";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Kursy - Panel admina",
  robots: { index: false },
};

export default async function AdminCoursesPage() {
  const { admin } = await requireAdmin();

  const { data: courses } = await admin
    .from("courses")
    .select("id, slug, status, category")
    .order("slug");

  // liczba lekcji z treścią / wszystkich (podpowiedź gotowości do publikacji)
  const { data: lessons } = await admin
    .from("lessons")
    .select("course_id, content_path, status");
  const lessonStats = new Map<string, { total: number; ready: number }>();
  for (const l of lessons ?? []) {
    if (l.status !== "published") continue;
    const s = lessonStats.get(l.course_id as string) ?? { total: 0, ready: 0 };
    s.total += 1;
    if (l.content_path) s.ready += 1;
    lessonStats.set(l.course_id as string, s);
  }

  return (
    <>
      <AdminH1>Kursy</AdminH1>
      <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "var(--sub)", maxWidth: 640 }}>
        Publikuj kurs dopiero, gdy ma gotową treść - status „publikowany”
        oznacza, że kurs jest widoczny w katalogu i kupowalny.
      </p>
      <Table head={["Kod", "Kurs", "Lekcje (gotowe/wsz.)", "Status", "Akcja"]}>
        {(courses ?? []).map((c) => {
          const meta = getCourse(c.slug as string);
          const st = lessonStats.get(c.id as string);
          return (
            <tr key={c.id as string}>
              <Td mono>{meta?.code ?? c.slug}</Td>
              <Td>{meta?.title ?? c.slug}</Td>
              <Td mono>{st ? `${st.ready}/${st.total}` : "0/0"}</Td>
              <Td>
                <StatusPill status={c.status as string} />
              </Td>
              <Td>
                <ActionButton
                  action={toggleCourseStatusAction}
                  fields={{ courseId: c.id as string, current: c.status as string }}
                  label={c.status === "published" ? "Ukryj (wkrótce)" : "Publikuj"}
                  confirmMsg={
                    c.status === "published"
                      ? "Ukryć kurs? Zniknie z katalogu i nie będzie kupowalny."
                      : "Opublikować kurs? Będzie widoczny i kupowalny."
                  }
                  subtle
                />
              </Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
