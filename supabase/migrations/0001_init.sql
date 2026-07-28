-- CRM schema: clients, jobs, bids, activity_log
-- Every table carries its own user_id (denormalized owner) so RLS policies
-- can check user_id = auth.uid() directly, without joining through parents.

create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  company_name text,
  phone text,
  email text,
  address text,
  source text not null default 'other' check (source in ('referral', 'web', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  title text not null,
  status text not null default 'lead' check (
    status in ('lead', 'bid_sent', 'contract_signed', 'active', 'complete', 'lost')
  ),
  estimated_value numeric(12, 2),
  address text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on public.jobs (user_id);
create index if not exists jobs_client_id_idx on public.jobs (client_id);
create index if not exists jobs_status_idx on public.jobs (status);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  amount numeric(12, 2) not null,
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'accepted', 'rejected')
  ),
  sent_date date,
  expires_date date,
  created_at timestamptz not null default now()
);

create index if not exists bids_user_id_idx on public.bids (user_id);
create index if not exists bids_job_id_idx on public.bids (job_id);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  type text not null check (type in ('call', 'email', 'site_visit', 'note')),
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  constraint activity_log_has_target check (job_id is not null or client_id is not null)
);

create index if not exists activity_log_user_id_idx on public.activity_log (user_id);
create index if not exists activity_log_job_id_idx on public.activity_log (job_id);
create index if not exists activity_log_client_id_idx on public.activity_log (client_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.bids enable row level security;
alter table public.activity_log enable row level security;

create policy "clients_select_own" on public.clients
  for select using (user_id = auth.uid());
create policy "clients_insert_own" on public.clients
  for insert with check (user_id = auth.uid());
create policy "clients_update_own" on public.clients
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "clients_delete_own" on public.clients
  for delete using (user_id = auth.uid());

create policy "jobs_select_own" on public.jobs
  for select using (user_id = auth.uid());
create policy "jobs_insert_own" on public.jobs
  for insert with check (user_id = auth.uid());
create policy "jobs_update_own" on public.jobs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "jobs_delete_own" on public.jobs
  for delete using (user_id = auth.uid());

create policy "bids_select_own" on public.bids
  for select using (user_id = auth.uid());
create policy "bids_insert_own" on public.bids
  for insert with check (user_id = auth.uid());
create policy "bids_update_own" on public.bids
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bids_delete_own" on public.bids
  for delete using (user_id = auth.uid());

create policy "activity_log_select_own" on public.activity_log
  for select using (user_id = auth.uid());
create policy "activity_log_insert_own" on public.activity_log
  for insert with check (user_id = auth.uid());
create policy "activity_log_update_own" on public.activity_log
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "activity_log_delete_own" on public.activity_log
  for delete using (user_id = auth.uid());

-- RLS restricts rows, but PostgREST still needs the underlying role to hold
-- table-level privileges before it will attempt the query at all.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.bids to authenticated;
grant select, insert, update, delete on public.activity_log to authenticated;
