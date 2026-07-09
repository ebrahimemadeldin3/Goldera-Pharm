import { getSupervisorTeamAction } from "@/features/team/api";
import SupervisorTeamList from "@/features/team/components/profile/SupervisorTeamList";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const res = await getSupervisorTeamAction(page, limit);
  const members = res.members ?? [];
  const totalCount = res.totalCount ?? members.length;

  return (
    <main className="bg-secondary-very-light min-h-[calc(100vh-80px)] p-5">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[34px]/10 font-normal text-black">My Team</h1>
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
    </main>
  );
}
