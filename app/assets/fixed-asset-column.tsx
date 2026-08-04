"use client";

import { useState } from "react";
import { createFixedAsset, updateFixedAsset, deleteAsset } from "@/lib/actions/assets";
import { inputClass, addButtonClass, summaryClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";
import { FixedAssetForm } from "./fixed-asset-form";

export type FixedAsset = {
  id: string;
  name: string;
  quantity: number | null;
  location: string | null;
  notes: string | null;
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "quantity-desc", label: "Quantity high-to-low" },
  { value: "quantity-asc", label: "Quantity low-to-high" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

export function FixedAssetColumn({ items }: { items: FixedAsset[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("name-asc");

  const query = search.trim().toLowerCase();
  const filtered = query
    ? items.filter((item) => item.name.toLowerCase().includes(query))
    : items;

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "quantity-desc":
        return compareNullableNumbers(b.quantity, a.quantity);
      case "quantity-asc":
        return compareNullableNumbers(a.quantity, b.quantity);
    }
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <details>
        <summary className={summaryClass}>
          <h2 className="font-serif text-base font-semibold text-black">Fixed Assets</h2>
          <span className={addButtonClass}>+ Add</span>
        </summary>
        <div className="mt-3">
          <FixedAssetForm action={createFixedAsset} submitLabel="Add" />
        </div>
      </details>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search fixed assets…"
        className={inputClass}
      />

      <div className="flex flex-col gap-2">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className={inputClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex flex-col divide-y divide-zinc-100">
          {items.length === 0 && (
            <p className="py-2 text-sm text-zinc-500">No fixed assets yet.</p>
          )}
          {items.length > 0 && sorted.length === 0 && (
            <p className="py-2 text-sm text-zinc-500">No items match your search.</p>
          )}
          {sorted.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 py-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900">{item.name}</span>
                <form action={deleteAsset.bind(null, item.id)}>
                  <SubmitButton
                    pendingText="Deleting…"
                    className="text-xs text-zinc-500 hover:text-red-600"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </div>
              <span className="text-xs text-zinc-600">
                {[
                  item.quantity !== null ? `Qty: ${item.quantity}` : null,
                  item.location,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No details"}
              </span>
              <details>
                <summary className="cursor-pointer text-xs font-medium text-zinc-500">
                  Edit
                </summary>
                <div className="mt-3">
                  <FixedAssetForm
                    action={updateFixedAsset.bind(null, item.id)}
                    submitLabel="Save changes"
                    defaultValues={item}
                  />
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
