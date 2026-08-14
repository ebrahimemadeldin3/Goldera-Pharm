import { getSupervisorTeamMemberByIdAction } from "@/features/team/api";
import ProfileClient from "@/features/team/components/profile/ProfileClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

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
    return (
      <PageContainer className="flex h-full flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-[34px]/10 font-normal text-black">
            Team Member Not Found
          </h1>
          <p className="text-secondary-dark mt-2">
            The requested team member could not be loaded.
          </p>
          <Link
            href="/supervisor/team"
            className="bg-system-primary hover:text-system-primary border-system-primary mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-white hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back to Team
          </Link>
        </div>
      </PageContainer>
    );
  }

  const memberDetails = res.user;

  return (
    <ProfileClient memberDetails={memberDetails} backUrl="/supervisor/team" />
  );
}
