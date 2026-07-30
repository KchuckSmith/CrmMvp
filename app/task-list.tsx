import { deleteTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/app/submit-button";
import { TaskCheckbox } from "@/app/task-checkbox";

export type TaskItem = {
  id: string;
  title: string;
  due_date: string | null;
  completed_at: string | null;
};

const RECENT_COMPLETION_WINDOW_MS = 24 * 60 * 60 * 1000;

function isRecentlyCompleted(completedAt: string) {
  return Date.now() - new Date(completedAt).getTime() <= RECENT_COMPLETION_WINDOW_MS;
}

function byCompletedAtDesc(a: TaskItem, b: TaskItem) {
  return (b.completed_at ?? "").localeCompare(a.completed_at ?? "");
}

function TaskRow({
  task,
  target,
}: {
  task: TaskItem;
  target: { jobId?: string; clientId?: string };
}) {
  const isDone = task.completed_at !== null;

  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <div className="flex items-center gap-3">
        <TaskCheckbox taskId={task.id} target={target} completed={isDone} />
        <div className="flex flex-col">
          <span className={isDone ? "text-zinc-400 line-through" : "text-zinc-900"}>
            {task.title}
          </span>
          {task.due_date && (
            <span className={isDone ? "text-xs text-zinc-400" : "text-xs text-zinc-500"}>
              Due {task.due_date}
            </span>
          )}
        </div>
      </div>
      <form action={deleteTask.bind(null, task.id, target)}>
        <SubmitButton
          pendingText="Deleting…"
          className="text-xs text-zinc-500 hover:text-red-600"
        >
          Delete
        </SubmitButton>
      </form>
    </li>
  );
}

export function TaskList({
  items,
  target,
}: {
  items: TaskItem[];
  target: { jobId?: string; clientId?: string };
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No tasks.</p>;
  }

  const openItems = items.filter((t) => t.completed_at === null);
  const recentlyCompleted = items
    .filter((t) => t.completed_at !== null && isRecentlyCompleted(t.completed_at))
    .sort(byCompletedAtDesc);
  const olderCompleted = items
    .filter((t) => t.completed_at !== null && !isRecentlyCompleted(t.completed_at))
    .sort(byCompletedAtDesc);

  const visibleItems = [...openItems, ...recentlyCompleted];

  return (
    <div className="flex flex-col gap-1">
      {visibleItems.length === 0 ? (
        <p className="text-sm text-zinc-500">No tasks.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-100">
          {visibleItems.map((task) => (
            <TaskRow key={task.id} task={task} target={target} />
          ))}
        </ul>
      )}
      {olderCompleted.length > 0 && (
        <details>
          <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:underline">
            Show completed
          </summary>
          <ul className="mt-1 flex flex-col divide-y divide-zinc-100">
            {olderCompleted.map((task) => (
              <TaskRow key={task.id} task={task} target={target} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
