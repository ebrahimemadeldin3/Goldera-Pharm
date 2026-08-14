import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
import { getSupervisorVisitsAction } from "@/features/visits/api";
import { calculateVisitStats } from "@/features/visits/lib/utils/stats";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const visitsResponse = await getSupervisorVisitsAction(undefined, undefined, false);
  const visits = visitsResponse.success && visitsResponse.visits ? visitsResponse.visits : [];
  const stats = calculateVisitStats(visits);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <VisitsHeader role="SUPERVISOR" stats={stats} />
      <div className="mt-6">
        <VisitsPlanner
          visits={visits || []}
          page={page}
          limit={limit}
          totalCount={visitsResponse.totalCount ?? visits.length}
        />
      </div>
    </PageContainer>
  );
}
