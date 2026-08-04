"use client";

import { useState } from "react";
import { createRealEstateAsset, updateRealEstateAsset, deleteAsset } from "@/lib/actions/assets";
import { inputClass, addButtonClass, summaryClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";
import { RealEstateForm } from "./real-estate-form";

export type RealEstateAsset = {
  id: string;
  name: string;
  address: string | null;
  square_footage: number | null;
  notes: string | null;
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "sqft-desc", label: "Square footage high-to-low" },
  { value: "sqft-asc", label: "Square footage low-to-high" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

export function RealEstateColumn({ items }: { items: RealEstateAsset[] }) {
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
      case "sqft-desc":
        return compareNullableNumbers(b.square_footage, a.square_footage);
      case "sqft-asc":
        return compareNullableNumbers(a.square_footage, b.square_footage);
    }
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <details>
        <summary className={summaryClass}>
          <h2 className="font-serif text-base font-semibold text-black">Real Estate</h2>
          <span className={addButtonClass}>+ Add</span>
        </summary>
        <div className="mt-3">
          <RealEstateForm action={createRealEstateAsset} submitLabel="Add" />
        </div>
      </details>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search real estate…"
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
            <p className="py-2 text-sm text-zinc-500">No real estate yet.</p>
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
                  item.address,
                  item.square_footage !== null ? `${item.square_footage} sq ft` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No details"}
              </span>
              <details>
                <summary className="cursor-pointer text-xs font-medium text-zinc-500">
                  Edit
                </summary>
                <div className="mt-3">
                  <RealEstateForm
                    action={updateRealEstateAsset.bind(null, item.id)}
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
