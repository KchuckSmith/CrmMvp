-- Step 1: PREVIEW — run this first and check the results before deleting anything.
select id, email, created_at
from auth.users
where email like 'test-reskin-%@example.com'
order by created_at;

-- Step 2: once you've confirmed the list above is exactly what you expect to
-- remove (and does NOT include qa-test@example.com), run this delete.
-- Cascades through clients/jobs/bids/activity_log/contacts/tasks/documents
-- automatically via each table's user_id foreign key.
delete from auth.users
where email like 'test-reskin-%@example.com';

-- Step 3 (optional): confirm qa-test@example.com is untouched and is now the
-- only test account left.
select id, email, created_at
from auth.users
where email like '%@example.com'
order by created_at;
