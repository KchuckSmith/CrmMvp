"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BidStatus } from "@/lib/supabase/types";

const BID_STATUSES: BidStatus[] = ["draft", "sent", "accepted", "rejected"];

function readBidFields(formData: FormData) {
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as BidStatus;
  const sentDate = String(formData.get("sent_date") ?? "").trim();
  const expiresDate = String(formData.get("expires_date") ?? "").trim();

  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount)) {
    throw new Error("A valid bid amount is required.");
  }
  if (!BID_STATUSES.includes(status)) {
    throw new Error("Invalid bid status.");
  }

  return {
    amount,
    status,
    sent_date: sentDate || null,
    expires_date: expiresDate || null,
  };
}

export async function addBid(jobId: string, formData: FormData) {
  const fields = readBidFields(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("bids")
    .insert({ ...fields, job_id: jobId });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${jobId}`);
}

export async function editBid(
  bidId: string,
  jobId: string,
  formData: FormData
) {
  const fields = readBidFields(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("bids").update(fields).eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${jobId}`);
}

export async function removeBid(bidId: string, jobId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("bids").delete().eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${jobId}`);
}
