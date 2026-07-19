-- 0013_bla110_trojnik_rozne_content.sql — dokłada treść do Lekcji 04 kursu
-- BLA-110 (trojnik-prosty-rozne-srednice), analogicznie do Lekcji 03.
-- Wiersz lekcji istnieje już w seed.sql (content_path = null / "WKRÓTCE"),
-- więc seed z ON CONFLICT DO NOTHING go nie zaktualizuje — stąd UPDATE.
-- Zastosuj skryptem scripts/db-apply.mjs; nie zmienia ceny ani statusu kursu.
begin;
update public.lessons
set content_path = 'lessons/bla-110/trojnik-prosty-rozne-srednice.html'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'trojnik-prosty-rozne-srednice'
  and content_path is null;
commit;
