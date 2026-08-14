import DoctorsHeader from "@/features/doctors/components/DoctorsHeader";
import DoctorsList from "@/features/doctors/components/DoctorsList";
import { getDoctorsAction } from "@/features/doctors/api";
import { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getDoctorsAction(undefined, page, limit);
 
  if (!result.success) {
    throw new Error(result.error?.message || "Failed to fetch doctors");
  }


  if (result.data == null) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)]">
        <DoctorsHeader doctors={[]} />
        <DoctorsList doctors={[]} />
      </PageContainer>
    );
  }

  let doctors: DoctorApiResponse[] = [];
  let totalCount = 0;

  if (result.data) {
    const res = result.data as unknown as { data?: DoctorApiResponse[]; results?: number };
    doctors = Array.isArray((res.data as unknown)) ? (res.data as DoctorApiResponse[]) : (res as unknown as DoctorApiResponse[]);
   }
  
  if (result.results !== undefined) {
    totalCount = result.results;
  }

 
  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <DoctorsHeader doctors={doctors} />
      <DoctorsList doctors={doctors} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
