-- Zabezpieczenie rejestru migracji public._migrations.
--
-- Problem (Supabase Advisor, CRITICAL): tabela była w schemacie public bez
-- RLS, więc PostgREST wystawiał ją publicznie. Klucz anon (obecny w
-- bundlu przeglądarki) pozwalał NIE tylko czytać listę migracji, ale też
-- ZAPISYWAĆ do niej — a to umożliwiało sabotaż wdrożeń (oznaczenie
-- migracji jako zastosowanej → pominięcie jej przy deployu).
--
-- Rejestrem zarządza wyłącznie skrypt db-apply.mjs, łączący się bezpośrednio
-- jako postgres (omija RLS). Dlatego: włączamy RLS bez żadnych polityk
-- (deny-by-default dla anon/authenticated) i cofamy uprawnienia API.

alter table public._migrations enable row level security;

revoke all on public._migrations from anon, authenticated;
