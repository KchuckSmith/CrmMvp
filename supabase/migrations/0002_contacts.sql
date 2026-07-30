-- Contacts: people at a client (office manager, site super, owner), child of clients.

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  role text,
  phone text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contacts_user_id_idx on public.contacts (user_id);
create index if not exists contacts_client_id_idx on public.contacts (client_id);

alter table public.contacts enable row level security;

create policy "contacts_select_own" on public.contacts
  for select using (user_id = auth.uid());
create policy "contacts_insert_own" on public.contacts
  for insert with check (user_id = auth.uid());
create policy "contacts_update_own" on public.contacts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contacts_delete_own" on public.contacts
  for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.contacts to authenticated;
