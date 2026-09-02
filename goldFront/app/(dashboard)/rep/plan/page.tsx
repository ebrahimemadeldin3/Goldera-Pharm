import PlanStats from "@/features/plan/components/PlanStats";
import CreatePlanDialogRep from "@/features/plan/components/rep/CreatePlanDialogRep";
import RepPlansList from "@/features/plan/components/rep/RepPlansList";
import { calculateRepPlanStats } from "@/features/plan/lib/utils";
import { getRepPlansAction } from "@/features/plan/api/get";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

 
  // Fetch plans data and user profile in parallel
  const [plansResult, profile] = await Promise.all([
    getRepPlansAction(page, limit),
    fetchProfile().catch(() => null),
  ]);

  // Resolve subRegion name for doctor filtering
  let userSubRegionName: string | null = null;
  if (profile && profile.role !== "MANAGER" && profile.subRegionId) {
    const regionsResult = await getRegionsAction();
    if (regionsResult.success && regionsResult.regions) {
      for (const region of regionsResult.regions) {
        const found = region.subRegions.find(
          (sr) => sr.id === profile.subRegionId,
        );
        if (found) {
          userSubRegionName = found.name;
          break;
        }
      }
    }
  }

  if (!plansResult.success || !plansResult.data) {
    return (
      <PageContainer>
        <div className="text-dashboard-red flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm">
            {plansResult.error?.message || "Failed to load plans"}
          </p>
        </div>
      </PageContainer>
    );
  }

  const plans = plansResult.data;
  const stats = calculateRepPlanStats(plans);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
              Planning
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
            Plan
          </h1>
          <p className="mt-0.5 text-sm text-[#667085]">
            Your visit plan, doctor coverage, and progress
          </p>
        </div>
        <CreatePlanDialogRep
          userRole={profile?.role ?? "MEDICAL_REP"}
          userSubRegionName={userSubRegionName}
        />
      </header>
      <PlanStats data={stats} />
      <RepPlansList
        plans={plans}
        page={page}
        limit={limit}
        totalCount={plansResult.totalCount ?? plans.length}
      />
    </PageContainer>
  );
}
