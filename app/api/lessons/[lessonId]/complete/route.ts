import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { generateCertificate } from "@/lib/certificates/generate";

/**
 * POST /api/lessons/[lessonId]/complete  (ETAP 16)
 *
 * Oznacza lekcję jako ukończoną i przelicza postęp kursu.
 * Warunki (server-side, user z sesji):
 * - aktywny enrollment w oknie czasowym dostępu,
 * - lekcja opublikowana i MA treść (nie można "zaliczyć" lekcji WKRÓTCE
 *   — blokuje to wyłudzenie certyfikatu przez API),
 * - kurs ukończony = wszystkie wymagane lekcje z treścią ukończone
 *   → automatyczna, idempotentna generacja certyfikatu PDF.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  const { data: lesson } = await admin
    .from("lessons")
    .select("id, course_id, status, content_path, courses(status, certificate_enabled)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson || lesson.status !== "published") {
    return NextResponse.json({ error: "LESSON_NOT_FOUND" }, { status: 404 });
  }
  if (!lesson.content_path) {
    return NextResponse.json(
      { error: "LESSON_NOT_AVAILABLE", message: "Ta lekcja nie jest jeszcze dostępna." },
      { status: 409 }
    );
  }

  const nowIso = new Date().toISOString();
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", lesson.course_id)
    .eq("status", "active")
    .lte("access_start_at", nowIso)
    .gt("access_expires_at", nowIso)
    .limit(1)
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json({ error: "NO_ACCESS" }, { status: 403 });
  }

  // ---- zapis ukończenia lekcji ----
  const { error: upErr } = await admin.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_id: lesson.course_id,
      lesson_id: lesson.id,
      status: "completed",
      started_at: nowIso,
      completed_at: nowIso,
    },
    { onConflict: "user_id,lesson_id" }
  );
  if (upErr) {
    console.error("[complete] lesson_progress:", upErr.message);
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }

  // ---- przeliczenie postępu kursu ----
  // Ukończenie = WSZYSTKIE wymagane opublikowane lekcje (także te bez
  // treści — kurs nie może być "ukończony", dopóki treść nie istnieje;
  // chroni to przed wydaniem certyfikatu za niekompletny kurs).
  const { data: required } = await admin
    .from("lessons")
    .select("id")
    .eq("course_id", lesson.course_id)
    .eq("status", "published")
    .eq("is_required", true);
  const requiredIds = new Set((required ?? []).map((l) => l.id as string));

  const { data: doneRows } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("course_id", lesson.course_id)
    .eq("status", "completed");
  const doneRequired = (doneRows ?? []).filter((r) =>
    requiredIds.has(r.lesson_id as string)
  ).length;

  const total = requiredIds.size;
  const percent = total ? Math.round((doneRequired / total) * 100) : 0;
  const courseCompleted = total > 0 && doneRequired >= total;

  await admin.from("course_progress").upsert(
    {
      user_id: user.id,
      course_id: lesson.course_id,
      status: courseCompleted ? "completed" : "in_progress",
      progress_percent: percent,
      started_at: nowIso,
      ...(courseCompleted ? { completed_at: nowIso } : {}),
    },
    { onConflict: "user_id,course_id" }
  );

  // ---- certyfikat po ukończeniu kursu ----
  let certificateId: string | null = null;
  const courseMeta = lesson.courses as unknown as {
    certificate_enabled: boolean;
  } | null;
  if (courseCompleted && courseMeta?.certificate_enabled !== false) {
    try {
      const [{ data: profile }, { data: courseTr }] = await Promise.all([
        admin.from("profiles").select("full_name").eq("id", user.id).single(),
        admin
          .from("course_translations")
          .select("title")
          .eq("course_id", lesson.course_id)
          .eq("language", "pl")
          .single(),
      ]);
      const cert = await generateCertificate({
        userId: user.id,
        courseId: lesson.course_id,
        enrollmentId: enrollment.id,
        fullName: profile?.full_name || "Kursant",
        courseTitle: courseTr?.title || "Kurs",
      });
      certificateId = cert.id;
    } catch (e) {
      // ukończenie kursu zapisane; certyfikat można dogenerować ponownie
      console.error("[complete] certyfikat:", e);
    }
  }

  return NextResponse.json({
    completed: true,
    percent,
    courseCompleted,
    certificateId,
  });
}
