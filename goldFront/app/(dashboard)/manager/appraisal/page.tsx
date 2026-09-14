import { CircleAlert } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { getAppraisalReviewsAction } from "@/features/appraisal/api";
import { AppraisalHeader } from "@/features/appraisal/components/AppraisalHeader";
import { AppraisalReviewsList } from "@/features/appraisal/components/AppraisalReviewsList";
import { AppraisalStats } from "@/features/appraisal/components/AppraisalStats";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: { page?: string; limit?: string };
}) {
  const params = await searchParams;

  const page: number = params?.page ? parseInt(params.page, 10) || 1 : 1;
  const limit: number = params?.limit ? parseInt(params.limit, 10) || 10 : 10;

  const result = await getAppraisalReviewsAction(page, limit);

  if (!result.success) {
    return (
      <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
        <div className="border-gp-danger-border bg-gp-danger-soft text-gp-danger flex items-start gap-3 rounded-[12px] border px-4 py-3.5">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Failed to load appraisals</p>
            <p className="text-gp-danger/80 mt-0.5 text-sm">
              {result.error?.message}
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const reviews = result.reviews ?? [];
  const totalCount = result.totalCount ?? reviews.length;
  const stats = result.stats ?? {
    avgScore: 0,
    excellentCount: 0,
    improvingCount: 0,
    totalReviews: 0,
  };

  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <AppraisalHeader />
      <AppraisalStats
        avgScore={stats.avgScore}
        excellentCount={stats.excellentCount}
        improvingCount={stats.improvingCount}
        totalReviews={stats.totalReviews}
      />
      <AppraisalReviewsList
        reviews={reviews}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}