import { JOB_STATUS_OPTIONS } from "@/lib/job-status";
import type { JobStatus } from "@/lib/supabase/types";
import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function JobForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    title: string;
    status: JobStatus;
    estimated_value: number | null;
    address: string | null;
    description: string | null;
  };
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2`}>
          Title
          <input
            name="title"
            required
            defaultValue={defaultValues?.title}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Status
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "lead"}
            className={inputClass}
          >
            {JOB_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Estimated value ($)
          <input
            name="estimated_value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.estimated_value ?? ""}
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Address
          <input
            name="address"
            defaultValue={defaultValues?.address ?? ""}
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={defaultValues?.description ?? ""}
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
