-- Kurs BLA-110: Lekcja 07 (Redukcja koncentryczna) — podpięcie treści.
-- Idempotentne: ustawia content_path tylko gdy jeszcze puste.
update public.lessons
set content_path = 'lessons/bla-110/redukcja-koncentryczna.html'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'redukcja-koncentryczna'
  and content_path is null;
