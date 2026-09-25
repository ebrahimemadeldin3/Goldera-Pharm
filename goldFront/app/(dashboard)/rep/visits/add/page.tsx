import AddVisitForm from "@/features/visits/components/AddVisitForm";
import { getSchedulableDoctorsAction } from "@/features/doctors/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page() {
  const doctorsResponse = await getSchedulableDoctorsAction();
  const doctors = doctorsResponse.success ? doctorsResponse.data : [];
  
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
