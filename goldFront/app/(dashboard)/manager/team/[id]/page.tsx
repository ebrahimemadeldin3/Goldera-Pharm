import { getUserByIdAction, getManagerTeamAction } from "@/features/team/api";
import { User } from "@/features/team/lib/types";
import ProfileClient from "@/features/team/components/profile/ProfileClient";
import { MemberProfileError } from "@/features/team/components/profile/MemberProfileStates";

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
    return <MemberProfileError backUrl="/manager/team" />;
  }

  const memberDetails = res.user;
  const isSupervisor = memberDetails.role === "SUPERVISOR";

  // Fetch supervisor's team members if supervisor
  let supervisorTeamMembers: User[] = [];
  if (isSupervisor) {
    const teamRes = await getManagerTeamAction();
    if (teamRes.success && teamRes.medicalReps) {
      supervisorTeamMembers = teamRes.medicalReps.filter(
        (member) => member.supervisorId === memberDetails.id,
      );
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
