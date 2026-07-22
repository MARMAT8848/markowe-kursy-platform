-- Kurs BLA-110: Lekcja 09 (Przejście koła w kwadrat) — podpięcie treści.
-- Idempotentne: ustawia content_path tylko gdy jeszcze puste.
update public.lessons
set content_path = 'lessons/bla-110/przejscie-kola-w-kwadrat.html'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'przejscie-kola-w-kwadrat'
  and content_path is null;
