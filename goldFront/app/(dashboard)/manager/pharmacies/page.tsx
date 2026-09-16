import PharmaciesHeader from "@/features/pharmacies/components/PharmaciesHeader";
import PharmaciesList from "@/features/pharmacies/components/PharmaciesList";
import { getPharmaciesAction } from "@/features/pharmacies/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import { PageContainer } from "@/components/layout/page-container";

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

  const firstResult = await getPharmaciesAction(1, limit);

  if (!firstResult.success) {
    throw new Error(firstResult.error?.message || "Failed to fetch pharmacies");
  }

  const firstPage = getPharmacyRecords(firstResult.data);
  const totalCount =
    typeof firstResult.results === "number"
      ? firstResult.results
      : firstPage.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const remainingResults = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getPharmaciesAction(index + 2, limit),
    ),
  );

  const pharmacies = [
    ...firstPage,
    ...remainingResults.flatMap((result) => {
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to fetch pharmacies");
      }

      return getPharmacyRecords(result.data);
    }),
  ];

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
      <PharmaciesHeader
        pharmacies={pharmacies}
        totalCount={pharmacies.length}
      />
      <PharmaciesList
        pharmacies={pharmacies}
        page={page}
        limit={limit}
        totalCount={pharmacies.length}
      />
    </PageContainer>
  );
}
