import PharmaciesHeader from "@/features/pharmacies/components/PharmaciesHeader";
import PharmaciesList from "@/features/pharmacies/components/PharmaciesList";
import { getPharmaciesAction } from "@/features/pharmacies/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getPharmaciesAction(page, limit);
 
  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch pharmacies");
  }

  // Handle different possible response shapes
  const raw = result.data as unknown;
  let pharmacies: PharmacyApiResponse[] = [];
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) pharmacies = r.data as PharmacyApiResponse[];
    else if (Array.isArray(r.pharmacies))
      pharmacies = r.pharmacies as PharmacyApiResponse[];
    else if (Array.isArray(raw)) pharmacies = raw as PharmacyApiResponse[];
  }

  const totalCount = typeof result.results === "number" ? result.results : pharmacies.length;


  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <PharmaciesHeader pharmacies={pharmacies} />
      <PharmaciesList pharmacies={pharmacies} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
