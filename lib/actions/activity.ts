"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType } from "@/lib/supabase/types";

const ACTIVITY_TYPES: ActivityType[] = ["call", "email", "site_visit", "note"];

export async function addActivity(
  target: { jobId?: string; clientId?: string },
  formData: FormData
) {
  const type = String(formData.get("type") ?? "note") as ActivityType;
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    throw new Error("Note body is required.");
  }
  if (!ACTIVITY_TYPES.includes(type)) {
    throw new Error("Invalid activity type.");
  }
  if (!target.jobId && !target.clientId) {
    throw new Error("Activity must be linked to a job or client.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("activity_log").insert({
    type,
    body,
    job_id: target.jobId ?? null,
    client_id: target.clientId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (target.jobId) revalidatePath(`/jobs/${target.jobId}`);
  if (target.clientId) revalidatePath(`/clients/${target.clientId}`);
}

export async function removeActivity(
  activityId: string,
  target: { jobId?: string; clientId?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("activity_log")
    .delete()
    .eq("id", activityId);

  if (error) {
    throw new Error(error.message);
  }

  if (target.jobId) revalidatePath(`/jobs/${target.jobId}`);
  if (target.clientId) revalidatePath(`/clients/${target.clientId}`);
}
