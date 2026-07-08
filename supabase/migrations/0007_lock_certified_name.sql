-- Blokada zmiany imienia i nazwiska po wydaniu certyfikatu.
--
-- Zagrożenie: użytkownik kończy kurs, otrzymuje certyfikat, po czym
-- zmienia full_name i doprowadza do wydania kolejnego certyfikatu na
-- inne nazwisko (unieważnienie + ponowna generacja, odnowienie dostępu
-- itd.). Zmiana idzie z przeglądarki wprost do bazy (RLS), więc blokada
-- w UI nie wystarczy - egzekwujemy regułę na poziomie bazy.
--
-- Reguła: gdy użytkownik ma choć jeden AKTYWNY (generated) certyfikat,
-- full_name może zmienić wyłącznie service role (panel admina / obsługa)
-- po świadomej decyzji. Konta bez certyfikatów - bez zmian.

create or replace function public.protect_certified_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_role text;
begin
  if new.full_name is distinct from old.full_name then
    -- rola z JWT (PostgREST); dla połączeń bezpośrednich (migracje,
    -- narzędzia administracyjne) będzie null -> bierzemy current_user
    jwt_role := coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
      current_user::text
    );
    if jwt_role not in ('service_role', 'postgres', 'supabase_admin') and exists (
      select 1
      from public.certificates
      where user_id = new.id
        and status = 'generated'
    ) then
      raise exception 'NAME_LOCKED_BY_CERTIFICATE'
        using hint = 'Imię i nazwisko jest powiązane z wydanym certyfikatem. Zmiana wymaga kontaktu z obsługą.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_certified_name on public.profiles;
create trigger trg_protect_certified_name
  before update of full_name on public.profiles
  for each row execute function public.protect_certified_name();
