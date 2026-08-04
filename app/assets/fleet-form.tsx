import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In use" },
  { value: "maintenance", label: "Maintenance" },
] as const;

export function FleetForm({
  action,
  submitLabel,
  jobs,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  jobs: { id: string; title: string; clientName: string | null }[];
  defaultValues?: {
    name: string;
    status: string | null;
    current_job_id: string | null;
    last_service_date: string | null;
    notes: string | null;
  };
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3">
        <label className={labelClass}>
          Name
          <input
            name="name"
            required
            defaultValue={defaultValues?.name}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Status
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "available"}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Current job
          <select
            name="current_job_id"
            defaultValue={defaultValues?.current_job_id ?? ""}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
                {job.clientName ? ` — ${job.clientName}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Last service date
          <input
            name="last_service_date"
            type="date"
            defaultValue={defaultValues?.last_service_date ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Notes
          <textarea
            name="notes"
            rows={2}
            defaultValue={defaultValues?.notes ?? ""}
            className={inputClass}
          />
        </label>
      </div>
      <SubmitButton
        pendingText="Saving…"
        className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
