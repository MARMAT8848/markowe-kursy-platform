import type { SupabaseClient } from "@supabase/supabase-js";

export interface CourseCompletion {
  /** Wymagane, opublikowane lekcje kursu — stan NA TERAZ. */
  total: number;
  /** Ile z nich kursant ma ukończonych. */
  done: number;
  percent: number;
  completed: boolean;
}

/**
 * Aktualny stan ukończenia kursu przez kursanta.
 *
 * Liczony ZAWSZE z bieżącej listy wymaganych, opublikowanych lekcji — nie
 * z zapisanego wcześniej `course_progress`. Dzięki temu, gdy kurs urośnie
 * o nowe lekcje po wydaniu certyfikatu, certyfikat przestaje być dostępny
 * do pobrania, dopóki kursant nie uzupełni nowego materiału.
 *
 * Jedno źródło prawdy dla: zapisu postępu, wydania certyfikatu, pobrania
 * certyfikatu i widoku panelu — żeby te cztery miejsca nie mogły się
 * rozjechać.
 */
export async function courseCompletion(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<CourseCompletion> {
  const [{ data: required }, { data: doneRows }] = await Promise.all([
    client
      .from("lessons")
      .select("id")
      .eq("course_id", courseId)
      .eq("status", "published")
      .eq("is_required", true),
    client
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "completed"),
  ]);

  const requiredIds = new Set((required ?? []).map((l) => l.id as string));
  const total = requiredIds.size;
  const done = (doneRows ?? []).filter((r) =>
    requiredIds.has(r.lesson_id as string)
  ).length;

  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    // Kurs bez wymaganych lekcji nie jest "ukończony" — chroni przed
    // wydaniem certyfikatu za pusty lub niegotowy kurs.
    completed: total > 0 && done >= total,
  };
}
