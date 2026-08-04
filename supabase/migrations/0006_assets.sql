-- Assets: Fleet, Fixed Assets, and Real Estate — three categories in one
-- table (category-specific fields left null for the other categories).
-- Distinct from inventory_items (consumables, not durable assets).

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (category in ('fleet', 'fixed_asset', 'real_estate')),
  name text not null,
  notes text,

  -- Fleet-only fields (null for other categories):
  status text check (status in ('available', 'in_use', 'maintenance')),
  current_job_id uuid references public.jobs (id) on delete set null,
  last_service_date date,

  -- Fixed Assets-only fields (null for other categories):
  quantity integer,
  location text,

  -- Real Estate-only fields (null for other categories):
  address text,
  square_footage numeric,

  created_at timestamptz not null default now()
);

create index if not exists assets_user_id_idx on public.assets (user_id);
create index if not exists assets_category_idx on public.assets (category);
create index if not exists assets_current_job_id_idx on public.assets (current_job_id);

alter table public.assets enable row level security;

create policy "assets_select_own" on public.assets
  for select using (user_id = auth.uid());
create policy "assets_insert_own" on public.assets
  for insert with check (user_id = auth.uid());
create policy "assets_update_own" on public.assets
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "assets_delete_own" on public.assets
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.assets to authenticated;
