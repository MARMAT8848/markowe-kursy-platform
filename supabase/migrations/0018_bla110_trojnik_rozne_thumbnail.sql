-- Kurs BLA-110: Lekcja 04 (Trójnik prosty - różne średnice) — miniatura na stronie kursu.
-- Idempotentne: ustawia thumbnail_url tylko gdy jeszcze pusty.
update public.lessons
set thumbnail_url = '/assets/thumb-trojnik-rozne.png'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'trojnik-prosty-rozne-srednice'
  and thumbnail_url is null;
