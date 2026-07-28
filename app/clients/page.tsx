import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addClient } from "@/lib/actions/clients";
import { ClientForm } from "./client-form";

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
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
      <h1 className="font-serif text-xl font-bold text-black">Clients</h1>

      <details className="rounded-lg border border-zinc-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">
          + Add client
        </summary>
        <div className="mt-4">
          <ClientForm action={addClient} submitLabel="Add client" />
        </div>
      </details>

      <div className="flex flex-col divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
        {clients?.length === 0 && (
          <p className="p-4 text-sm text-zinc-500">No clients yet.</p>
        )}
        {clients?.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex flex-col gap-0.5 p-4 text-sm hover:bg-zinc-50"
          >
            <span className="font-medium text-zinc-900">{client.name}</span>
            <span className="text-xs text-zinc-600">
              {[client.company_name, client.email, client.phone]
                .filter(Boolean)
                .join(" · ") || "No contact details"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
