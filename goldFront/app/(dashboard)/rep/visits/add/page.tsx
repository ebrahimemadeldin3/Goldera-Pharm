import AddVisitForm from "@/features/visits/components/AddVisitForm";
import { fetchDoctors } from "@/features/doctors/api";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page() {
  const [doctorsResponse, profile] = await Promise.all([
    fetchDoctors(undefined, undefined, false),
    fetchProfile().catch(() => null),
  ]);
  
  let allDoctors: DoctorApiResponse[] | undefined = undefined;

  // Resolve subRegion name for doctor filtering
  let userSubRegionName: string | null = null;
  if (profile && profile.role !== "MANAGER" && profile.subRegionId) {
    const regionsResult = await getRegionsAction();
    if (regionsResult.success && regionsResult.regions) {
      for (const region of regionsResult.regions) {
        const found = region.subRegions.find(
          (sr) => sr.id === profile.subRegionId,
        );
        if (found) {
          userSubRegionName = found.name;
          break;
        }
      }
    }
  }

  if (doctorsResponse.data && doctorsResponse.data.length > 0) {
    allDoctors = doctorsResponse.data;

    if (userSubRegionName) {
      allDoctors = allDoctors.filter(
        (doctor) => doctor.subRegion === userSubRegionName,
      );
    }
  }

  const doctors = allDoctors;
  
  return (
    <PageContainer className="flex min-h-[calc(100vh-195px)] flex-col gap-6">
      <header className="flex flex-wrap items-center justify-start gap-3">
        <Link
          href="/rep/visits"
          className="border-[#E5E8EF] text-[#182033] hover:bg-[#F9FAFB] inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
            Schedule New Visit
          </h1>
          <p className="mt-0.5 text-sm font-medium text-[#667085]">
            Schedule a new doctor visit for your field territory
          </p>
        </div>
      </header>
      <AddVisitForm role="MEDICAL_REP" doctors={doctors ?? []} />
    </PageContainer>
  );
}
