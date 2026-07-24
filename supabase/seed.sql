-- ============================================================
-- MARKOWE KURSY — dane startowe (seed). Idempotentne (ON CONFLICT).
-- Cennik 2026-07. Kupowalny tylko BLA-110; reszta coming_soon.
-- ============================================================

-- ---------------- KURSY ----------------
insert into public.courses (id, slug, status, default_language, level, category, access_duration_months) values
  ('a1000000-0000-4000-8000-000000000001', 'izo-101', 'coming_soon', 'pl', 'podstawowy',            'izo',    12),
  ('a1000000-0000-4000-8000-000000000002', 'rys-110', 'coming_soon', 'pl', 'średnio zaawansowany',  'dok',    12),
  ('a1000000-0000-4000-8000-000000000003', 'izo-330', 'coming_soon', 'pl', 'średnio zaawansowany',  'obmiar', 12),
  ('a1000000-0000-4000-8000-000000000004', 'bla-110', 'published',   'pl', 'podstawowy',            'blacha', 12),
  ('a1000000-0000-4000-8000-000000000005', 'obm-210', 'coming_soon', 'pl', 'średnio zaawansowany',  'obmiar', 12)
on conflict (slug) do nothing;

insert into public.course_translations (course_id, language, title, short_description) values
  ('a1000000-0000-4000-8000-000000000001', 'pl', 'Podstawy izolacji przemysłowych', 'Rodzaje izolacji technicznych, dobór materiału i zasady montażu zgodne z praktyką wykonawczą.'),
  ('a1000000-0000-4000-8000-000000000002', 'pl', 'Rysunki techniczne w izolacji przemysłowej (ISO, P&ID, GA)', 'Interpretacja rysunków izometrycznych, schematów P&ID oraz rysunków ogólnych (GA) stosowanych przy realizacji robót.'),
  ('a1000000-0000-4000-8000-000000000003', 'pl', 'SketchUp dla obmiarowców izolacji przemysłowej', 'Modelowanie 3D w SketchUp na potrzeby obmiaru izolacji przemysłowych.'),
  ('a1000000-0000-4000-8000-000000000004', 'pl', 'Rozwiązania blacharskie płaszczy ochronnych', 'Wykonywanie rozwinięć blacharskich, kształtek i płaszczy ochronnych zgodnie z dokumentacją wykonawczą.'),
  ('a1000000-0000-4000-8000-000000000005', 'pl', 'Obmiarowanie izometryczne izolacji przemysłowych', 'Metodyka obmiaru rurociągów, armatury i zbiorników na podstawie dokumentacji ISO i P&ID.')
on conflict (course_id, language) do nothing;

-- ceny brutto PLN (grosze) — cennik 2026-07
insert into public.course_prices (course_id, provider, currency, amount, tax_behavior, active)
select v.course_id::uuid, 'stripe', 'PLN', v.amount, 'inclusive', true
from (values
  ('a1000000-0000-4000-8000-000000000001', 19900),
  ('a1000000-0000-4000-8000-000000000002', 24900),
  ('a1000000-0000-4000-8000-000000000003', 29900),
  ('a1000000-0000-4000-8000-000000000004', 34900),
  ('a1000000-0000-4000-8000-000000000005', 44900)
) as v(course_id, amount)
where not exists (
  select 1 from public.course_prices p
  where p.course_id = v.course_id::uuid and p.currency = 'PLN' and p.active
);

-- ---------------- ŚCIEŻKI KARIERY ----------------
insert into public.bundles (id, slug, status, level, sort_order) values
  ('b1000000-0000-4000-8000-000000000001', 'izoler',         'coming_soon', 'podstawowy',           1),
  ('b1000000-0000-4000-8000-000000000002', 'warsztatowiec',  'coming_soon', 'średnio zaawansowany', 2),
  ('b1000000-0000-4000-8000-000000000003', 'obmiarowiec',    'coming_soon', 'zaawansowany',         3),
  ('b1000000-0000-4000-8000-000000000004', 'brygadzista',    'coming_soon', 'zaawansowany',         4),
  ('b1000000-0000-4000-8000-000000000005', 'pelna-akademia', 'coming_soon', 'komplet',              5)
on conflict (slug) do nothing;

insert into public.bundle_translations (bundle_id, language, name, teaser) values
  ('b1000000-0000-4000-8000-000000000001', 'pl', 'Izoler',         'Pewny start w zawodzie — podstawy izolacji przemysłowych, od doboru materiału po poprawny montaż.'),
  ('b1000000-0000-4000-8000-000000000002', 'pl', 'Warsztatowiec',  'Prefabrykacja i płaszcze ochronne — czytasz rysunki techniczne i wykonujesz rozwinięcia blacharskie jak specjalista.'),
  ('b1000000-0000-4000-8000-000000000003', 'pl', 'Obmiarowiec',    'Przygotowanie do roli Insulation Surveyor — izometria, SketchUp i obmiar, czyli kompetencje, na których zarabia się najlepiej.'),
  ('b1000000-0000-4000-8000-000000000004', 'pl', 'Brygadzista',    'Kompetencje do nadzorowania robót — od dokumentacji ISO/P&ID, przez blacharkę, po kontrolę obmiaru wykonawczego.'),
  ('b1000000-0000-4000-8000-000000000005', 'pl', 'Pełna Akademia', 'Cała wiedza ekspercka w jednym pakiecie — najlepszy wybór, jeśli chcesz mieć dostęp do wszystkiego.')
on conflict (bundle_id, language) do nothing;

insert into public.bundle_courses (bundle_id, course_id) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000005'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000005'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000002'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000003'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004'),
  ('b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000005')
on conflict do nothing;

insert into public.bundle_prices (bundle_id, provider, currency, amount, compare_at_amount, tax_behavior, active)
select v.bundle_id::uuid, 'stripe', 'PLN', v.amount, v.compare_at, 'inclusive', true
from (values
  ('b1000000-0000-4000-8000-000000000001', 19900,  null::integer),
  ('b1000000-0000-4000-8000-000000000002', 59900,  79700),
  ('b1000000-0000-4000-8000-000000000003', 74900,  99700),
  ('b1000000-0000-4000-8000-000000000004', 89900, 124600),
  ('b1000000-0000-4000-8000-000000000005', 109900, 154500)
) as v(bundle_id, amount, compare_at)
where not exists (
  select 1 from public.bundle_prices p
  where p.bundle_id = v.bundle_id::uuid and p.currency = 'PLN' and p.active
);

-- ---------------- BLA-110: MODUŁY I LEKCJE ----------------
insert into public.modules (id, course_id, sort_order, status) values
  ('d1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 1, 'published'),
  ('d1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', 2, 'published'),
  ('d1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004', 3, 'published'),
  ('d1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 4, 'published'),
  ('d1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004', 5, 'published'),
  ('d1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000004', 6, 'published'),
  ('d1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000004', 7, 'published'),
  ('d1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000004', 8, 'published')
on conflict (id) do nothing;

insert into public.module_translations (module_id, language, title) values
  ('d1000000-0000-4000-8000-000000000001', 'pl', 'Kolana'),
  ('d1000000-0000-4000-8000-000000000002', 'pl', 'Trójniki'),
  ('d1000000-0000-4000-8000-000000000003', 'pl', 'Redukcje'),
  ('d1000000-0000-4000-8000-000000000004', 'pl', 'Przejście koła w kwadrat'),
  ('d1000000-0000-4000-8000-000000000005', 'pl', 'Dekle'),
  ('d1000000-0000-4000-8000-000000000006', 'pl', 'Kaptury'),
  ('d1000000-0000-4000-8000-000000000007', 'pl', 'Proste sekcje rurociągów'),
  ('d1000000-0000-4000-8000-000000000008', 'pl', 'Dennice')
on conflict (module_id, language) do nothing;

-- Lekcje: 01 i 03 mają treść (content_path); pozostałe = WKRÓTCE (null).
insert into public.lessons
  (id, course_id, module_id, slug, sort_order, status, is_preview, is_required, estimated_minutes, content_source, content_path, thumbnail_url) values
  ('e1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000001', 'kolano-90', 1, 'published', false, true, 25, 'static_html', 'lessons/bla-110/kolano-90.html', '/assets/thumb-kolano-90.png'),
  ('e1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000001', 'kolano-45', 2, 'published', false, true, 20, 'static_html', null, '/assets/thumb-kolano-45.png'),
  ('e1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'trojnik-prosty-te-same-srednice', 3, 'published', false, true, 24, 'static_html', 'lessons/bla-110/trojnik-prosty-te-same-srednice.html', '/assets/thumb-trojnik.png'),
  ('e1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'trojnik-prosty-rozne-srednice', 4, 'published', false, true, 22, 'static_html', null, '/assets/thumb-trojnik-rozne.png'),
  ('e1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'trojnik-skosny', 5, 'published', false, true, 23, 'static_html', null, '/assets/thumb-trojnik-skosny.png'),
  ('e1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'trojnik-przesuniety-osiowo', 6, 'published', false, true, 22, 'static_html', null, '/assets/thumb-trojnik-przesuniety.png'),
  ('e1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000003', 'redukcja-koncentryczna', 7, 'published', false, true, 18, 'static_html', null, '/assets/thumb-redukcja-koncentryczna.png'),
  ('e1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000003', 'redukcja-przesunieta-osiowo', 8, 'published', false, true, 20, 'static_html', null, '/assets/thumb-redukcja-osiowa.png'),
  ('e1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000004', 'przejscie-kola-w-kwadrat', 9, 'published', false, true, 21, 'static_html', null, '/assets/thumb-kolo-kwadrat.png'),
  ('e1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000005', 'dekiel-pelny', 10, 'published', false, true, 15, 'static_html', null, '/assets/thumb-dekiel-pelny.png'),
  ('e1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000005', 'dekiel-redukcyjny', 11, 'published', false, true, 17, 'static_html', null, '/assets/thumb-dekiel-redukcyjny.png'),
  ('e1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000006', 'kaptur-zaworowy', 12, 'published', false, true, 19, 'static_html', null, '/assets/thumb-kaptur-zaworowy.png'),
  ('e1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000006', 'kaptur-flanszowy', 13, 'published', false, true, 19, 'static_html', null, '/assets/thumb-kaptur-flanszowy.png'),
  ('e1000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000007', 'prosta-sekcja-rurociagu', 14, 'published', false, true, 14, 'static_html', null, '/assets/thumb-prosta-sekcja.png'),
  ('e1000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000008', 'dennica', 15, 'published', false, true, 23, 'static_html', null, '/assets/thumb-dennica.png')
on conflict (course_id, slug) do nothing;

insert into public.lesson_translations (lesson_id, language, title) values
  ('e1000000-0000-4000-8000-000000000001', 'pl', 'Kolano 90°'),
  ('e1000000-0000-4000-8000-000000000002', 'pl', 'Kolano 45°'),
  ('e1000000-0000-4000-8000-000000000003', 'pl', 'Trójnik prosty dla rurociągów o tych samych średnicach'),
  ('e1000000-0000-4000-8000-000000000004', 'pl', 'Trójnik prosty dla rurociągów o różnych średnicach'),
  ('e1000000-0000-4000-8000-000000000005', 'pl', 'Trójnik skośny'),
  ('e1000000-0000-4000-8000-000000000006', 'pl', 'Trójnik przesunięty osiowo'),
  ('e1000000-0000-4000-8000-000000000007', 'pl', 'Redukcja koncentryczna'),
  ('e1000000-0000-4000-8000-000000000008', 'pl', 'Redukcja przesunięta osiowo'),
  ('e1000000-0000-4000-8000-000000000009', 'pl', 'Przejście koła w kwadrat'),
  ('e1000000-0000-4000-8000-000000000010', 'pl', 'Dekiel pełny'),
  ('e1000000-0000-4000-8000-000000000011', 'pl', 'Dekiel redukcyjny'),
  ('e1000000-0000-4000-8000-000000000012', 'pl', 'Kaptur zaworowy'),
  ('e1000000-0000-4000-8000-000000000013', 'pl', 'Kaptur flanszowy'),
  ('e1000000-0000-4000-8000-000000000014', 'pl', 'Prosta sekcja rurociągu'),
  ('e1000000-0000-4000-8000-000000000015', 'pl', 'Dennica')
on conflict (lesson_id, language) do nothing;
