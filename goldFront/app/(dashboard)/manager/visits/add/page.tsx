import AddVisitForm from "@/features/visits/components/AddVisitForm";
import { fetchDoctors } from "@/features/doctors/api";
import { getManagerTeamAction } from "@/features/team/api";
import { ArrowLeft, CalendarPlus } from "lucide-react";
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
    <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden bg-[#F6F8FB]">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href="/manager/visits"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E8EF] bg-white text-[#101D36] transition-colors hover:border-[#C9A44C] hover:bg-[#FFFDF7] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
          aria-label="Back to visits"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-[#B88A2E] uppercase">
            <span className="inline-block h-px w-6 bg-[#C9A44C]" />
            Field Operations
          </p>
          <h1 className="mt-1 text-[30px] leading-tight font-semibold text-[#101D36] sm:text-[34px]">
            Schedule New Visit
          </h1>
          <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
            Schedule a doctor visit and assign field ownership.
          </p>
        </div>
        <span className="hidden size-11 items-center justify-center rounded-[12px] border border-[#E7D7A0] bg-[#FFF7E0] text-[#B88A2E] sm:flex">
          <CalendarPlus className="size-5" aria-hidden="true" />
        </span>
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
