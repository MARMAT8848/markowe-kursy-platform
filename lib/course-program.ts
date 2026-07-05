import "server-only";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Program kursu (moduły + tytuły lekcji) na potrzeby marketingowej strony
 * kursu. Pobierany service-rolem, bo RLS na lekcjach ukrywa je przed
 * niezalogowanymi — a syllabus (same tytuły) ma być publiczny. Treść
 * lekcji pozostaje chroniona (trasa /learn).
 *
 * Zwraca null, gdy kurs nie ma jeszcze programu w bazie (kursy
 * coming_soon) — strona kursu użyje wtedy zarysu ze `lib/courses.ts`.
 */
export interface ProgramModule {
  title: string;
  lessons: { title: string; minutes: number | null; available: boolean }[];
}

const tPl = (
  tr: { title: string; language: string }[] | undefined,
  fallback: string
) => tr?.find((t) => t.language === "pl")?.title ?? tr?.[0]?.title ?? fallback;

export async function getCourseProgramBySlug(
  slug: string
): Promise<ProgramModule[] | null> {
  const admin = createSupabaseAdmin();

  const { data: course } = await admin
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!course) return null;

  const { data: modules } = await admin
    .from("modules")
    .select(
      "sort_order, module_translations(title, language), lessons(sort_order, status, estimated_minutes, content_path, lesson_translations(title, language))"
    )
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order");

  if (!modules || modules.length === 0) return null;

  return modules
    .map((m, mi) => {
      const lessons = [
        ...((m.lessons as unknown as {
          sort_order: number;
          status: string;
          estimated_minutes: number | null;
          content_path: string | null;
          lesson_translations: { title: string; language: string }[];
        }[]) ?? []),
      ]
        .filter((l) => l.status === "published")
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({
          title: tPl(l.lesson_translations, "Lekcja"),
          minutes: l.estimated_minutes,
          available: !!l.content_path,
        }));
      return {
        sort: m.sort_order ?? mi,
        title: tPl(
          m.module_translations as { title: string; language: string }[],
          `Moduł ${mi + 1}`
        ),
        lessons,
      };
    })
    .sort((a, b) => a.sort - b.sort)
    .map(({ title, lessons }) => ({ title, lessons }));
}
