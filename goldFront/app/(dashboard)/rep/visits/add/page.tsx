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
      <header className="flex flex-wrap items-center justify-start gap-2">
        <Link
          href="/rep/visits"
          className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <h1 className="font-nomral text-2xl text-black md:text-[34px]">
            Schedule New Visit
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Schedule a new doctor visit
          </p>
        </div>
      </header>
      <AddVisitForm role="MEDICAL_REP" doctors={doctors ?? []} />
    </PageContainer>
  );
}
