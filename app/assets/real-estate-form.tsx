import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function RealEstateForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    address: string | null;
    square_footage: number | null;
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
          Address
          <input
            name="address"
            defaultValue={defaultValues?.address ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Square footage
          <input
            name="square_footage"
            type="number"
            step="1"
            min="0"
            defaultValue={defaultValues?.square_footage ?? ""}
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
