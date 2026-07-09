import { getUserByIdAction, getManagerTeamAction } from "@/features/team/api";
import { User } from "@/features/team/lib/types";
import ProfileClient from "@/features/team/components/profile/ProfileClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  // Fetch team member details from API
  const res = await getUserByIdAction(id);

  // If API fails, show error state
  if (!res.success || !res.user) {
    return (
      <main className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black">
            Team Member Not Found
          </h1>
          <p className="text-secondary-dark mt-2">
            The requested team member could not be loaded.
          </p>
          <Link
            href="/manager/team"
            className="bg-gold hover:text-gold border-gold mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-white hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back to Team
          </Link>
        </div>
      </main>
    );
  }

  const memberDetails = res.user;
  const isSupervisor = memberDetails.role === "SUPERVISOR";

  // Fetch supervisor's team members if supervisor
  let supervisorTeamMembers: User[] = [];
  if (isSupervisor) {
    const teamRes = await getManagerTeamAction(); // change to fetching one supervisor's team
    if (teamRes.success && teamRes.medicalReps) {
      supervisorTeamMembers = teamRes.medicalReps;
    }
  }

  return (
    <ProfileClient
      memberDetails={memberDetails}
      supervisorTeamMembers={supervisorTeamMembers}
      backUrl="/manager/team"
    />
  );
}
