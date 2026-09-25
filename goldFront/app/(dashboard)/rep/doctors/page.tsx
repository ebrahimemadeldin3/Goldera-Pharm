import DoctorsHeader from "@/features/doctors/components/DoctorsHeader";
import DoctorsList from "@/features/doctors/components/DoctorsList";
import { getDoctorsAction } from "@/features/doctors/api";
import { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { PageContainer } from "@/components/layout/page-container";
import {
  resolveRepTerritoryScope,
  scopeDoctorsToRepTerritory,
} from "@/features/geography/lib/rep-territory-scope";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";
import { uniqueById } from "@/lib/utils/unique-by-id";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?:
    | Promise<{ page?: string; limit?: string; subRegion?: string }>
    | { page?: string; limit?: string; subRegion?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const [result, profile] = await Promise.all([
    getDoctorsAction(undefined, undefined, undefined, false),
    fetchProfile().catch(() => null),
  ]);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch doctors");
  }

  let doctors: DoctorApiResponse[] = [];

  if (result.data) {
    const res = result.data as unknown as {
      data?: DoctorApiResponse[];
      results?: number;
    };
    doctors = Array.isArray(res.data as unknown)
      ? (res.data as DoctorApiResponse[])
      : Array.isArray(result.data)
        ? (result.data as DoctorApiResponse[])
        : [];
  }

  const regionsResult = profile?.subRegionId ? await getRegionsAction() : null;
  const scope = resolveRepTerritoryScope(
    profile,
    regionsResult?.success ? regionsResult.regions : null,
  );
  const uniqueDoctors = uniqueById(doctors);
  const scopedDoctors = scopeDoctorsToRepTerritory(uniqueDoctors, scope);
  const totalCount = scopedDoctors.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <DoctorsHeader doctors={scopedDoctors} totalCount={totalCount} />
      <DoctorsList
        doctors={scopedDoctors}
        page={page}
        limit={limit}
        totalCount={totalCount}
        selectedSubRegion={scope?.subRegionName}
        clientPaginate
      />
    </PageContainer>
  );
}
