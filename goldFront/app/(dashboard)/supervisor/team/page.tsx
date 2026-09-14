import { getSupervisorTeamAction } from "@/features/team/api";
import TeamList from "@/features/team/components/TeamList";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const res = await getSupervisorTeamAction(page, limit);
  const members = res.members ?? [];
  const totalCount = res.totalCount ?? members.length;

  return (
    <PageContainer className="bg-gp-surface-page min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="team-header-eyebrow flex items-center gap-2">
            <span
              className="bg-gp-gold-500 h-px w-8 rounded-full"
              aria-hidden="true"
            />
            <p className="text-gp-gold-600 text-[11px] leading-none font-semibold tracking-[0.08em] uppercase">
              Team
            </p>
          </div>
          <h1 className="team-header-title text-gp-text-primary mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
            My Team
          </h1>
          <p className="team-header-description text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
            View and monitor your medical representatives.
          </p>
        </div>
      </header>

      {res.success ? (
        <TeamList
          members={members}
          page={page}
          limit={limit}
          totalCount={totalCount}
          baseUrl="/supervisor/team"
        />
      ) : (
        <div className="team-page-enter border-gp-danger-border bg-gp-danger-soft text-gp-danger shadow-gp-card rounded-[16px] border p-5 text-sm font-semibold">
          Failed to load team members
        </div>
      )}
    </PageContainer>
  );
}
