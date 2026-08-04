import { createClient } from "@/lib/supabase/server";
import { createInventoryItem } from "@/lib/actions/inventory";
import { InventoryItemForm } from "./inventory-item-form";
import { InventoryList, type InventoryItem } from "./inventory-list";
import { addButtonClass, summaryClass } from "@/lib/form-styles";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("inventory_items")
    .select(
      "id, name, unit, quantity_on_hand, weekly_usage_rate, target_quantity, perishable, restock_cadence_days, last_restocked_at, notes"
    )
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <details>
        <summary className={summaryClass}>
          <h1 className="font-serif text-xl font-bold text-black">Inventory</h1>
          <span className={addButtonClass}>+ Add item</span>
        </summary>
        <div className="mt-3">
          <InventoryItemForm action={createInventoryItem} submitLabel="Add item" />
        </div>
      </details>

      <InventoryList items={(items ?? []) as InventoryItem[]} />
    </div>
  );
}
