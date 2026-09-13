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

      <VisitReportsList reports={reports} page={page} limit={limit} totalCount={totalCount} />
    </PageContainer>
  );
}
