import { addActivity } from "@/lib/actions/activity";
import type { ActivityType } from "@/lib/supabase/types";
import { inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "site_visit", label: "Site visit" },
];

export function ActivityForm({
  target,
}: {
  target: { jobId?: string; clientId?: string };
}) {
  const action = addActivity.bind(null, target);

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select name="type" defaultValue="note" className={`w-36 ${inputClass}`}>
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          name="body"
          required
          placeholder="Add a note…"
          className={`flex-1 ${inputClass}`}
        />
        <SubmitButton
          pendingText="Adding…"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
        >
          Add
        </SubmitButton>
      </div>
    </form>
  );
}
