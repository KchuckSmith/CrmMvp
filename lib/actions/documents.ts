"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateDocumentTarget(target: { jobId?: string; clientId?: string }) {
  if (target.jobId) revalidatePath(`/jobs/${target.jobId}`);
  if (target.clientId) revalidatePath(`/clients/${target.clientId}`);
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function uploadDocument(
  target: { jobId?: string; clientId?: string },
  formData: FormData
) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("A file is required.");
  }
  if (!target.jobId && !target.clientId) {
    throw new Error("Document must be linked to a job or client.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const targetId = target.jobId ?? target.clientId;
  const path = `${user.id}/${targetId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    job_id: target.jobId ?? null,
    client_id: target.clientId ?? null,
  });

  if (insertError) {
    await supabase.storage.from("documents").remove([path]);
    throw new Error(insertError.message);
  }

  revalidateDocumentTarget(target);
}

export async function deleteDocument(
  documentId: string,
  filePath: string,
  target: { jobId?: string; clientId?: string }
) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([filePath]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateDocumentTarget(target);
}
