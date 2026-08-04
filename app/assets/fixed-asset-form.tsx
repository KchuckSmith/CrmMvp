import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function FixedAssetForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    quantity: number | null;
    location: string | null;
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
          Quantity
          <input
            name="quantity"
            type="number"
            step="1"
            min="0"
            defaultValue={defaultValues?.quantity ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Location
          <input
            name="location"
            defaultValue={defaultValues?.location ?? ""}
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
