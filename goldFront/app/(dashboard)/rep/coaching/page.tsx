import CoachingHeader from "@/features/coaching/components/CoachingHeader";
import CoachingReportList from "@/features/coaching/components/CoachingReportList";
import { getRepCoachingReportsAction } from "@/features/coaching/api/rep";
import { PageContainer } from "@/components/layout/page-container";
import { CircleAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getRepCoachingReportsAction(page, limit);

  // Handle error case
  if (!result.success || !result.stats || !result.reports) {
    return (
      <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
        <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex items-start gap-3 rounded-[12px] border px-4 py-3.5">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">
              Failed to load coaching reports
            </p>
            <p className="text-gp-danger/80 mt-0.5 text-sm">
              {result.error?.message}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
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
