import { removeActivity } from "@/lib/actions/activity";
import type { ActivityType } from "@/lib/supabase/types";
import { SubmitButton } from "@/app/submit-button";

const TYPE_LABELS: Record<ActivityType, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  site_visit: "Site visit",
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  body: string;
  created_at: string;
};

export function ActivityTimeline({
  items,
  target,
}: {
  items: ActivityItem[];
  target: { jobId?: string; clientId?: string };
}) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">No activity yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-zinc-100">
      {items.map((item) => {
        const removeAction = removeActivity.bind(null, item.id, target);
        return (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 py-2 text-sm"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600">
                  {TYPE_LABELS[item.type]}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-zinc-800">{item.body}</p>
            </div>
            <form action={removeAction}>
              <SubmitButton
                pendingText="Deleting…"
                className="text-xs text-zinc-500 hover:text-red-600"
              >
                Delete
              </SubmitButton>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
