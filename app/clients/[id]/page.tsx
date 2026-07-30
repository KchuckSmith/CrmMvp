import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { editClient, removeClient } from "@/lib/actions/clients";
import { addJob } from "@/lib/actions/jobs";
import { createContact, updateContact, deleteContact } from "@/lib/actions/contacts";
import { ClientForm } from "../client-form";
import { ContactForm } from "../contact-form";
import { JobForm } from "@/app/jobs/job-form";
import { TaskForm } from "@/app/task-form";
import { TaskList } from "@/app/task-list";
import { DocumentForm } from "@/app/document-form";
import { DocumentList, type DocumentItem } from "@/app/document-list";
import { ActivityForm } from "@/app/activity-form";
import { ActivityTimeline } from "@/app/activity-timeline";
import { JOB_STATUS_OPTIONS } from "@/lib/job-status";
import type { JobStatus } from "@/lib/supabase/types";
import { SubmitButton } from "@/app/submit-button";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (clientError || !client) {
    notFound();
  }

  const [{ data: jobs }, { data: activity }, { data: contacts }, { data: tasks }, { data: documents }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id, title, status, estimated_value")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("id, type, body, created_at")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, name, role, phone, email, is_primary")
        .eq("client_id", id)
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title, due_date")
        .eq("client_id", id)
        .is("completed_at", null)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("documents")
        .select("id, file_name, file_path, file_size, uploaded_at")
        .eq("client_id", id)
        .order("uploaded_at", { ascending: false }),
    ]);

  const documentItems: DocumentItem[] = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 3600);
      return { ...doc, signedUrl: signed?.signedUrl ?? null };
    })
  );

  const statusLabel = (status: JobStatus) =>
    JOB_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clients" className="text-xs text-zinc-500 hover:underline">
            ← Clients
          </Link>
          <h1 className="font-serif text-xl font-bold text-black">{client.name}</h1>
        </div>
        <form action={removeClient.bind(null, client.id)}>
          <SubmitButton
            pendingText="Deleting…"
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete client
          </SubmitButton>
        </form>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 font-serif text-base font-semibold text-black">
          Contact info
        </h2>
        <ClientForm
          action={editClient.bind(null, client.id)}
          submitLabel="Save changes"
          defaultValues={client}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-base font-semibold text-black">Contacts</h2>
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {contacts?.length === 0 && (
            <p className="p-4 text-sm text-zinc-500">No contacts yet.</p>
          )}
          {contacts?.map((contact) => (
            <div key={contact.id} className="flex flex-col gap-2 p-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">{contact.name}</span>
                  {contact.is_primary && (
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      Primary
                    </span>
                  )}
                  {contact.role && (
                    <span className="text-xs text-zinc-500">{contact.role}</span>
                  )}
                </div>
                <form action={deleteContact.bind(null, contact.id, client.id)}>
                  <SubmitButton
                    pendingText="Deleting…"
                    className="text-xs text-zinc-500 hover:text-red-600"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </div>
              <span className="text-xs text-zinc-600">
                {[contact.phone, contact.email].filter(Boolean).join(" · ") ||
                  "No contact details"}
              </span>
              <details>
                <summary className="cursor-pointer text-xs font-medium text-zinc-500">
                  Edit
                </summary>
                <div className="mt-3">
                  <ContactForm
                    action={updateContact.bind(null, contact.id, client.id)}
                    submitLabel="Save changes"
                    defaultValues={contact}
                  />
                </div>
              </details>
            </div>
          ))}
        </div>
        <details className="rounded-lg border border-zinc-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">
            + Add contact
          </summary>
          <div className="mt-4">
            <ContactForm
              action={createContact.bind(null, client.id)}
              submitLabel="Add contact"
            />
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-black">Jobs</h2>
        </div>
        <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
          {jobs?.length === 0 && (
            <p className="p-4 text-sm text-zinc-500">No jobs yet.</p>
          )}
          {jobs?.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between p-4 text-sm hover:bg-zinc-50"
            >
              <span className="font-medium text-zinc-900">{job.title}</span>
              <span className="text-xs text-zinc-500">
                {statusLabel(job.status)}
              </span>
            </Link>
          ))}
        </div>
        <details className="rounded-lg border border-zinc-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">
            + Add job
          </summary>
          <div className="mt-4">
            <JobForm action={addJob.bind(null, client.id)} submitLabel="Add job" />
          </div>
        </details>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-base font-semibold text-black">Tasks</h2>
        <TaskForm target={{ clientId: client.id }} />
        <TaskList items={tasks ?? []} target={{ clientId: client.id }} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-base font-semibold text-black">Documents</h2>
        <DocumentForm target={{ clientId: client.id }} />
        <DocumentList items={documentItems} target={{ clientId: client.id }} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-base font-semibold text-black">Activity</h2>
        <ActivityForm target={{ clientId: client.id }} />
        <ActivityTimeline
          items={activity ?? []}
          target={{ clientId: client.id }}
        />
      </section>
    </div>
  );
}
