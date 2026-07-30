"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateTaskTarget(target: { jobId?: string; clientId?: string }) {
  if (target.jobId) revalidatePath(`/jobs/${target.jobId}`);
  if (target.clientId) revalidatePath(`/clients/${target.clientId}`);
  revalidatePath("/dashboard");
}

export async function createTask(
  target: { jobId?: string; clientId?: string },
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  const dueDateRaw = String(formData.get("due_date") ?? "").trim();

  if (!title) {
    throw new Error("Task title is required.");
  }
  if (!target.jobId && !target.clientId) {
    throw new Error("Task must be linked to a job or client.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title,
    due_date: dueDateRaw || null,
    job_id: target.jobId ?? null,
    client_id: target.clientId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskTarget(target);
}

export async function completeTask(
  taskId: string,
  target: { jobId?: string; clientId?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskTarget(target);
}

export async function reopenTask(
  taskId: string,
  target: { jobId?: string; clientId?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: null })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskTarget(target);
}

export async function deleteTask(
  taskId: string,
  target: { jobId?: string; clientId?: string }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTaskTarget(target);
}
