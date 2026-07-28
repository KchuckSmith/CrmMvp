"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/lib/supabase/types";

const JOB_STATUSES: JobStatus[] = [
  "lead",
  "bid_sent",
  "contract_signed",
  "active",
  "complete",
  "lost",
];

function readJobFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "lead") as JobStatus;
  const estimatedValueRaw = String(formData.get("estimated_value") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    throw new Error("Job title is required.");
  }
  if (!JOB_STATUSES.includes(status)) {
    throw new Error("Invalid job status.");
  }

  return {
    title,
    status,
    estimated_value: estimatedValueRaw ? Number(estimatedValueRaw) : null,
    address: address || null,
    description: description || null,
  };
}

export async function addJob(clientId: string, formData: FormData) {
  const fields = readJobFields(formData);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .insert({ ...fields, client_id: clientId })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/jobs/${data.id}`);
}

export async function editJob(
  jobId: string,
  clientId: string,
  formData: FormData
) {
  const fields = readJobFields(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").update(fields).eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  if (!JOB_STATUSES.includes(status)) {
    throw new Error("Invalid job status.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/jobs/${jobId}`);
}

export async function removeJob(jobId: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/clients/${clientId}`);
}
