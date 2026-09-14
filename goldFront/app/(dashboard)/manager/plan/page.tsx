import ManagerPlansList from "@/features/plan/components/manager/ManagerPlansList";
import { getManagerPlansAction } from "@/features/plan/api/get";
import { PageContainer } from "@/components/layout/page-container";
import { ClipboardList } from "lucide-react";

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
    <PageContainer className="space-y-5">
      <header className="relative overflow-hidden py-0.5">
        <span
          className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[linear-gradient(100deg,rgba(201,164,76,0.14)_0%,rgba(201,164,76,0)_42%,rgba(16,29,54,0.06)_100%)]"
          aria-hidden="true"
        />
        <p className="text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
          <span className="bg-gp-gold-500 inline-block h-px w-6" />
          <ClipboardList className="size-3.5" aria-hidden="true" />
          Field Operations
        </p>
        <h1 className="text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
          Plans Management
        </h1>
        <p className="text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
          Review, compare and approve your team&apos;s field plans.
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
