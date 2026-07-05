-- ============================================================
-- 0004 — znaczniki wysłanych powiadomień o wygasaniu dostępu
-- Zapobiegają wielokrotnej wysyłce tego samego przypomnienia
-- przez codzienny cron.
-- ============================================================

alter table public.enrollments
  add column if not exists reminder_30_sent_at timestamptz,
  add column if not exists reminder_7_sent_at timestamptz,
  add column if not exists expired_notified_at timestamptz;
