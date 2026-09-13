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
      <div className="flex items-center gap-2">
        <Link
          href="/rep/visits"
          className="border-[#E5E8EF] text-[#344054] hover:bg-[#F9FAFB] inline-flex h-9 items-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Visits</span>
        </Link>
      </div>
      <AddVisitForm role="MEDICAL_REP" doctors={doctors ?? []} />
    </PageContainer>
  );
}
