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

  // Ukończenie lekcji (zalogowani z enrollmentem; nie w preview).
  // Karta „koniec lekcji" pojawia się WYŚRODKOWANA, gdy nagranie dobiegnie
  // końca (oś czasu #scrub osiąga maksimum) — identycznie na PC i mobile.
  // Nie zajmuje już miejsca w nagłówku ani pasku transportu.
  if (!access.isPreview && access.userId) {
    const supabase = await createSupabaseServer();
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("status")
      .eq("lesson_id", access.lessonId)
      .eq("user_id", access.userId)
      .maybeSingle();
    const isDone = progress?.status === "completed";
    const back = `/dashboard/courses/${courseSlug}`;

    const style = `<style>
      .mk-endwrap{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(20,20,15,.55)}
      .mk-endwrap.show{display:flex}
      .mk-endcard{width:min(420px,100%);background:#fff;border-radius:18px;padding:30px 26px 24px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.32);animation:mkPop .28s cubic-bezier(.2,.8,.2,1)}
      @keyframes mkPop{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:none}}
      .mk-endicon{width:56px;height:56px;margin:0 auto 14px;border-radius:50%;background:#EAF3EC;color:#2E7D46;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700}
      .mk-endkick{font:700 11px/1 var(--mono,monospace);letter-spacing:.16em;color:#2E7D46;margin-bottom:10px}
      .mk-endtitle{margin:0 0 8px;font:700 21px/1.2 var(--font,sans-serif);letter-spacing:-.02em;color:#161616}
      .mk-endtext{margin:0 0 20px;font:400 13.5px/1.55 var(--font,sans-serif);color:#6F6F6F}
      .mk-endbtn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;height:50px;border:none;border-radius:12px;background:#2E7D46;color:#fff;font:600 15px var(--font,sans-serif);cursor:pointer;text-decoration:none;box-sizing:border-box}
      .mk-endbtn:hover{background:#276b3c}
      .mk-endbtn[disabled]{opacity:.6;cursor:default}
      .mk-endclose{margin-top:12px;background:none;border:none;color:#6F6F6F;font:500 13px var(--font,sans-serif);cursor:pointer;text-decoration:underline;text-underline-offset:2px}
    </style>`;

    const cardInner = isDone
      ? `<div class="mk-endicon">✓</div>
         <div class="mk-endkick">LEKCJA UKOŃCZONA</div>
         <h2 class="mk-endtitle">Ta lekcja jest już zaliczona</h2>
         <p class="mk-endtext">Możesz wrócić do panelu kursu albo obejrzeć lekcję jeszcze raz.</p>
         <a class="mk-endbtn" href="${back}">Wróć do panelu kursu</a>
         <button class="mk-endclose" type="button" id="mkEndReplay">Obejrzyj jeszcze raz</button>`
      : `<div class="mk-endicon">✓</div>
         <div class="mk-endkick">KONIEC LEKCJI</div>
         <h2 class="mk-endtitle">Dotarłeś do końca lekcji</h2>
         <p class="mk-endtext">Oznacz lekcję jako ukończoną, aby zapisać postęp. Certyfikat otrzymasz po ukończeniu wszystkich lekcji kursu.</p>
         <button class="mk-endbtn mk-complete-btn" type="button"><span class="lbl">✓ Ukończ lekcję</span></button>
         <button class="mk-endclose" type="button" id="mkEndReplay">Obejrzyj jeszcze raz</button>`;

    const overlay = `<div class="mk-endwrap" id="mkEndWrap"><div class="mk-endcard" role="dialog" aria-modal="true">${cardInner}</div></div>`;

    const completeFn = isDone
      ? ""
      : `function run(btn){
          btn.disabled=true; var t=btn.querySelector('.lbl')||btn; var o=t.textContent; t.textContent='Zapisywanie…';
          fetch('/api/lessons/${access.lessonId}/complete',{method:'POST'})
            .then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d};});})
            .then(function(x){ if(x.ok){window.location='${back}';} else { btn.disabled=false; t.textContent=o; alert((x.d&&x.d.message)||'Nie udało się zapisać. Spróbuj ponownie.'); } })
            .catch(function(){ btn.disabled=false; t.textContent=o; });
        }
        document.querySelectorAll('.mk-complete-btn').forEach(function(b){ b.addEventListener('click',function(){run(b);}); });`;

    const script = `<script>(function(){
      var wrap=document.getElementById('mkEndWrap');
      var scrub=document.getElementById('scrub');
      function openCard(){ if(wrap) wrap.classList.add('show'); }
      function closeCard(){ if(wrap) wrap.classList.remove('show'); }
      var replay=document.getElementById('mkEndReplay');
      if(replay)replay.addEventListener('click',function(){ closeCard(); var r=document.getElementById('restart'); if(r)r.click(); });
      if(wrap)wrap.addEventListener('click',function(e){ if(e.target===wrap)closeCard(); });
      if(scrub){
        // Oś czasu istnieje: karta pojawia się, gdy nagranie dobiegnie końca.
        var shown=false;
        (function loop(){ var v=+scrub.value||0; if(v>=999){ if(!shown){shown=true;openCard();} } else { shown=false; } requestAnimationFrame(loop); })();
      } else {
        // Lekcja bez osi czasu — stały przycisk u dołu otwiera kartę.
        var fab=document.createElement('button'); fab.className='mk-endbtn';
        fab.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);width:auto;padding:0 22px;z-index:9998;box-shadow:0 8px 24px rgba(0,0,0,.2)';
        fab.textContent='✓ Zakończ lekcję'; fab.addEventListener('click',openCard); document.body.appendChild(fab);
      }
      ${completeFn}
    })();</script>`;

    html = html
      .replace("</head>", style + "</head>")
      .replace("</body>", overlay + script + "</body>");
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex",
    },
  });
}
