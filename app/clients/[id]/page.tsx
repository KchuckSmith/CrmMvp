import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { editClient, removeClient } from "@/lib/actions/clients";
import { addJob } from "@/lib/actions/jobs";
import { ClientForm } from "../client-form";
import { JobForm } from "@/app/jobs/job-form";
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

  const [{ data: jobs }, { data: activity }] = await Promise.all([
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
  ]);

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
