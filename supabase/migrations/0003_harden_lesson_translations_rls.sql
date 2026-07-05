-- ============================================================
-- 0003 — utwardzenie RLS na lesson_translations
-- Poprzednia polityka dopuszczała odczyt, jeśli istniał JAKIKOLWIEK
-- wiersz w lessons o danym id — bez sprawdzenia widoczności lekcji.
-- W praktyce lesson_translations trzyma tylko tytuły/streszczenia (treść
-- lekcji to plik poza bazą), ale porządkujemy to jednoznacznie: dostęp
-- do tłumaczenia = dostęp do samej lekcji (ta sama logika co lessons).
-- ============================================================

drop policy if exists lesson_translations_select on public.lesson_translations;

create policy lesson_translations_select on public.lesson_translations
  for select using (
    public.is_admin()
    or exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = lesson_translations.lesson_id
        and l.status = 'published'
        and c.status = 'published'
        and (
          l.is_preview
          or exists (
            select 1 from public.enrollments e
            where e.user_id = auth.uid()
              and e.course_id = l.course_id
              and e.status = 'active'
              and e.access_expires_at > now()
          )
        )
    )
  );
