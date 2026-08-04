"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AssetStatus } from "@/lib/supabase/types";

const ASSET_STATUSES: AssetStatus[] = ["available", "in_use", "maintenance"];

function readFleetFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "available") as AssetStatus;
  const currentJobId = String(formData.get("current_job_id") ?? "").trim();
  const lastServiceDate = String(formData.get("last_service_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Name is required.");
  }
  if (!ASSET_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  return {
    category: "fleet" as const,
    name,
    status,
    current_job_id: currentJobId || null,
    last_service_date: lastServiceDate || null,
    notes: notes || null,
  };
}

function readFixedAssetFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  return {
    category: "fixed_asset" as const,
    name,
    quantity: quantityRaw ? Number(quantityRaw) : null,
    location: location || null,
    notes: notes || null,
  };
}

function readRealEstateFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const sqftRaw = String(formData.get("square_footage") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) {
    throw new Error("Name is required.");
  }

  return {
    category: "real_estate" as const,
    name,
    address: address || null,
    square_footage: sqftRaw ? Number(sqftRaw) : null,
    notes: notes || null,
  };
}

export async function createFleetAsset(formData: FormData) {
  const fields = readFleetFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").insert(fields);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function updateFleetAsset(assetId: string, formData: FormData) {
  const fields = readFleetFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").update(fields).eq("id", assetId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function createFixedAsset(formData: FormData) {
  const fields = readFixedAssetFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").insert(fields);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function updateFixedAsset(assetId: string, formData: FormData) {
  const fields = readFixedAssetFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").update(fields).eq("id", assetId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function createRealEstateAsset(formData: FormData) {
  const fields = readRealEstateFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").insert(fields);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function updateRealEstateAsset(assetId: string, formData: FormData) {
  const fields = readRealEstateFields(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("assets").update(fields).eq("id", assetId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}

export async function deleteAsset(assetId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("assets").delete().eq("id", assetId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/assets");
}
