-- ============================================================
-- 0005 — newsletter (subskrybenci + kampanie)
--
-- Zgodność: double opt-in (dowód zgody: data, IP, user-agent),
-- jednoklikowy wypis tokenem (bez logowania), natychmiastowa
-- skuteczność. Zgoda = art. 6 ust. 1 lit. a RODO (polityka
-- prywatności pkt 4.7 już to przewiduje).
-- ============================================================

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'subscribed', 'unsubscribed')),
  -- tokeny akcji bez logowania
  confirm_token text not null unique,
  unsubscribe_token text not null unique,
  -- dowód zgody (double opt-in)
  consent_given_at timestamptz,   -- moment zapisu w formularzu
  confirmed_at timestamptz,       -- moment kliknięcia linku potwierdzającego
  consent_ip text,
  consent_user_agent text,
  unsubscribed_at timestamptz,
  source text,                    -- skąd zapis (footer / checkout / manual)
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_newsletter_status on public.newsletter_subscribers (status);
create trigger trg_newsletter_subscribers_updated
  before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preheader text,
  content text not null,          -- prosty format: akapity, '## ' nagłówki
  cta_label text,
  cta_url text,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'sent', 'cancelled')),
  recipients_count integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- powiązanie wysyłek kampanii z outboxem (statystyki + wznowienia)
alter table public.email_outbox
  add column if not exists campaign_id uuid references public.newsletter_campaigns(id);
create index if not exists idx_outbox_campaign
  on public.email_outbox (campaign_id) where campaign_id is not null;

-- RLS: brak polityk = brak dostępu z klienta; wyłącznie service role
-- (zapisy przez API, panel przez requireAdmin -> klient administracyjny).
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;

-- jawne granty dla service_role (defaulty z 0001 powinny to pokryć,
-- ale nie polegamy na tym w ciemno)
grant all privileges on table public.newsletter_subscribers to service_role;
grant all privileges on table public.newsletter_campaigns to service_role;
