import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { canAccessLesson } from "@/lib/access";
import { createSupabaseServer } from "@/lib/supabase/server";

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

  // Przycisk „UKOŃCZ LEKCJĘ" (zalogowani z enrollmentem; nie w preview).
  // Desktop: w nagłówku. Mobile (≤560px, gdzie nagłówek jest ciasny i nie
  // zawija się): w pasku transportu, który zawija się poprawnie. Oba
  // wariantami widoczności CSS — nigdy nie przepełniają układu.
  if (!access.isPreview && access.userId) {
    const supabase = await createSupabaseServer();
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("status")
      .eq("lesson_id", access.lessonId)
      .eq("user_id", access.userId)
      .maybeSingle();
    const isDone = progress?.status === "completed";

    const style = `<style>
      @media(max-width:560px){ .hdr .mk-complete{display:none!important} }
      @media(min-width:561px){ .transport .mk-complete{display:none!important} }
      .transport .mk-complete{border-color:#2E7D46;background:#2E7D46;color:#fff}
      .transport .mk-complete.done{background:#EAF3EC;color:#2E7D46;border-color:#CDE6D3;pointer-events:none}
      @media(max-width:560px){ .transport .mk-complete{flex:1 1 auto} }
    </style>`;

    const hdrBtn = isDone
      ? `<span class="hbtn mk-complete done" style="pointer-events:none;opacity:.7;background:#EAF3EC;color:#2E7D46;border-color:#CDE6D3">✓ UKOŃCZONA</span>`
      : `<button class="hbtn mk-complete mk-complete-btn" type="button" title="Oznacz lekcję jako ukończoną">✓ UKOŃCZ LEKCJĘ</button>`;
    const trBtn = isDone
      ? `<button class="pbtn mk-complete done" type="button">✓ Ukończona</button>`
      : `<button class="pbtn mk-complete mk-complete-btn" type="button"><span class="lbl">✓ Ukończ lekcję</span></button>`;

    html = html
      .replace("</head>", style + "</head>")
      .replace(
        '<a class="hbtn" href="/dashboard/courses',
        `${hdrBtn}<a class="hbtn" href="/dashboard/courses`
      )
      .replace('<div class="tl-col">', `${trBtn}<div class="tl-col">`);

    if (!isDone) {
      const script = `<script>(function(){
        var back='/dashboard/courses/${courseSlug}';
        function run(btn){
          btn.disabled=true; var t=btn.querySelector('.lbl')||btn; var o=t.textContent; t.textContent='Zapisywanie…';
          fetch('/api/lessons/${access.lessonId}/complete',{method:'POST'})
            .then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d};});})
            .then(function(x){ if(x.ok){window.location=back;} else { btn.disabled=false; t.textContent=o; alert((x.d&&x.d.message)||'Nie udało się zapisać. Spróbuj ponownie.'); } })
            .catch(function(){ btn.disabled=false; t.textContent=o; });
        }
        document.querySelectorAll('.mk-complete-btn').forEach(function(b){ b.addEventListener('click',function(){run(b);}); });
      })();</script>`;
      html = html.replace("</body>", script + "</body>");
    }
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
