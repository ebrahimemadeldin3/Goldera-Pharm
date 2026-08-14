import CoachingHeader from "@/features/coaching/components/CoachingHeader";
import CoachingReportList from "@/features/coaching/components/CoachingReportList";
import { getRepCoachingReportsAction } from "@/features/coaching/api/rep";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

   const result = await getRepCoachingReportsAction(page, limit);

  // Handle error case
  if (!result.success || !result.stats || !result.reports) {
    return (
      <PageContainer className="flex flex-col gap-6">
        <div className="text-center text-red-500">
          <p>Failed to load coaching reports</p>
          <p className="text-sm">{result.error?.message}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-6">
      <CoachingHeader data={result.stats} />
      <CoachingReportList
        reports={result.reports}
        isRep
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? result.stats.totalReports}
      />
    </PageContainer>
  );
}
