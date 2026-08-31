import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
import VisitsHeader from "@/features/visits/components/VisitsHeader";
import VisitsPlanner from "@/features/visits/components/VisitsPlanner";
import { getVisitsAction } from "@/features/visits/api";
import { calculateVisitStats } from "@/features/visits/lib/utils/stats";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function RepVisitsPage() {
  const visitsResponse = await getVisitsAction(undefined, undefined, false);
  const visits = visitsResponse.success && visitsResponse.visits ? visitsResponse.visits : [];
  const stats = calculateVisitStats(visits);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)] pb-20 lg:pb-6">
      <VisitsHeader role="MEDICAL_REP" stats={stats} />
      <div className="mt-6">
        <VisitsPlanner
          visits={visits || []}
          reportBasePath="/rep/visits/report"
          totalCount={visitsResponse.totalCount ?? visits.length}
        />
      </div>

      {/* Mobile Field Sticky Action Bar (390px Viewports) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-[#E5E8EF] bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <Link
          href="/rep/visits/add"
          className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-gp-rep-primary px-3 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(22,133,87,0.22)] hover:bg-gp-rep-primary-hover"
        >
          <Plus size={16} />
          <span>Add Visit</span>
        </Link>
        <Link
          href="/rep/visits/report"
          className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#182033] hover:bg-[#F9FAFB]"
        >
          <CheckSquare size={16} className="text-[#667085]" />
          <span>Submit Report</span>
        </Link>
      </div>
    </PageContainer>
  );
}
