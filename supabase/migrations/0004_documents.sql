-- Documents: files attached to a job or a client, backed by a private Storage
-- bucket. Storage RLS policies scope by the first path segment ({user_id}/...)
-- since storage.objects has no denormalized user_id column of its own to
-- check directly the way the table policies elsewhere in this project do.

insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 52428800)
on conflict (id) do nothing;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  uploaded_at timestamptz not null default now(),
  constraint documents_has_target check (job_id is not null or client_id is not null)
);

create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists documents_job_id_idx on public.documents (job_id);
create index if not exists documents_client_id_idx on public.documents (client_id);

alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents
  for select using (user_id = auth.uid());
create policy "documents_insert_own" on public.documents
  for insert with check (user_id = auth.uid());
create policy "documents_delete_own" on public.documents
  for delete using (user_id = auth.uid());
-- no update policy: documents are replaced by delete+reupload, not edited in place

grant select, insert, delete on public.documents to authenticated;

-- Storage RLS: path convention is {user_id}/{job_or_client_id}/{filename}, so
-- the first folder segment is checked against auth.uid() directly.
create policy "documents_storage_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "documents_storage_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "documents_storage_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
