import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
import { getVisitsAction } from "@/features/visits/api";
import { calculateVisitStats } from "@/features/visits/lib/utils/stats";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page() {
 
   const visitsResponse = await getVisitsAction(undefined, undefined, false);
  const visits = visitsResponse.success && visitsResponse.visits ? visitsResponse.visits : [];
  const stats = calculateVisitStats(visits);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <VisitsHeader role="MEDICAL_REP" stats={stats} />
      <div className="mt-6">
        <VisitsPlanner
          visits={visits || []}
          reportBasePath="/rep/visits/report"
          totalCount={visitsResponse.totalCount ?? visits.length}
        />
      </div>
    </PageContainer>
  );
}
