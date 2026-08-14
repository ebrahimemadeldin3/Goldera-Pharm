import { getAppraisalReviewsAction } from "@/features/appraisal/api";
import { NewAppraisalDialog } from "@/features/appraisal/components/NewAppraisalDialog";
import { AppraisalContent } from "@/features/appraisal/components/AppraisalContent";
import { PageContainer } from "@/components/layout/page-container";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const { reviews, stats, totalCount } = await getAppraisalReviewsAction(page, limit);

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-2xl/9 font-normal text-black md:text-[34px]/10">
            Performance Appraisals
          </h1>
          <p className="text-secondary-dark text-base/6">
            View and manage employee performance reviews
          </p>
        </div>
        <NewAppraisalDialog />
      </header>
      <AppraisalContent
        reviews={reviews}
        stats={stats}
        page={page}
        limit={limit}
        totalCount={totalCount}
      />
    </PageContainer>
  );
}
