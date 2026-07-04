-- ============================================================
-- 0002 — numeracja certyfikatów
-- Format: MK/ROK/NNNNN (sekwencja globalna, np. MK/2026/00001)
-- ============================================================

create or replace function public.next_certificate_number()
returns text language sql as $$
  select 'MK/' || extract(year from now())::text || '/' ||
         lpad(nextval('public.certificate_number_seq')::text, 5, '0');
$$;

grant execute on function public.next_certificate_number() to service_role;
