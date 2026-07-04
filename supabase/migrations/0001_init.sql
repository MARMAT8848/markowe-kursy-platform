-- ============================================================
-- MARKOWE KURSY — schemat platformy kursowej (migracja 0001)
-- Postgres / Supabase. Kwoty pieniężne: integer w jednostkach
-- minor (grosze/centy). Dostęp: enrollment ważny 12 miesięcy.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Helper: trigger updated_at
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------
-- PROFILES (1:1 z auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  preferred_language text not null default 'pl',
  country text,
  company_name text,
  tax_id text,
  role text not null default 'student', -- informacyjne; źródłem prawdy admina jest admin_users
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-profil po rejestracji
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- ADMINI — jedyne źródło prawdy roli admin (używane w RLS)
-- ------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- KURSY
-- ------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'coming_soon', 'published', 'archived')),
  default_language text not null default 'pl',
  level text,
  category text,
  thumbnail_url text,
  certificate_enabled boolean not null default true,
  access_duration_months integer not null default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_courses_updated before update on public.courses
  for each row execute function public.set_updated_at();

create table public.course_translations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  language text not null,
  title text not null,
  short_description text,
  long_description text,
  learning_outcomes jsonb,
  target_audience jsonb,
  requirements jsonb,
  unique (course_id, language)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_modules_course on public.modules (course_id, sort_order);
create trigger trg_modules_updated before update on public.modules
  for each row execute function public.set_updated_at();

create table public.module_translations (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  language text not null,
  title text not null,
  description text,
  unique (module_id, language)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  slug text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_preview boolean not null default false,
  is_required boolean not null default true,
  estimated_minutes integer,
  content_source text, -- np. 'static_html' | 'rich_text' | 'video'
  content_path text,   -- np. 'lessons/bla-110/kolano-90.html'
  thumbnail_url text,  -- miniatura wiersza lekcji w panelu
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index idx_lessons_course on public.lessons (course_id, sort_order);
create trigger trg_lessons_updated before update on public.lessons
  for each row execute function public.set_updated_at();

create table public.lesson_translations (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  language text not null,
  title text not null,
  summary text,
  content jsonb,
  unique (lesson_id, language)
);

-- ------------------------------------------------------------
-- CENY (provider-agnostic)
-- ------------------------------------------------------------
create table public.course_prices (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  provider text not null default 'stripe',
  provider_price_id text,
  currency text not null default 'PLN',
  amount integer not null check (amount >= 0), -- grosze
  country text,
  language text,
  tax_behavior text, -- np. 'inclusive' | 'exclusive'
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_course_prices_lookup on public.course_prices (course_id, currency, active);

-- ------------------------------------------------------------
-- ŚCIEŻKI KARIERY (pakiety kursów)
-- Zakup ścieżki = jedno zamówienie → enrollment dla każdego kursu.
-- ------------------------------------------------------------
create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'coming_soon'
    check (status in ('draft', 'coming_soon', 'published', 'archived')),
  level text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_bundles_updated before update on public.bundles
  for each row execute function public.set_updated_at();

create table public.bundle_translations (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  language text not null,
  name text not null,
  teaser text,
  description text,
  unique (bundle_id, language)
);

create table public.bundle_courses (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  primary key (bundle_id, course_id)
);

create table public.bundle_prices (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  provider text not null default 'stripe',
  provider_price_id text,
  currency text not null default 'PLN',
  amount integer not null check (amount >= 0), -- grosze
  compare_at_amount integer, -- suma cen kursów osobno (przekreślona)
  country text,
  language text,
  tax_behavior text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_bundle_prices_lookup on public.bundle_prices (bundle_id, currency, active);

-- ------------------------------------------------------------
-- ZAMÓWIENIA I PŁATNOŚCI
-- ------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  -- produkt: kurs pojedynczy LUB ścieżka (dokładnie jedno wypełnione)
  course_id uuid references public.courses(id),
  bundle_id uuid references public.bundles(id),
  constraint chk_orders_product check (
    (course_id is not null and bundle_id is null)
    or (course_id is null and bundle_id is not null)
  ),
  provider text not null,
  provider_checkout_session_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  amount integer not null,
  currency text not null,
  customer_email text,
  billing_country text,
  tax_amount integer,
  tax_rate numeric,
  customer_tax_id text,
  -- ---- zgody prawne przy checkout (wymóg: zakup niemożliwy bez kompletu zgód) ----
  terms_accepted_at timestamptz,
  privacy_policy_accepted_at timestamptz,
  refund_policy_accepted_at timestamptz,
  digital_content_consent_at timestamptz,
  withdrawal_loss_acknowledged_at timestamptz,
  accepted_terms_version text,
  accepted_privacy_policy_version text,
  accepted_refund_policy_version text,
  accepted_cookie_policy_version text,
  user_ip text,
  user_agent text,
  -- dokładna treść zaakceptowanych zgód + wersje i daty dokumentów w chwili zakupu
  checkout_legal_snapshot_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index uq_orders_provider_session
  on public.orders (provider, provider_checkout_session_id)
  where provider_checkout_session_id is not null;
create index idx_orders_user on public.orders (user_id, created_at desc);
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  user_id uuid not null references public.profiles(id),
  course_id uuid references public.courses(id), -- null przy zakupie ścieżki
  bundle_id uuid references public.bundles(id),
  provider text not null,
  provider_payment_id text,
  provider_payment_intent_id text,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  amount integer not null,
  currency text not null,
  tax_amount integer,
  provider_tax_details jsonb,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index uq_payments_provider_payment
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;
create index idx_payments_user on public.payments (user_id, created_at desc);

-- ------------------------------------------------------------
-- ENROLLMENTY (dostęp 12 miesięcy)
-- ------------------------------------------------------------
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  order_id uuid references public.orders(id),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'revoked')),
  access_start_at timestamptz,
  access_expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, order_id)
);
-- szybki lookup aktywnego dostępu (canAccessCourse)
create index idx_enrollments_active
  on public.enrollments (user_id, course_id)
  where status = 'active';
create trigger trg_enrollments_updated before update on public.enrollments
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- POSTĘP
-- ------------------------------------------------------------
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  lesson_id uuid not null references public.lessons(id),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index idx_lesson_progress_user_course on public.lesson_progress (user_id, course_id);
create trigger trg_lesson_progress_updated before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent numeric not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
create trigger trg_course_progress_updated before update on public.course_progress
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- CERTYFIKATY
-- ------------------------------------------------------------
create sequence public.certificate_number_seq;

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  enrollment_id uuid not null references public.enrollments(id),
  certificate_number text not null unique,
  verification_slug text not null unique,
  status text not null default 'generated'
    check (status in ('generated', 'revoked', 'failed')),
  issued_at timestamptz,
  revoked_at timestamptz,
  pdf_storage_path text,
  created_at timestamptz not null default now()
);
-- twarda idempotencja: jeden aktywny certyfikat na enrollment
create unique index uq_certificates_active_per_enrollment
  on public.certificates (enrollment_id)
  where status = 'generated';
create index idx_certificates_user on public.certificates (user_id);

-- ------------------------------------------------------------
-- WEBHOOKI (idempotencja) I OUTBOX E-MAILI
-- ------------------------------------------------------------
create table public.payment_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text,
  status text not null default 'received'
    check (status in ('received', 'processed', 'ignored', 'failed')),
  raw_payload jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  email_to text not null,
  template_key text not null,
  language text not null default 'pl',
  subject text,
  payload jsonb,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_email_outbox_status on public.email_outbox (status, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- Service role omija RLS (webhooki, certyfikaty, e-maile — tylko serwer).
-- ============================================================
alter table public.profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.courses enable row level security;
alter table public.course_translations enable row level security;
alter table public.modules enable row level security;
alter table public.module_translations enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_translations enable row level security;
alter table public.course_prices enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_translations enable row level security;
alter table public.bundle_courses enable row level security;
alter table public.bundle_prices enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.payment_provider_events enable row level security;
alter table public.email_outbox enable row level security;

-- profiles: własny odczyt/aktualizacja; admin wszystko
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- admin_users: tylko admin widzi listę (własny wpis też przez is_admin)
create policy admin_users_select on public.admin_users
  for select using (public.is_admin());

-- kursy: publicznie tylko opublikowane / zapowiedzi; admin wszystko
create policy courses_select_public on public.courses
  for select using (status in ('published', 'coming_soon') or public.is_admin());
create policy courses_admin_all on public.courses
  for all using (public.is_admin());

create policy course_translations_select on public.course_translations
  for select using (
    exists (select 1 from public.courses c
            where c.id = course_id and c.status in ('published', 'coming_soon'))
    or public.is_admin()
  );

create policy modules_select on public.modules
  for select using (
    exists (select 1 from public.courses c
            where c.id = course_id and c.status in ('published', 'coming_soon'))
    or public.is_admin()
  );
create policy module_translations_select on public.module_translations
  for select using (
    exists (select 1 from public.modules m
            join public.courses c on c.id = m.course_id
            where m.id = module_id and c.status in ('published', 'coming_soon'))
    or public.is_admin()
  );

-- lekcje (metadane): preview publicznie; pełna lista dla aktywnego enrollmentu; admin wszystko
create policy lessons_select on public.lessons
  for select using (
    public.is_admin()
    or (
      status = 'published'
      and exists (select 1 from public.courses c
                  where c.id = course_id and c.status = 'published')
      and (
        is_preview
        or exists (
          select 1 from public.enrollments e
          where e.user_id = auth.uid()
            and e.course_id = lessons.course_id
            and e.status = 'active'
            and e.access_expires_at > now()
        )
      )
    )
  );
create policy lesson_translations_select on public.lesson_translations
  for select using (
    public.is_admin()
    or exists (select 1 from public.lessons l where l.id = lesson_id) -- filtrowane przez RLS lessons
  );

-- ceny: publicznie tylko aktywne
create policy course_prices_select on public.course_prices
  for select using (active or public.is_admin());

-- ścieżki kariery: publicznie widoczne opublikowane/zapowiedzi
create policy bundles_select on public.bundles
  for select using (status in ('published', 'coming_soon') or public.is_admin());
create policy bundles_admin_all on public.bundles
  for all using (public.is_admin());
create policy bundle_translations_select on public.bundle_translations
  for select using (
    exists (select 1 from public.bundles b
            where b.id = bundle_id and b.status in ('published', 'coming_soon'))
    or public.is_admin()
  );
create policy bundle_courses_select on public.bundle_courses
  for select using (
    exists (select 1 from public.bundles b
            where b.id = bundle_id and b.status in ('published', 'coming_soon'))
    or public.is_admin()
  );
create policy bundle_prices_select on public.bundle_prices
  for select using (active or public.is_admin());

-- zamówienia / płatności / enrollmenty / certyfikaty: tylko własne (zapis: service role)
create policy orders_select_own on public.orders
  for select using (user_id = auth.uid() or public.is_admin());
create policy payments_select_own on public.payments
  for select using (user_id = auth.uid() or public.is_admin());
create policy enrollments_select_own on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy certificates_select_own on public.certificates
  for select using (user_id = auth.uid() or public.is_admin());

-- postęp: odczyt własny; zapis własny wyłącznie przy aktywnym dostępie
create policy lesson_progress_select_own on public.lesson_progress
  for select using (user_id = auth.uid() or public.is_admin());
create policy lesson_progress_write_own on public.lesson_progress
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id = lesson_progress.course_id
        and e.status = 'active'
        and e.access_expires_at > now()
    )
  );
create policy lesson_progress_update_own on public.lesson_progress
  for update using (user_id = auth.uid());

create policy course_progress_select_own on public.course_progress
  for select using (user_id = auth.uid() or public.is_admin());

-- payment_provider_events / email_outbox: brak polityk dla klienta
-- (dostęp wyłącznie przez service role po stronie serwera; admin przez panel)
create policy payment_events_admin on public.payment_provider_events
  for select using (public.is_admin());
create policy email_outbox_admin on public.email_outbox
  for select using (public.is_admin());

-- ------------------------------------------------------------
-- Backfill: profile dla kont założonych PRZED wgraniem migracji
-- (trigger on_auth_user_created działa tylko dla nowych rejestracji)
-- ------------------------------------------------------------
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data->>'full_name', '')
from auth.users u
on conflict (id) do nothing;
