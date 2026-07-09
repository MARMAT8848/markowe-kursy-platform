-- Sekwencje newslettera (lejek sprzedażowy): automatyczna seria wiadomości
-- od pierwszego kontaktu (potwierdzony zapis) do sprzedaży.
--
-- Model:
--   newsletter_sequences        - definicja lejka (nazwa, status),
--   newsletter_sequence_steps   - kroki: opóźnienie w DNIACH od poprzedniego
--                                 kroku + treść (format jak kampanie),
--   newsletter_sequence_progress- gdzie w lejku jest dany subskrybent.
--
-- Silnik wysyłki działa w cronie (process-outbox): raz dziennie wysyła
-- zaległe kroki. Krok 1 z opóźnieniem 0 wychodzi od razu po potwierdzeniu
-- zapisu. Wypis lub zakup kursu zatrzymuje lejek dla danej osoby.

create table if not exists public.newsletter_sequences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'paused' check (status in ('active', 'paused')),
  -- zatrzymaj lejek osobom, które już kupiły kurs (mają aktywny dostęp)
  stop_for_customers boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_newsletter_sequences_updated
  before update on public.newsletter_sequences
  for each row execute function public.set_updated_at();

create table if not exists public.newsletter_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.newsletter_sequences(id) on delete cascade,
  position int not null,
  -- dni od POPRZEDNIEGO kroku (dla kroku 1: od potwierdzenia zapisu; 0 = od razu)
  delay_days int not null default 0 check (delay_days >= 0),
  subject text not null,
  preheader text,
  content text not null,
  cta_label text,
  cta_url text,
  created_at timestamptz not null default now(),
  unique (sequence_id, position)
);

create table if not exists public.newsletter_sequence_progress (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.newsletter_sequences(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  next_position int not null default 1,
  next_send_at timestamptz,
  completed_at timestamptz,
  stopped_reason text, -- 'unsubscribed' | 'customer' | 'admin'
  created_at timestamptz not null default now(),
  unique (sequence_id, subscriber_id)
);
create index if not exists idx_seq_progress_due
  on public.newsletter_sequence_progress (next_send_at)
  where completed_at is null and stopped_reason is null;

-- outbox: powiązanie wysłanego maila z krokiem sekwencji (statystyki)
alter table public.email_outbox
  add column if not exists sequence_step_id uuid
    references public.newsletter_sequence_steps(id) on delete set null;

-- RLS deny-by-default: dostęp wyłącznie service role (panel admina / cron).
alter table public.newsletter_sequences enable row level security;
alter table public.newsletter_sequence_steps enable row level security;
alter table public.newsletter_sequence_progress enable row level security;

revoke all on public.newsletter_sequences from anon, authenticated;
revoke all on public.newsletter_sequence_steps from anon, authenticated;
revoke all on public.newsletter_sequence_progress from anon, authenticated;
grant all on public.newsletter_sequences to service_role;
grant all on public.newsletter_sequence_steps to service_role;
grant all on public.newsletter_sequence_progress to service_role;
