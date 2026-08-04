import { createClient } from "@/lib/supabase/server";
import { FleetColumn, type FleetAsset, type JobOption } from "./fleet-column";
import { FixedAssetColumn, type FixedAsset } from "./fixed-asset-column";
import { RealEstateColumn, type RealEstateAsset } from "./real-estate-column";

export default async function AssetsPage() {
  const supabase = await createClient();

  const [{ data: assets, error: assetsError }, { data: jobsData, error: jobsError }] =
    await Promise.all([
      supabase.from("assets").select("*"),
      supabase
        .from("jobs")
        .select("id, title, clients(name)")
        .order("created_at", { ascending: false }),
    ]);

  if (assetsError) {
    throw new Error(assetsError.message);
  }
  if (jobsError) {
    throw new Error(jobsError.message);
  }

  const jobs: JobOption[] = (jobsData ?? []).map((job) => ({
    id: job.id,
    title: job.title,
    clientName: (job.clients as unknown as { name: string } | null)?.name ?? null,
  }));

  const allAssets = assets ?? [];
  const fleet = allAssets.filter((a) => a.category === "fleet") as unknown as FleetAsset[];
  const fixedAssets = allAssets.filter(
    (a) => a.category === "fixed_asset"
  ) as unknown as FixedAsset[];
  const realEstate = allAssets.filter(
    (a) => a.category === "real_estate"
  ) as unknown as RealEstateAsset[];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="font-serif text-xl font-bold text-black">Assets</h1>
      <div className="flex flex-1 flex-col gap-6 md:flex-row">
        <FleetColumn items={fleet} jobs={jobs} />
        <div className="hidden w-px shrink-0 bg-zinc-200 md:block" />
        <FixedAssetColumn items={fixedAssets} />
        <div className="hidden w-px shrink-0 bg-zinc-200 md:block" />
        <RealEstateColumn items={realEstate} />
      </div>
    </div>
  );
}
