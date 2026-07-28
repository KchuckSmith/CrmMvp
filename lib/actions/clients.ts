"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClientSource } from "@/lib/supabase/types";

function readClientFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const company_name = String(formData.get("company_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const source = String(formData.get("source") ?? "other") as ClientSource;

  if (!name) {
    throw new Error("Client name is required.");
  }

  return {
    name,
    company_name: company_name || null,
    phone: phone || null,
    email: email || null,
    address: address || null,
    source,
  };
}

export async function addClient(formData: FormData) {
  const fields = readClientFields(formData);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .insert(fields)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function editClient(clientId: string, formData: FormData) {
  const fields = readClientFields(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .update(fields)
    .eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
}

export async function removeClient(clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/clients");
  redirect("/clients");
}
