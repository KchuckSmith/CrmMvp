import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function ContactForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    role: string | null;
    phone: string | null;
    email: string | null;
    is_primary: boolean;
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
          Role
          <input
            name="role"
            placeholder="Site Super, Owner, ..."
            defaultValue={defaultValues?.role ?? ""}
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
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            name="is_primary"
            type="checkbox"
            defaultChecked={defaultValues?.is_primary ?? false}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Primary contact
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
