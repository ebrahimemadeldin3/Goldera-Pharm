import AddVisitForm from "@/features/visits/components/AddVisitForm";
import { fetchDoctors } from "@/features/doctors/api";
import { getSupervisorTeamAction } from "@/features/team/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [doctorsResponse, teamResponse] = await Promise.all([
    fetchDoctors(undefined, undefined, false),
    getSupervisorTeamAction(),
  ]);

  const doctors = doctorsResponse.data ?? [];
  const medicalReps = teamResponse.success ? teamResponse.members : [];

  return (
    <main className="flex min-h-[calc(100vh-195px)] flex-col gap-6 p-6 *:min-[1440px]:w-270.75! *:lg:w-5xl">
      <header className="flex items-center justify-start gap-2">
        <Link
          href="/supervisor/visits"
          className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="ml-3">
          <h1 className="font-nomral text-[34px] text-black">
            Schedule New Visit
          </h1>
          <p className="text-secondary-dark text-[16px]">
            Schedule a new doctor visit
          </p>
        </div>
      </header>
      <AddVisitForm
        role="SUPERVISOR"
        doctors={doctors}
        medicalReps={medicalReps || []}
      />
    </main>
  );
}
