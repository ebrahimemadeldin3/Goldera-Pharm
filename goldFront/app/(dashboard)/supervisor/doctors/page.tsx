import DoctorsHeader from "@/features/doctors/components/DoctorsHeader";
import DoctorsList from "@/features/doctors/components/DoctorsList";
import { getDoctorsAction } from "@/features/doctors/api";
import { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; limit?: string; subRegion?: string }> | { page?: string; limit?: string; subRegion?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;
  const subRegion: string | undefined = params?.subRegion || undefined;

  const result = await getDoctorsAction(subRegion, page, limit);

  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch doctors");
  }

  let doctors: DoctorApiResponse[] = [];
  let totalCount = 0;

  if (result.data) {
    const res = result.data as unknown as { data?: DoctorApiResponse[]; results?: number };
    doctors = Array.isArray(res.data as unknown)
      ? (res.data as DoctorApiResponse[])
      : Array.isArray(result.data)
      ? (result.data as DoctorApiResponse[])
      : [];
  }

  if (result.results !== undefined) {
    totalCount = result.results;
  }

  return (
    <main className="bg-secondary-very-light min-h-[calc(100vh-80px)] p-5 min-[1440px]:w-270.75! lg:w-5xl">
      <DoctorsHeader doctors={doctors} totalCount={totalCount} />
      <DoctorsList
        doctors={doctors}
        page={page}
        limit={limit}
        totalCount={totalCount}
        selectedSubRegion={subRegion}
      />
    </main>
  );
}
