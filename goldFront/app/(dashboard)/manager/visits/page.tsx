import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
import { getManagerVisitsAction } from "@/features/visits/api";
import { calculateVisitStats } from "@/features/visits/lib/utils/stats";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page() {
 
  const visitsResponse = await getManagerVisitsAction(undefined, undefined, false);
  const visits = visitsResponse.success && visitsResponse.visits ? visitsResponse.visits : [];
  const stats = calculateVisitStats(visits);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <VisitsHeader role="MANAGER" stats={stats} />
      <div className="mt-6">
        <VisitsPlanner
          visits={visits || []}
          totalCount={visitsResponse.totalCount ?? visits.length}
        />
      </div>
    </PageContainer>
  );
}
