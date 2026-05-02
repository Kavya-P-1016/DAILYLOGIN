-- Dailylogin: run this once in the Supabase SQL Editor (SQL → New query → Run).
-- Then paste your project URL + anon key into the app under Saved logs → Cloud sync.

create table if not exists public.daily_log_entries (
  id text primary key,
  sync_group text not null,
  log_date text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists daily_log_entries_sync_group_idx
  on public.daily_log_entries (sync_group);

create index if not exists daily_log_entries_log_date_idx
  on public.daily_log_entries (log_date);

alter table public.daily_log_entries enable row level security;

-- Anonymous access is required for this static HTML app (no login flow).
-- Anyone with your anon key can hit the API; treat your sync code as a shared secret
-- and use a long random value. For stronger isolation, add Supabase Auth later.
create policy "daily_log_entries_anon_all"
  on public.daily_log_entries
  for all
  using (true)
  with check (true);
