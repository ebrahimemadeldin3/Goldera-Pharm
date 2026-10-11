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
  searchParams?: Promise<{ page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getPharmaciesAction(page, 200);

  if (!result.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-gp-navy-900 font-semibold text-base">Unable to load pharmacies</p>
          <p className="text-gp-text-muted mt-1 text-sm">{result.error?.message || "Please check your connection and retry."}</p>
        </div>
      </PageContainer>
    );
  }

  const pharmacies = getPharmacyRecords(result.data);

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
