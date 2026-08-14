import { getSupervisorTeamAction } from "@/features/team/api";
import SupervisorTeamList from "@/features/team/components/profile/SupervisorTeamList";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const res = await getSupervisorTeamAction(page, limit);
  const members = res.members ?? [];
  const totalCount = res.totalCount ?? members.length;

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl/9 font-normal text-black md:text-[34px]/10">My Team</h1>
          <p className="text-secondary-dark text-base/6">
            View and monitor your medical representatives
          </p>
        </div>
      </header>

      {res.success ? (
        members.length > 0 ? (
          <SupervisorTeamList
            members={members}
            page={page}
            limit={limit}
            totalCount={totalCount}
          />
        ) : (
          <div className="text-secondary-dark mt-8 text-center">
            No team members assigned yet
          </div>
        )
      ) : (
        <div className="text-secondary-dark mt-8 text-center">
          Failed to load team members
        </div>
      )}
    </PageContainer>
  );
}
