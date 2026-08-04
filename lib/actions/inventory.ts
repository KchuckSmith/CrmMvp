"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function readInventoryFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const quantityRaw = String(formData.get("quantity_on_hand") ?? "").trim();
  const usageRateRaw = String(formData.get("weekly_usage_rate") ?? "").trim();
  const targetRaw = String(formData.get("target_quantity") ?? "").trim();
  const perishable = formData.get("perishable") === "on";
  const cadenceRaw = String(formData.get("restock_cadence_days") ?? "").trim();
  const lastRestockedRaw = String(formData.get("last_restocked_at") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Item name is required.");
  }
  if (!unit) {
    throw new Error("Unit is required.");
  }

  const quantity_on_hand = quantityRaw ? Number(quantityRaw) : 0;
  if (Number.isNaN(quantity_on_hand)) {
    throw new Error("Quantity on hand must be a number.");
  }

  return {
    name,
    unit,
    quantity_on_hand,
    weekly_usage_rate: usageRateRaw ? Number(usageRateRaw) : null,
    target_quantity: targetRaw ? Number(targetRaw) : null,
    perishable,
    restock_cadence_days: cadenceRaw ? Number(cadenceRaw) : null,
    last_restocked_at: lastRestockedRaw || null,
    notes: notes || null,
  };
}

export async function createInventoryItem(formData: FormData) {
  const fields = readInventoryFields(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("inventory_items").insert(fields);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function updateInventoryItem(itemId: string, formData: FormData) {
  const fields = readInventoryFields(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("inventory_items")
    .update(fields)
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}

export async function deleteInventoryItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/inventory");
}
