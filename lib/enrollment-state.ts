import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Stan posiadania kursów przez zalogowanego użytkownika (do logiki
 * przycisków wg ETAP 5 specyfikacji):
 * - "active"  → aktywny enrollment w oknie czasowym → „Przejdź do kursu",
 * - "expired" → miał dostęp, wygasł/cofnięty → „Odnów dostęp",
 * - brak wpisu → nie kupował → „Kup kurs".
 * Mapowane po slugu kursu. Pusta mapa dla niezalogowanych.
 */
export type OwnState = "active" | "expired";

export async function getUserCourseStates(): Promise<Record<string, OwnState>> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select("status, access_start_at, access_expires_at, courses(slug)");
  if (error || !enrollments) return {};

  const nowIso = new Date().toISOString();
  const states: Record<string, OwnState> = {};
  for (const e of enrollments) {
    const slug = (e.courses as unknown as { slug: string } | null)?.slug;
    if (!slug) continue;
    const activeNow =
      e.status === "active" &&
      !!e.access_start_at &&
      e.access_start_at <= nowIso &&
      !!e.access_expires_at &&
      e.access_expires_at > nowIso;
    // aktywny wygrywa z wygasłym (np. po ponownym zakupie)
    if (activeNow) states[slug] = "active";
    else if (states[slug] !== "active") states[slug] = "expired";
  }
  return states;
}
