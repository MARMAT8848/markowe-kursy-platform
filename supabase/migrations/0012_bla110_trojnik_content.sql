-- 0012_bla110_trojnik_content.sql — dokłada treść do Lekcji 03 kursu BLA-110
-- (trojnik-prosty-te-same-srednice), analogicznie do Lekcji 01 (kolano-90).
-- Wiersz lekcji istnieje już w seed.sql (content_path = null / "WKRÓTCE"),
-- więc seed z ON CONFLICT DO NOTHING go nie zaktualizuje — stąd UPDATE.
-- Zastosuj skryptem scripts/db-apply.mjs; nie zmienia ceny ani statusu kursu.
begin;
update public.lessons
set content_path = 'lessons/bla-110/trojnik-prosty-te-same-srednice.html'
where course_id = 'a1000000-0000-4000-8000-000000000004'
  and slug = 'trojnik-prosty-te-same-srednice'
  and content_path is null;
commit;
