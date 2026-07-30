"use client";

import { useState } from "react";
import Link from "next/link";
import { inputClass } from "@/lib/form-styles";

export type ClientListItem = {
  id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "company-asc", label: "Company A–Z" },
  { value: "company-desc", label: "Company Z–A" },
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function compareNullableStrings(a: string | null, b: string | null) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b);
}

export function ClientList({ clients }: { clients: ClientListItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("name-asc");

  const query = search.trim().toLowerCase();
  const filtered = query
    ? clients.filter((client) =>
        [client.name, client.company_name, client.phone, client.email]
          .filter((field): field is string => Boolean(field))
          .some((field) => field.toLowerCase().includes(query))
      )
    : clients;

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "company-asc":
        return compareNullableStrings(a.company_name, b.company_name);
      case "company-desc":
        return compareNullableStrings(b.company_name, a.company_name);
      case "created-desc":
        return b.created_at.localeCompare(a.created_at);
      case "created-asc":
        return a.created_at.localeCompare(b.created_at);
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
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
        {clients.length === 0 && (
          <p className="py-2 text-sm text-zinc-500">No clients yet.</p>
        )}
        {clients.length > 0 && sorted.length === 0 && (
          <p className="py-2 text-sm text-zinc-500">No clients match your search.</p>
        )}
        {sorted.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex flex-col gap-0.5 py-2 text-sm hover:bg-zinc-50"
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
