import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
import { VisitsErrorState } from "@/features/visits/components/VisitsErrorState";
import { getManagerVisitsAction } from "@/features/visits/api";
import { calculateVisitStats } from "@/features/visits/lib/utils/stats";
import { PageContainer } from "@/components/layout/page-container";
import { getManagerTeamAction } from "@/features/team/api";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [visitsResponse, teamResponse] = await Promise.all([
    getManagerVisitsAction(undefined, undefined, false),
    getManagerTeamAction("MEDICAL_REP", 1, 1000),
  ]);

  if (!visitsResponse.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
        <VisitsErrorState message={visitsResponse.error?.message} />
      </PageContainer>
    );
  }

  if (!teamResponse.success) {
    return (
      <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
        <VisitsErrorState
          title="Unable to load visit ownership data"
          message={teamResponse.error?.message}
        />
      </PageContainer>
    );
  }

  const visits = visitsResponse.visits ?? [];
  const medicalReps = teamResponse.medicalReps ?? [];
  const stats = calculateVisitStats(visits);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#F6F8FB]">
      <VisitsHeader role="MANAGER" stats={stats} />
      <div className="mt-6">
        <VisitsPlanner
          visits={visits || []}
          medicalReps={medicalReps}
          totalCount={visitsResponse.totalCount ?? visits.length}
        />
      </div>
    </PageContainer>
  );
}
