import PharmaciesHeader from "@/features/pharmacies/components/PharmaciesHeader";
import PharmaciesList from "@/features/pharmacies/components/PharmaciesList";
import { getPharmaciesAction } from "@/features/pharmacies/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import { PageContainer } from "@/components/layout/page-container";
import {
  resolveRepTerritoryScope,
  scopePharmaciesToRepTerritory,
} from "@/features/geography/lib/rep-territory-scope";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";
import { uniqueById } from "@/lib/utils/unique-by-id";

export const dynamic = "force-dynamic";

function getPharmacyRecords(data: unknown): PharmacyApiResponse[] {
  if (!data || typeof data !== "object") return [];

  const response = data as Record<string, unknown>;

  if (Array.isArray(response.data)) {
    return response.data as PharmacyApiResponse[];
  }
  if (Array.isArray(response.pharmacies)) {
    return response.pharmacies as PharmacyApiResponse[];
  }
  return Array.isArray(data) ? (data as PharmacyApiResponse[]) : [];
}

export default async function Page({
  searchParams,
}: {
  searchParams?:
    | Promise<{ page?: string; limit?: string }>
    | { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const [firstResult, profile] = await Promise.all([
    getPharmaciesAction(1, limit),
    fetchProfile().catch(() => null),
  ]);

  if (!firstResult.success) {
    throw new Error(firstResult.error?.message || "Failed to fetch pharmacies");
  }

  const firstPage = getPharmacyRecords(firstResult.data);
  const sourceTotalCount =
    typeof firstResult.results === "number"
      ? firstResult.results
      : firstPage.length;
  let pharmacies = firstPage;

  if (sourceTotalCount > firstPage.length) {
    const fullResult = await getPharmaciesAction(1, sourceTotalCount);

    if (!fullResult.success) {
      throw new Error(
        fullResult.error?.message || "Failed to fetch pharmacies",
      );
    }

    pharmacies = getPharmacyRecords(fullResult.data);
  }

  const regionsResult = profile?.subRegionId ? await getRegionsAction() : null;
  const scope = resolveRepTerritoryScope(
    profile,
    regionsResult?.success ? regionsResult.regions : null,
  );
  const uniquePharmacies = uniqueById(pharmacies);
  const scopedPharmacies = scopePharmaciesToRepTerritory(
    uniquePharmacies,
    scope,
  );
  const totalCount = scopedPharmacies.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <PharmaciesHeader pharmacies={scopedPharmacies} totalCount={totalCount} />
      <PharmaciesList
        pharmacies={scopedPharmacies}
        page={page}
        limit={limit}
        totalCount={totalCount}
        clientPaginate
      />
    </PageContainer>
  );
}
