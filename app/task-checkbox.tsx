"use client";

import { useTransition } from "react";
import { completeTask } from "@/lib/actions/tasks";

export function TaskCheckbox({
  taskId,
  target,
}: {
  taskId: string;
  target: { jobId?: string; clientId?: string };
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      disabled={isPending}
      onChange={() => {
        startTransition(() => {
          completeTask(taskId, target);
        });
      }}
      className="h-4 w-4 rounded border-zinc-300 disabled:opacity-50"
    />
  );
}
