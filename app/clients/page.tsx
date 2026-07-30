import { createClient } from "@/lib/supabase/server";
import { addClient } from "@/lib/actions/clients";
import { ClientForm } from "./client-form";
import { ClientList } from "./client-list";
import { addButtonClass, summaryClass } from "@/lib/form-styles";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, company_name, phone, email, source, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <details>
        <summary className={summaryClass}>
          <h1 className="font-serif text-xl font-bold text-black">Clients</h1>
          <span className={addButtonClass}>+ Add client</span>
        </summary>
        <div className="mt-3">
          <ClientForm action={addClient} submitLabel="Add client" />
        </div>
      </details>

      <ClientList clients={clients ?? []} />
    </div>
  );
}
