-- Inventory: consumable supply tracking (rock, fuel, asphalt, etc.). Distinct
-- from the planned Assets/Fleet/Fixed-Assets tab — not related to this table.

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  unit text not null,
  quantity_on_hand numeric not null default 0,
  weekly_usage_rate numeric,
  target_quantity numeric,
  perishable boolean not null default false,
  restock_cadence_days integer,
  last_restocked_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_items_user_id_idx on public.inventory_items (user_id);

alter table public.inventory_items enable row level security;

create policy "inventory_items_select_own" on public.inventory_items
  for select using (user_id = auth.uid());
create policy "inventory_items_insert_own" on public.inventory_items
  for insert with check (user_id = auth.uid());
create policy "inventory_items_update_own" on public.inventory_items
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "inventory_items_delete_own" on public.inventory_items
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.inventory_items to authenticated;
