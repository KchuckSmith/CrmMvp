"use client";

import { useTransition } from "react";
import { updateJobStatus } from "@/lib/actions/jobs";
import type { JobStatus } from "@/lib/supabase/types";
import { JOB_STATUS_OPTIONS } from "@/lib/job-status";

export function StatusSelect({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as JobStatus;
        startTransition(() => {
          updateJobStatus(jobId, next);
        });
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 disabled:opacity-50"
    >
      {JOB_STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
