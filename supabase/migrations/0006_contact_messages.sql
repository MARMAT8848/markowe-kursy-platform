-- Wiadomości z formularza kontaktowego.
-- Trafiają do bazy (nic nie ginie, nawet gdy poczta nie działa),
-- a admin czyta je w panelu. RLS: deny-by-default, dostęp tylko service role.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null default 'Inne',
  message text not null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

revoke all on public.contact_messages from anon, authenticated;
grant all on public.contact_messages to service_role;
