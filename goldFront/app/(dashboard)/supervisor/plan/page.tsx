import PlanStats from "@/features/plan/components/PlanStats";
import CreatePlanDialogSupervisor from "@/features/plan/components/supervisor/CreatePlanDialogSupervisor";
import SupervisorPlansList from "@/features/plan/components/supervisor/SupervisorPlansList";
import { getSupervisorPlansAction } from "@/features/plan/api/get";
import { calculateSupervisorPlanStats } from "@/features/plan/lib/utils";
import { fetchProfile } from "@/features/profile/api";
import { getRegionsAction } from "@/lib/requests/regions";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const [plansResult, profile] = await Promise.all([
    getSupervisorPlansAction(page, limit),
    fetchProfile().catch(() => null),
  ]);

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

  if (!plansResult.success || !plansResult.repPlans) {
    return (
      <main className="bg-secondary-very-light p-6 *:min-[1440px]:w-270.75! lg:w-5xl">
        <div className="text-dashboard-red flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm">
            {plansResult.error?.message || "Failed to load plans"}
          </p>
        </div>
      </main>
    );
  }

  const stats = calculateSupervisorPlanStats(plansResult.repPlans);

  return (
    <main className="bg-secondary-very-light p-6 *:min-[1440px]:w-270.75! lg:w-5xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl/10 font-normal">Plans Management</h1>
          <p className="text-secondary-dark mt-2 text-base/6 font-normal">
            Create your plans and approve medical rep plans
          </p>
        </div>
        <CreatePlanDialogSupervisor
          userRole={profile?.role ?? "SUPERVISOR"}
          userSubRegionName={userSubRegionName}
        />
      </header>
      <PlanStats data={stats} />
      <SupervisorPlansList
        repPlans={plansResult.repPlans ?? []}
        myPlans={plansResult.myPlans ?? []}
        page={page}
        limit={limit}
        totalCount={plansResult.totalCount ?? (plansResult.repPlans?.length ?? 0)}
      />
    </main>
  );
}
