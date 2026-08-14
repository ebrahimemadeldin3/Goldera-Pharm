import PharmaciesHeader from "@/features/pharmacies/components/PharmaciesHeader";
import PharmaciesList from "@/features/pharmacies/components/PharmaciesList";
import { getPharmaciesAction } from "@/features/pharmacies/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;

  const result = await getPharmaciesAction(page, limit);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch pharmacies");
  }

  const raw = result.data as unknown;
  let pharmacies: PharmacyApiResponse[] = [];
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) pharmacies = r.data as PharmacyApiResponse[];
    else if (Array.isArray(r.pharmacies))
      pharmacies = r.pharmacies as PharmacyApiResponse[];
    else if (Array.isArray(raw)) pharmacies = raw as PharmacyApiResponse[];
  }

  const rawResults = raw && typeof raw === "object"
    ? (raw as Record<string, unknown>).results
    : undefined;
  const totalCount = typeof rawResults === "number" ? rawResults : pharmacies.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <PharmaciesHeader pharmacies={pharmacies} />
      <PharmaciesList pharmacies={pharmacies} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
