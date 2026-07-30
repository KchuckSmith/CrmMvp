"use client";

import { useState, useTransition } from "react";
import { completeTask, reopenTask } from "@/lib/actions/tasks";

export function TaskCheckbox({
  taskId,
  target,
  completed,
}: {
  taskId: string;
  target: { jobId?: string; clientId?: string };
  completed: boolean;
}) {
  const [checked, setChecked] = useState(completed);
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.checked;
        setChecked(next);
        startTransition(() => {
          if (next) {
            completeTask(taskId, target);
          } else {
            reopenTask(taskId, target);
          }
        });
      }}
      className="h-4 w-4 rounded border-zinc-300 disabled:opacity-50"
    />
  );
}
