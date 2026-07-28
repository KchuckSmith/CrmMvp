import type { JobStatus } from "@/lib/supabase/types";

export const JOB_STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "bid_sent", label: "Bid Sent" },
  { value: "contract_signed", label: "Contract Signed" },
  { value: "active", label: "Active" },
  { value: "complete", label: "Complete" },
  { value: "lost", label: "Lost" },
];
