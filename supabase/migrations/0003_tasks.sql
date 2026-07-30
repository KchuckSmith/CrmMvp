-- Tasks: follow-ups/reminders attached to a job or a client (or both-optional,
-- same must-link-to-something shape as activity_log).

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tasks_has_target check (job_id is not null or client_id is not null)
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_job_id_idx on public.tasks (job_id);
create index if not exists tasks_client_id_idx on public.tasks (client_id);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks
  for insert with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.tasks to authenticated;
