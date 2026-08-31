import VisitReportsList from "@/features/reports/components/VisitReportsList";
import { getVisitReportsAction } from "@/features/reports/api";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getVisitReportsAction(page, limit);

  if (!result.success || !result.data) {
    return (
      <PageContainer className="flex flex-col gap-6">
        <div className="flex items-center justify-center rounded-[10px] border border-[#FECDCA] bg-[#FEF3F2] p-4 text-xs font-semibold text-[#D92D20]">
          <p>{result.error?.message || "Failed to load visit reports"}</p>
        </div>
      </PageContainer>
    );
  }

  const { reports, totalCount } = result.data!;

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
              Field Operations
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
            My Visit Reports
          </h1>
          <p className="mt-0.5 text-sm text-[#667085]">
            View and review your submitted field visit reports
          </p>
        </div>

        <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1] px-4 py-2 text-right">
          <p className="text-[10px] font-bold text-[#168557] uppercase tracking-wider">
            Total Reports
          </p>
          <p className="text-xl font-bold text-[#182033]">{totalCount}</p>
        </div>
      </header>

      <VisitReportsList reports={reports} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
