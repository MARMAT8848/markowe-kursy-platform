import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Operacje na dostępach (enrollments) — wspólna logika dla panelu admina
 * i (docelowo) webhooka płatności. Zawsze wywoływane z klientem service
 * role, PO potwierdzeniu uprawnień w warstwie wyżej.
 *
 * Model: dostęp = 12 miesięcy od aktywacji. „Przedłużenie" liczone od
 * później z: teraz lub bieżącej daty wygaśnięcia (żeby nie skracać).
 */
export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Nadaj/odnów aktywny dostęp na `months` miesięcy (domyślnie 12). */
export async function grantAccess(
  admin: SupabaseClient,
  userId: string,
  courseId: string,
  opts: { months?: number; orderId?: string | null; startAt?: Date } = {}
): Promise<{ ok: boolean; error?: string }> {
  const months = opts.months ?? 12;
  const start = opts.startAt ?? new Date();
  const expires = addMonths(start, months);

  const { error } = await admin.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    order_id: opts.orderId ?? null,
    status: "active",
    access_start_at: start.toISOString(),
    access_expires_at: expires.toISOString(),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Przedłuż istniejący dostęp o `months` (od późniejszej z dat: teraz /
 *  obecne wygaśnięcie) i reaktywuj status. */
export async function extendAccess(
  admin: SupabaseClient,
  enrollmentId: string,
  months = 12
): Promise<{ ok: boolean; error?: string }> {
  const { data: e } = await admin
    .from("enrollments")
    .select("access_expires_at")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!e) return { ok: false, error: "Nie znaleziono dostępu." };

  const now = new Date();
  const current = e.access_expires_at ? new Date(e.access_expires_at) : now;
  const base = current > now ? current : now;
  const expires = addMonths(base, months);

  const { error } = await admin
    .from("enrollments")
    .update({
      status: "active",
      access_expires_at: expires.toISOString(),
      revoked_at: null,
      revoked_reason: null,
    })
    .eq("id", enrollmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Cofnij dostęp (revoked). */
export async function revokeAccess(
  admin: SupabaseClient,
  enrollmentId: string,
  reason = "revoked_by_admin"
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await admin
    .from("enrollments")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_reason: reason,
    })
    .eq("id", enrollmentId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
