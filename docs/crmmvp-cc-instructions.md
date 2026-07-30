# CrmMvp — Add Contacts, Tasks, Documents

## Context
Existing schema: `clients`, `jobs`, `bids`, `activity_log` — each with its own denormalized `user_id`, RLS policies as direct `user_id = auth.uid()` checks (no subqueries/joins). Match this pattern exactly for the new tables. Do not refactor existing tables.

Build in this order: **Contacts → Tasks → Documents**. Each is a self-contained migration + server actions + UI slice. Do one at a time, stop after each for review — do not bulk-generate all three.

---

## 1. Contacts

**Why:** A `client` currently has one phone/email, but real clients (GCs, property owners) have multiple people (office manager, site super, owner). Contacts is a child of Clients.

**Schema** (new migration file, don't touch `0001_init.sql`):
```sql
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  role text, -- e.g. "Site Super", "Owner", "Office Manager"
  phone text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contacts enable row level security;

create policy "contacts_select" on contacts for select using (user_id = auth.uid());
create policy "contacts_insert" on contacts for insert with check (user_id = auth.uid());
create policy "contacts_update" on contacts for update using (user_id = auth.uid());
create policy "contacts_delete" on contacts for delete using (user_id = auth.uid());
```

**Server actions** (`lib/actions/contacts.ts`): `createContact`, `updateContact`, `deleteContact`, `getContactsByClient` — mirror the pattern in `lib/actions/clients.ts`.

**UI:** Add a Contacts section to the client detail page — list of contacts with role/phone/email, "Primary" badge, add/edit/delete inline. No new route needed; this lives inside the existing client detail page.

**Explicitly out of scope:** no contacts-only list/search page yet. No linking a contact directly to a job or activity_log entry — contacts only attach to clients for now.

---

## 2. Tasks

**Why:** Nothing today tracks "follow up Thursday" or "bid expires in 3 days." Tasks should surface on the dashboard, not live buried in a table.

**Schema:**
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  job_id uuid references jobs(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint task_must_link check (job_id is not null or client_id is not null)
);

alter table tasks enable row level security;

create policy "tasks_select" on tasks for select using (user_id = auth.uid());
create policy "tasks_insert" on tasks for insert with check (user_id = auth.uid());
create policy "tasks_update" on tasks for update using (user_id = auth.uid());
create policy "tasks_delete" on tasks for delete using (user_id = auth.uid());
```
(Same must-link-to-something pattern as `activity_log`.)

**Server actions** (`lib/actions/tasks.ts`): `createTask`, `completeTask` (set `completed_at`), `deleteTask`, `getOpenTasks` (filter `completed_at is null`, order by `due_date`).

**UI:**
- Dashboard: add a "Due Today / Overdue" widget above or beside the kanban board — pulls `getOpenTasks` filtered to `due_date <= today`.
- Job detail page and client detail page: add a small task list section (same pattern as Contacts on client detail), with a quick-add input and a checkbox to mark complete.

**Explicitly out of scope:** no recurring tasks, no assignment to other users (single-user app), no notifications/email reminders.

---

## 3. Documents

**Why:** No file storage exists today. This is the most infra-heavy of the three — needs a Supabase Storage bucket in addition to a table.

**Storage setup:**
- Create a private bucket, e.g. `documents`.
- Storage RLS policies must also scope by `auth.uid()` — use a path convention like `{user_id}/{job_or_client_id}/{filename}` so the storage policy can check the path prefix against `auth.uid()`. Confirm bucket policy syntax against current Supabase docs before writing it — storage RLS policy syntax differs from table RLS and may have changed.

**Schema:**
```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  job_id uuid references jobs(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  file_name text not null,
  file_path text not null, -- path within the storage bucket
  file_size bigint,
  uploaded_at timestamptz not null default now(),
  constraint document_must_link check (job_id is not null or client_id is not null)
);

alter table documents enable row level security;

create policy "documents_select" on documents for select using (user_id = auth.uid());
create policy "documents_insert" on documents for insert with check (user_id = auth.uid());
create policy "documents_delete" on documents for delete using (user_id = auth.uid());
-- no update policy: documents are replaced by delete+reupload, not edited in place
```

**Server actions** (`lib/actions/documents.ts`): `uploadDocument` (upload to storage, then insert row), `deleteDocument` (delete storage object, then row), `getDocumentsByJob`, `getDocumentsByClient`.

**UI:** Add a Documents section to job detail and client detail pages — file list with name/size/uploaded date, download link (signed URL), delete button, simple file-input upload form.

**Explicitly out of scope:** no in-browser preview/viewer, no versioning, no folder structure — flat list per job/client.

---

## General rules for this work
- One migration file per table, sequential numbering after `0001_init.sql`.
- Match existing code style in `lib/actions/` exactly — same error handling, same return shape.
- No changes to `clients`, `jobs`, `bids`, or existing `activity_log` schema or RLS.
- Stop after each of the 3 sections above and wait for review before starting the next.
- Flag before running anything destructive (dropping tables, `grant all`, deleting storage buckets) or touching anything outside the project folder.
