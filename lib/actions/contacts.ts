"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function readContactFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const is_primary = formData.get("is_primary") === "on";

  if (!name) {
    throw new Error("Contact name is required.");
  }

  return {
    name,
    role: role || null,
    phone: phone || null,
    email: email || null,
    is_primary,
  };
}

async function clearOtherPrimaries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
  exceptContactId: string
) {
  const { error } = await supabase
    .from("contacts")
    .update({ is_primary: false })
    .eq("client_id", clientId)
    .neq("id", exceptContactId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createContact(clientId: string, formData: FormData) {
  const fields = readContactFields(formData);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...fields, client_id: clientId })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (fields.is_primary) {
    await clearOtherPrimaries(supabase, clientId, data.id);
  }

  revalidatePath(`/clients/${clientId}`);
}

export async function updateContact(
  contactId: string,
  clientId: string,
  formData: FormData
) {
  const fields = readContactFields(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .update(fields)
    .eq("id", contactId);

  if (error) {
    throw new Error(error.message);
  }

  if (fields.is_primary) {
    await clearOtherPrimaries(supabase, clientId, contactId);
  }

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteContact(contactId: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${clientId}`);
}
