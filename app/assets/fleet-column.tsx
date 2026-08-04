"use client";

import { useState } from "react";
import Link from "next/link";
import { createFleetAsset, updateFleetAsset, deleteAsset } from "@/lib/actions/assets";
import { inputClass, addButtonClass, summaryClass } from "@/lib/form-styles";
import { SubmitButton } from "@/app/submit-button";
import { FleetForm } from "./fleet-form";

export type FleetAsset = {
  id: string;
  name: string;
  status: string | null;
  current_job_id: string | null;
  last_service_date: string | null;
  notes: string | null;
};

export type JobOption = { id: string; title: string; clientName: string | null };

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "status", label: "Status" },
  { value: "service-asc", label: "Last service (oldest first)" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  in_use: "In use",
  maintenance: "Maintenance",
};

function statusBadgeClass(status: string | null) {
  return status === "maintenance"
    ? "rounded bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white"
    : "rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600";
}

export function FleetColumn({
  items,
  jobs,
}: {
  items: FleetAsset[];
  jobs: JobOption[];
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("name-asc");

  const jobMap = new Map(jobs.map((job) => [job.id, job]));

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
      case "status":
        return (a.status ?? "").localeCompare(b.status ?? "");
      case "service-asc": {
        if (a.last_service_date === null && b.last_service_date === null) return 0;
        if (a.last_service_date === null) return 1;
        if (b.last_service_date === null) return -1;
        return a.last_service_date.localeCompare(b.last_service_date);
      }
    }
  });

  return (
    <div className="flex flex-1 flex-col gap-2">
      <details>
        <summary className={summaryClass}>
          <h2 className="font-serif text-base font-semibold text-black">Fleet</h2>
          <span className={addButtonClass}>+ Add</span>
        </summary>
        <div className="mt-3">
          <FleetForm action={createFleetAsset} submitLabel="Add" jobs={jobs} />
        </div>
      </details>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search fleet…"
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
            <p className="py-2 text-sm text-zinc-500">No fleet items yet.</p>
          )}
          {items.length > 0 && sorted.length === 0 && (
            <p className="py-2 text-sm text-zinc-500">No items match your search.</p>
          )}
          {sorted.map((item) => {
            const job = item.current_job_id ? jobMap.get(item.current_job_id) : undefined;
            return (
              <div key={item.id} className="flex flex-col gap-1 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900">{item.name}</span>
                    <span className={statusBadgeClass(item.status)}>
                      {STATUS_LABELS[item.status ?? ""] ?? item.status}
                    </span>
                  </div>
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
                  {job && (
                    <>
                      <Link href={`/jobs/${item.current_job_id}`} className="hover:underline">
                        {job.title}
                      </Link>
                      {" · "}
                    </>
                  )}
                  {item.last_service_date
                    ? `Last serviced ${item.last_service_date}`
                    : "Not yet serviced"}
                </span>
                <details>
                  <summary className="cursor-pointer text-xs font-medium text-zinc-500">
                    Edit
                  </summary>
                  <div className="mt-3">
                    <FleetForm
                      action={updateFleetAsset.bind(null, item.id)}
                      submitLabel="Save changes"
                      jobs={jobs}
                      defaultValues={item}
                    />
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
