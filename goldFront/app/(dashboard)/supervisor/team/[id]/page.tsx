import { getSupervisorTeamMemberByIdAction } from "@/features/team/api";
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
  const res = await getSupervisorTeamMemberByIdAction(id);

  // If API fails, show error state
  if (!res.success || !res.user) {
    return <MemberProfileError backUrl="/supervisor/team" />;
  }

  const memberDetails = res.user;

  return (
    <ProfileClient memberDetails={memberDetails} backUrl="/supervisor/team" />
  );
}
