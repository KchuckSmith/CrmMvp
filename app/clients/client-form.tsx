import type { ClientSource } from "@/lib/supabase/types";
import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

const SOURCE_OPTIONS: { value: ClientSource; label: string }[] = [
  { value: "referral", label: "Referral" },
  { value: "web", label: "Web" },
  { value: "other", label: "Other" },
];

export function ClientForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    company_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    source: ClientSource;
  };
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          Company
          <input
            name="company_name"
            defaultValue={defaultValues?.company_name ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Phone
          <input
            name="phone"
            defaultValue={defaultValues?.phone ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Email
          <input
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
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
        <label className={labelClass}>
          Source
          <select
            name="source"
            defaultValue={defaultValues?.source ?? "other"}
            className={inputClass}
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <SubmitButton
        pendingText="Saving…"
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
