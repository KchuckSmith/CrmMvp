import { removeBid } from "@/lib/actions/bids";
import type { BidStatus } from "@/lib/supabase/types";
import { SubmitButton } from "@/app/submit-button";

const STATUS_LABELS: Record<BidStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
};

export type BidItem = {
  id: string;
  amount: number;
  status: BidStatus;
  sent_date: string | null;
  expires_date: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function BidList({ bids, jobId }: { bids: BidItem[]; jobId: string }) {
  if (bids.length === 0) {
    return <p className="text-sm text-zinc-500">No bids yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {bids.map((bid) => (
        <div
          key={bid.id}
          className="flex items-center justify-between gap-3 p-3 text-sm"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-zinc-900">
              {formatCurrency(bid.amount)}
            </span>
            <span className="text-xs text-zinc-600">
              {STATUS_LABELS[bid.status]}
              {bid.sent_date ? ` · sent ${bid.sent_date}` : ""}
              {bid.expires_date ? ` · expires ${bid.expires_date}` : ""}
            </span>
          </div>
          <form action={removeBid.bind(null, bid.id, jobId)}>
            <SubmitButton
              pendingText="Deleting…"
              className="text-xs text-zinc-500 hover:text-red-600"
            >
              Delete
            </SubmitButton>
          </form>
        </div>
      ))}
    </div>
  );
}
