import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

export function InventoryItemForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    unit: string;
    quantity_on_hand: number;
    weekly_usage_rate: number | null;
    target_quantity: number | null;
    perishable: boolean;
    restock_cadence_days: number | null;
    last_restocked_at: string | null;
    notes: string | null;
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
          Unit
          <input
            name="unit"
            required
            placeholder="lbs, gallons, tons, ..."
            defaultValue={defaultValues?.unit}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Quantity on hand
          <input
            name="quantity_on_hand"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.quantity_on_hand ?? 0}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Target quantity
          <input
            name="target_quantity"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.target_quantity ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Weekly usage rate
          <input
            name="weekly_usage_rate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.weekly_usage_rate ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Last restocked
          <input
            name="last_restocked_at"
            type="date"
            defaultValue={defaultValues?.last_restocked_at ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Restock check every (days)
          <input
            name="restock_cadence_days"
            type="number"
            step="1"
            min="0"
            defaultValue={defaultValues?.restock_cadence_days ?? ""}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            name="perishable"
            type="checkbox"
            defaultChecked={defaultValues?.perishable ?? false}
            className="h-4 w-4 rounded border-zinc-300"
          />
          Perishable (needs periodic freshness check)
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
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
