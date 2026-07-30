import { createTask } from "@/lib/actions/tasks";
import { inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function TaskForm({
  target,
}: {
  target: { jobId?: string; clientId?: string };
}) {
  const action = createTask.bind(null, target);

  return (
    <form action={action} className="flex gap-2">
      <input
        name="title"
        required
        placeholder="Follow up about…"
        className={`flex-1 ${inputClass}`}
      />
      <input name="due_date" type="date" className={`w-40 ${inputClass}`} />
      <SubmitButton
        pendingText="Adding…"
        className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
      >
        Add task
      </SubmitButton>
    </form>
  );
}
