import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { editJob, removeJob } from "@/lib/actions/jobs";
import { addBid } from "@/lib/actions/bids";
import { JobForm } from "../job-form";
import { BidForm } from "../bid-form";
import { BidList } from "../bid-list";
import { TaskForm } from "@/app/task-form";
import { TaskList } from "@/app/task-list";
import { DocumentForm } from "@/app/document-form";
import { DocumentList, type DocumentItem } from "@/app/document-list";
import { ActivityForm } from "@/app/activity-form";
import { ActivityTimeline } from "@/app/activity-timeline";
import { SubmitButton } from "@/app/submit-button";
import { addButtonClass, summaryClass } from "@/lib/form-styles";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*, clients(id, name)")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const [{ data: bids }, { data: activity }, { data: tasks }, { data: documents }] =
    await Promise.all([
      supabase
        .from("bids")
        .select("id, amount, status, sent_date, expires_date")
        .eq("job_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("id, type, body, created_at")
        .eq("job_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, title, due_date, completed_at")
        .eq("job_id", id)
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("documents")
        .select("id, file_name, file_path, file_size, uploaded_at")
        .eq("job_id", id)
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

  const client = job.clients as unknown as { id: string; name: string } | null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          {client && (
            <Link
              href={`/clients/${client.id}`}
              className="text-xs text-zinc-500 hover:underline"
            >
              ← {client.name}
            </Link>
          )}
          <h1 className="font-serif text-xl font-bold text-black">{job.title}</h1>
        </div>
        <form action={removeJob.bind(null, job.id, job.client_id)}>
          <SubmitButton
            pendingText="Deleting…"
            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete job
          </SubmitButton>
        </form>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-3">
        <h2 className="mb-3 font-serif text-base font-semibold text-black">Details</h2>
        <JobForm
          action={editJob.bind(null, job.id, job.client_id)}
          submitLabel="Save changes"
          defaultValues={job}
        />
      </section>

      <section className="flex flex-col gap-2">
        <details>
          <summary className={summaryClass}>
            <h2 className="font-serif text-base font-semibold text-black">Bid history</h2>
            <span className={addButtonClass}>+ Add bid</span>
          </summary>
          <div className="mt-3">
            <BidForm action={addBid.bind(null, job.id)} submitLabel="Add bid" />
          </div>
        </details>
        <BidList bids={bids ?? []} jobId={job.id} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-serif text-base font-semibold text-black">Tasks</h2>
        <TaskForm target={{ jobId: job.id }} />
        <TaskList items={tasks ?? []} target={{ jobId: job.id }} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-serif text-base font-semibold text-black">Documents</h2>
        <DocumentForm target={{ jobId: job.id }} />
        <DocumentList items={documentItems} target={{ jobId: job.id }} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-serif text-base font-semibold text-black">Activity</h2>
        <ActivityForm target={{ jobId: job.id }} />
        <ActivityTimeline items={activity ?? []} target={{ jobId: job.id }} />
      </section>
    </div>
  );
}
