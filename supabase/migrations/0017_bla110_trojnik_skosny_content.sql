-- Kurs BLA-110: Lekcja 05 (Trójnik skośny) — podpięcie treści.
-- Idempotentne: ustawia content_path tylko gdy jeszcze puste.
update public.lessons
set content_path = 'lessons/bla-110/trojnik-skosny.html'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'trojnik-skosny'
  and content_path is null;
