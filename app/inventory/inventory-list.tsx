"use client";

import { useState } from "react";
import { deleteInventoryItem, updateInventoryItem } from "@/lib/actions/inventory";
import { inputClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";
import { InventoryItemForm } from "./inventory-item-form";

export type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  quantity_on_hand: number;
  weekly_usage_rate: number | null;
  target_quantity: number | null;
  perishable: boolean;
  restock_cadence_days: number | null;
  last_restocked_at: string | null;
  notes: string | null;
};

const SORT_OPTIONS = [
  { value: "weeks-asc", label: "Weeks remaining (soonest first)" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "quantity-asc", label: "Quantity low-to-high" },
  { value: "quantity-desc", label: "Quantity high-to-low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function weeksRemaining(item: InventoryItem) {
  if (item.weekly_usage_rate === null || item.weekly_usage_rate <= 0) return null;
  return item.quantity_on_hand / item.weekly_usage_rate;
}

function isLowStock(item: InventoryItem) {
  return item.target_quantity !== null && item.quantity_on_hand < item.target_quantity;
}

function isRestockDue(item: InventoryItem, today: string) {
  if (!item.perishable || item.restock_cadence_days === null || !item.last_restocked_at) {
    return false;
  }
  const daysSince = Math.floor(
    (new Date(today).getTime() - new Date(item.last_restocked_at).getTime()) / 86400000
  );
  return daysSince >= item.restock_cadence_days;
}

export function InventoryList({ items }: { items: InventoryItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("weeks-asc");
  const today = new Date().toISOString().slice(0, 10);

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
      case "quantity-asc":
        return a.quantity_on_hand - b.quantity_on_hand;
      case "quantity-desc":
        return b.quantity_on_hand - a.quantity_on_hand;
      case "weeks-asc": {
        const aWeeks = weeksRemaining(a);
        const bWeeks = weeksRemaining(b);
        if (aWeeks === null && bWeeks === null) return 0;
        if (aWeeks === null) return 1;
        if (bWeeks === null) return -1;
        return aWeeks - bWeeks;
      }
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory…"
          className={`flex-1 ${inputClass}`}
        />
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
      </div>

      <div className="flex flex-col divide-y divide-zinc-100">
        {items.length === 0 && (
          <p className="py-2 text-sm text-zinc-500">No inventory items yet.</p>
        )}
        {items.length > 0 && sorted.length === 0 && (
          <p className="py-2 text-sm text-zinc-500">No items match your search.</p>
        )}
        {sorted.map((item) => {
          const weeks = weeksRemaining(item);
          const lowStock = isLowStock(item);
          const restockDue = isRestockDue(item, today);

          return (
            <div key={item.id} className="flex flex-col gap-1 py-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">{item.name}</span>
                  {lowStock && (
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      Low stock
                    </span>
                  )}
                  {restockDue && (
                    <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                      Restock due
                    </span>
                  )}
                </div>
                <form action={deleteInventoryItem.bind(null, item.id)}>
                  <SubmitButton
                    pendingText="Deleting…"
                    className="text-xs text-zinc-500 hover:text-red-600"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </div>
              <span className="text-xs text-zinc-600">
                {item.quantity_on_hand} {item.unit}
                {item.target_quantity !== null &&
                  ` · Target: ${item.target_quantity} ${item.unit}`}
                {weeks !== null && ` · ${weeks.toFixed(1)} weeks remaining`}
              </span>
              <details>
                <summary className="cursor-pointer text-xs font-medium text-zinc-500">
                  Edit
                </summary>
                <div className="mt-3">
                  <InventoryItemForm
                    action={updateInventoryItem.bind(null, item.id)}
                    submitLabel="Save changes"
                    defaultValues={item}
                  />
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
