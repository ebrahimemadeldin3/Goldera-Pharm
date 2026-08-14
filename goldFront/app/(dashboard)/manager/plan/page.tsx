import ManagerPlansList from "@/features/plan/components/manager/ManagerPlansList";
import { getManagerPlansAction } from "@/features/plan/api/get";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const plansResult = await getManagerPlansAction(page, limit);

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

  return (
    <PageContainer>
      <header className="mb-6">
        <h1 className="text-4xl/10 font-normal">Plans Management</h1>
        <p className="text-secondary-dark mt-2 text-base/6 font-normal">
          Review team plans and approve or reject using status updates.
        </p>
      </header>

      <ManagerPlansList
        plans={plansResult.data}
        page={page}
        limit={limit}
        totalCount={plansResult.totalCount ?? plansResult.data.length}
      />
    </PageContainer>
  );
}
