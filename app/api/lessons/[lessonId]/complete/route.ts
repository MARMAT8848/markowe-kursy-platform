import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { generateCertificate } from "@/lib/certificates/generate";
import { courseCompletion } from "@/lib/certificates/eligibility";
import { queueAndSend } from "@/lib/emails";

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
  req: Request,
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
  // Wspólna funkcja z trasą pobierania certyfikatu — jedno źródło prawdy.
  const { percent, completed: courseCompleted } = await courseCompletion(
    admin,
    user.id,
    lesson.course_id as string
  );

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
      // Adres realnego żądania jako pierwszeństwo — jeśli zmienna
      // środowiskowa jest błędnie ustawiona (np. na localhost), certyfikat
      // i e-mail i tak dostaną poprawny, żywy adres produkcji.
      const envSite = process.env.NEXT_PUBLIC_SITE_URL;
      const site =
        envSite && !envSite.includes("localhost")
          ? envSite
          : new URL(req.url).origin;

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
        siteUrl: site,
      });
      certificateId = cert.id;

      // e-mail o wydanym certyfikacie (outbox; wysyłka gdy Resend gotowy)
      if (user.email) {
        await queueAndSend(
          "certificate_issued",
          user.email,
          {
            courseTitle: courseTr?.title || "Kurs",
            certificateNumber: cert.certificateNumber,
            verifyUrl: `${site}/verify-certificate/${cert.verificationSlug}`,
          },
          { userId: user.id }
        );
      }
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
