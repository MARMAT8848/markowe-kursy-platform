import "server-only";
import { createSupabaseServer } from "@/lib/supabase/server";

/**
 * Server-side kontrola dostępu do kursów i lekcji (ETAP 15).
 * Ukrycie linku na froncie NIE wystarcza — każda chroniona trasa
 * przechodzi przez te funkcje. user_id wyłącznie z sesji.
 */

export type DenyReason =
  | "not_authenticated"
  | "no_enrollment"
  | "expired"
  | "course_not_found"
  | "lesson_not_found"
  | "db_not_ready";

export type CourseAccess =
  | {
      allowed: true;
      userId: string;
      courseId: string;
      accessExpiresAt: string | null;
    }
  | { allowed: false; reason: DenyReason };

export type LessonAccess =
  | {
      allowed: true;
      userId: string | null;
      courseId: string;
      lessonId: string;
      contentPath: string | null;
      isPreview: boolean;
    }
  | { allowed: false; reason: DenyReason };

/** Czy błąd Supabase oznacza brak wgranego schematu (tabele nie istnieją). */
function isMissingSchema(error: { code?: string } | null): boolean {
  return !!error && (error.code === "42P01" || error.code === "PGRST205");
}

export async function canAccessCourse(courseSlug: string): Promise<CourseAccess> {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, reason: "not_authenticated" };

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, status")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (isMissingSchema(courseErr)) return { allowed: false, reason: "db_not_ready" };
  if (!course || course.status !== "published")
    return { allowed: false, reason: "course_not_found" };

  // Admin ma dostęp bez enrollmentu (QA / podgląd treści).
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin === true) {
    return {
      allowed: true,
      userId: user.id,
      courseId: course.id,
      accessExpiresAt: null,
    };
  }

  const nowIso = new Date().toISOString();
  const { data: enrollment, error: enrErr } = await supabase
    .from("enrollments")
    .select("id, status, access_start_at, access_expires_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .lte("access_start_at", nowIso)
    .gt("access_expires_at", nowIso)
    .limit(1)
    .maybeSingle();
  if (isMissingSchema(enrErr)) return { allowed: false, reason: "db_not_ready" };

  if (!enrollment) {
    // Rozróżnij wygasły dostęp od braku zakupu (komunikat "Odnów dostęp").
    const { data: anyEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .limit(1)
      .maybeSingle();
    return {
      allowed: false,
      reason: anyEnrollment ? "expired" : "no_enrollment",
    };
  }

  return {
    allowed: true,
    userId: user.id,
    courseId: course.id,
    accessExpiresAt: enrollment.access_expires_at,
  };
}

export async function canAccessLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonAccess> {
  const supabase = await createSupabaseServer();

  // Lekcja preview jest publiczna — RLS też ją wtedy udostępnia.
  const { data: lesson, error: lessonErr } = await supabase
    .from("lessons")
    .select("id, course_id, status, is_preview, content_path, courses!inner(slug, status)")
    .eq("slug", lessonSlug)
    .eq("courses.slug", courseSlug)
    .maybeSingle();
  if (isMissingSchema(lessonErr)) return { allowed: false, reason: "db_not_ready" };

  if (lesson && lesson.status === "published" && lesson.is_preview) {
    return {
      allowed: true,
      userId: null,
      courseId: lesson.course_id,
      lessonId: lesson.id,
      contentPath: lesson.content_path,
      isPreview: true,
    };
  }

  // Nie-preview: najpierw dostęp do kursu (RLS ukrywa lekcje bez enrollmentu,
  // więc kolejność: kurs -> ponowny odczyt lekcji).
  const courseAccess = await canAccessCourse(courseSlug);
  if (!courseAccess.allowed) return courseAccess;

  const { data: fullLesson } = await supabase
    .from("lessons")
    .select("id, status, is_preview, content_path")
    .eq("slug", lessonSlug)
    .eq("course_id", courseAccess.courseId)
    .maybeSingle();
  if (!fullLesson || fullLesson.status !== "published")
    return { allowed: false, reason: "lesson_not_found" };

  return {
    allowed: true,
    userId: courseAccess.userId,
    courseId: courseAccess.courseId,
    lessonId: fullLesson.id,
    contentPath: fullLesson.content_path,
    isPreview: false,
  };
}
