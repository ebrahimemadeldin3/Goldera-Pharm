import AddVisitForm from "@/features/visits/components/AddVisitForm";
import { fetchDoctors } from "@/features/doctors/api";
import { getManagerTeamAction } from "@/features/team/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [doctorsResponse, teamResponse] = await Promise.all([
    fetchDoctors(undefined, undefined, false),
    getManagerTeamAction(),
  ]);

  const doctors = doctorsResponse.data ?? [];

  const supervisors = teamResponse.success ? teamResponse.supervisors : [];
  const medicalReps = teamResponse.success ? teamResponse.medicalReps : [];

  return (
    <PageContainer className="flex min-h-[calc(100vh-195px)] flex-col gap-6">
      <header className="flex flex-wrap items-center justify-start gap-2">
        <Link
          href="/manager/visits"
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
      <AddVisitForm
        role="MANAGER"
        doctors={doctors ?? []}
        supervisors={supervisors || []}
        medicalReps={medicalReps || []}
      />
    </PageContainer>
  );
}
