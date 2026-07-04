import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { canAccessLesson } from "@/lib/access";

/**
 * GET /learn/[courseSlug]/[lessonSlug]
 *
 * Serwuje lekcję (samodzielny plik HTML z content/lessons/ — POZA /public,
 * niedostępny bez tej trasy). Dostęp sprawdzany server-side przy KAŻDYM
 * żądaniu; odpowiedź z Cache-Control: no-store, żeby treść płatna nie
 * osiadała w cache'ach.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  const { courseSlug, lessonSlug } = await params;
  const origin = new URL(req.url).origin;

  const access = await canAccessLesson(courseSlug, lessonSlug);
  if (!access.allowed) {
    const target =
      access.reason === "not_authenticated" || access.reason === "db_not_ready"
        ? `/login?next=${encodeURIComponent(`/learn/${courseSlug}/${lessonSlug}`)}`
        : `/courses/${courseSlug}`;
    return NextResponse.redirect(new URL(target, origin), { status: 303 });
  }

  if (!access.contentPath) {
    // Lekcja bez gotowej treści ("WKRÓTCE") — wróć do panelu kursu.
    return NextResponse.redirect(
      new URL(`/dashboard/courses/${courseSlug}`, origin),
      { status: 303 }
    );
  }

  // Ścieżka wyłącznie z bazy (nie z URL-a) — brak ryzyka path traversal;
  // dodatkowo twarda walidacja, że plik leży w content/lessons.
  const contentRoot = path.join(process.cwd(), "content", "lessons");
  const filePath = path.resolve(contentRoot, access.contentPath.replace(/^lessons\//, ""));
  if (!filePath.startsWith(contentRoot)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let html: string;
  try {
    html = await fs.readFile(filePath, "utf8");
  } catch {
    return new NextResponse("Lekcja tymczasowo niedostępna", { status: 404 });
  }

  // Przycisk „OPUŚĆ LEKCJĘ" prowadzi do panelu tego kursu.
  html = html.replace(
    'href="panel-kursu.html"',
    `href="/dashboard/courses/${courseSlug}"`
  );
  // Względne ścieżki zasobów (assets/...) → absolutne (/assets/...),
  // bo lekcja jest serwowana spod /learn/[kurs]/[lekcja].
  html = html.replaceAll('src="assets/', 'src="/assets/');

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
