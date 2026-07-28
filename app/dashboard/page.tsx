import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUS_OPTIONS } from "@/lib/job-status";
import type { JobStatus } from "@/lib/supabase/types";
import { StatusSelect } from "./status-select";

type DashboardJob = {
  id: string;
  title: string;
  status: JobStatus;
  estimated_value: number | null;
  clients: { name: string } | null;
};

function formatCurrency(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, estimated_value, clients(name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const jobs = (data ?? []) as unknown as DashboardJob[];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-black">Dashboard</h1>
        <Link
          href="/clients"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          + New client / job
        </Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {JOB_STATUS_OPTIONS.map((column) => {
          const columnJobs = jobs.filter((j) => j.status === column.value);
          return (
            <div
              key={column.value}
              className="flex w-64 shrink-0 flex-col rounded-lg bg-zinc-100"
            >
              <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-zinc-700">
                <span>{column.label}</span>
                <span className="text-xs text-zinc-500">
                  {columnJobs.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 px-2 pb-2">
                {columnJobs.map((job) => {
                  const isHighValue =
                    job.estimated_value !== null && job.estimated_value >= 15000;
                  return (
                    <div
                      key={job.id}
                      className="relative flex flex-col gap-2 rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-sm hover:border-zinc-400"
                    >
                      <Link
                        href={`/jobs/${job.id}`}
                        className="absolute inset-0"
                        aria-label={`View ${job.title}`}
                      />
                      <span className="flex items-center gap-1.5 font-serif font-semibold text-black">
                        {isHighValue && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600"
                            title="High-value job"
                          />
                        )}
                        {job.title}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {job.clients?.name ?? "Unknown client"}
                      </span>
                      {job.estimated_value !== null && (
                        <span
                          className={
                            isHighValue
                              ? "text-xs font-semibold text-red-600"
                              : "text-xs text-zinc-600"
                          }
                        >
                          {formatCurrency(job.estimated_value)}
                        </span>
                      )}
                      <div className="relative z-10">
                        <StatusSelect jobId={job.id} status={job.status} />
                      </div>
                    </div>
                  );
                })}
                {columnJobs.length === 0 && (
                  <p className="px-1 py-2 text-xs text-zinc-500">No jobs</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
