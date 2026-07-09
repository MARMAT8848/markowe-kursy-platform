-- Jeden AKTYWNY dostęp na parę (użytkownik, kurs).
--
-- Problem: grantAccess robił zwykły INSERT, a jedyne ograniczenie to
-- unique (user_id, course_id, order_id). Dla ręcznych nadań order_id jest
-- NULL, a w Postgresie NULL-e są w unikatach traktowane jako różne — więc
-- można było nadać ten sam dostęp wielokrotnie (duplikaty na liście).

-- 1) Sprzątanie istniejących duplikatów: zostaw dostęp z NAJDALSZĄ datą
--    wygaśnięcia (najlepszy dla kursanta). Nadmiarowe BEZ certyfikatu to
--    czyste pomyłki → usuwamy. Te powiązane z wydanym certyfikatem (gdyby
--    się zdarzyły) zostawiamy jako revoked, by nie naruszyć FK certyfikatu.
delete from public.enrollments e
using (
  select id,
         row_number() over (
           partition by user_id, course_id
           order by access_expires_at desc nulls last, created_at desc
         ) as rn
  from public.enrollments
  where status = 'active'
) r
where e.id = r.id
  and r.rn > 1
  and not exists (select 1 from public.certificates c where c.enrollment_id = e.id);

update public.enrollments e
set status = 'revoked',
    revoked_at = now(),
    revoked_reason = 'duplicate_merged'
from (
  select id,
         row_number() over (
           partition by user_id, course_id
           order by access_expires_at desc nulls last, created_at desc
         ) as rn
  from public.enrollments
  where status = 'active'
) r
where e.id = r.id
  and r.rn > 1;

-- 2) Twarda gwarancja na przyszłość: najwyżej jeden aktywny dostęp na
--    (użytkownik, kurs). Chroni nawet przy błędzie logiki lub wyścigu.
create unique index if not exists uq_enrollments_one_active
  on public.enrollments (user_id, course_id)
  where status = 'active';
