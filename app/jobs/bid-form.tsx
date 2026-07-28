import type { BidStatus } from "@/lib/supabase/types";
import { labelClass, inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";

const BID_STATUS_OPTIONS: { value: BidStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function BidForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  defaultValues?: {
    amount: number;
    status: BidStatus;
    sent_date: string | null;
    expires_date: string | null;
  };
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className={labelClass}>
          Amount ($)
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.amount}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Status
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "draft"}
            className={inputClass}
          >
            {BID_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Sent date
          <input
            name="sent_date"
            type="date"
            defaultValue={defaultValues?.sent_date ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Expires date
          <input
            name="expires_date"
            type="date"
            defaultValue={defaultValues?.expires_date ?? ""}
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
