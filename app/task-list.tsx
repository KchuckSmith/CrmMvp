import { deleteTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/app/submit-button";
import { TaskCheckbox } from "@/app/task-checkbox";

export type TaskItem = {
  id: string;
  title: string;
  due_date: string | null;
};

export function TaskList({
  items,
  target,
}: {
  items: TaskItem[];
  target: { jobId?: string; clientId?: string };
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No open tasks.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {items.map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between gap-3 p-3 text-sm"
        >
          <div className="flex items-center gap-3">
            <TaskCheckbox taskId={task.id} target={target} />
            <div className="flex flex-col">
              <span className="text-zinc-900">{task.title}</span>
              {task.due_date && (
                <span className="text-xs text-zinc-500">
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
      ))}
    </ul>
  );
}
