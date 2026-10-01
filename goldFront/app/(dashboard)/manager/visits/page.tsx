import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
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
  const visits =
    visitsResponse.success && visitsResponse.visits
      ? visitsResponse.visits
      : [];
  const medicalReps =
    teamResponse.success && teamResponse.medicalReps
      ? teamResponse.medicalReps
      : [];
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
