import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JOB_STATUS_OPTIONS } from "@/lib/job-status";
import type { JobStatus } from "@/lib/supabase/types";
import { StatusSelect } from "./status-select";
import { TaskCheckbox } from "@/app/task-checkbox";

type DashboardJob = {
  id: string;
  title: string;
  status: JobStatus;
  estimated_value: number | null;
  clients: { name: string } | null;
};

type DueTask = {
  id: string;
  title: string;
  due_date: string | null;
  job_id: string | null;
  client_id: string | null;
  jobs: { title: string } | null;
  clients: { name: string } | null;
};

type JobOpenTask = {
  job_id: string | null;
  due_date: string | null;
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
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data, error },
    { data: dueTasksData, error: dueTasksError },
    { data: jobOpenTasksData, error: jobOpenTasksError },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, status, estimated_value, clients(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, due_date, job_id, client_id, jobs(title), clients(name)")
      .is("completed_at", null)
      .lte("due_date", today)
      .order("due_date", { ascending: true }),
    supabase
      .from("tasks")
      .select("job_id, due_date")
      .is("completed_at", null)
      .not("job_id", "is", null),
  ]);

  if (error) {
    throw new Error(error.message);
  }
  if (dueTasksError) {
    throw new Error(dueTasksError.message);
  }
  if (jobOpenTasksError) {
    throw new Error(jobOpenTasksError.message);
  }

  const jobs = (data ?? []) as unknown as DashboardJob[];
  const dueTasks = (dueTasksData ?? []) as unknown as DueTask[];

  // One query for all jobs' open-task counts (not one per card), grouped
  // client-side since we also need each job's overdue flag, which a
  // DB-side count(*) alone wouldn't give us.
  const jobOpenTaskInfo = new Map<string, { count: number; hasOverdue: boolean }>();
  for (const task of (jobOpenTasksData ?? []) as JobOpenTask[]) {
    if (!task.job_id) continue;
    const entry = jobOpenTaskInfo.get(task.job_id) ?? { count: 0, hasOverdue: false };
    entry.count += 1;
    if (task.due_date !== null && task.due_date < today) entry.hasOverdue = true;
    jobOpenTaskInfo.set(task.job_id, entry);
  }

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

      {dueTasks.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 font-serif text-base font-semibold text-black">
            Due Today / Overdue
          </h2>
          <ul className="flex flex-col divide-y divide-zinc-200">
            {dueTasks.map((task) => {
              const isOverdue = task.due_date !== null && task.due_date < today;
              const target = {
                jobId: task.job_id ?? undefined,
                clientId: task.client_id ?? undefined,
              };
              const linkHref = task.job_id
                ? `/jobs/${task.job_id}`
                : task.client_id
                  ? `/clients/${task.client_id}`
                  : null;
              const linkLabel = task.jobs?.title ?? task.clients?.name ?? null;

              return (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <TaskCheckbox taskId={task.id} target={target} completed={false} />
                    <div className="flex flex-col">
                      <span
                        className={
                          isOverdue
                            ? "font-medium text-red-600"
                            : "font-medium text-zinc-900"
                        }
                      >
                        {task.title}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {isOverdue ? "Overdue" : "Due today"}
                        {task.due_date ? ` · ${task.due_date}` : ""}
                        {linkHref && linkLabel && (
                          <>
                            {" · "}
                            <Link href={linkHref} className="hover:underline">
                              {linkLabel}
                            </Link>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

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
                  const openTaskInfo = jobOpenTaskInfo.get(job.id);
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
                      {openTaskInfo && openTaskInfo.count > 0 && (
                        <span
                          className={
                            openTaskInfo.hasOverdue
                              ? "pointer-events-none absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white"
                              : "pointer-events-none absolute right-2 top-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600"
                          }
                        >
                          {openTaskInfo.count} {openTaskInfo.count === 1 ? "task" : "tasks"}
                        </span>
                      )}
                      <span
                        className={
                          openTaskInfo && openTaskInfo.count > 0
                            ? "flex items-center gap-1.5 pr-14 font-serif font-semibold text-black"
                            : "flex items-center gap-1.5 font-serif font-semibold text-black"
                        }
                      >
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
