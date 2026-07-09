import { getAppraisalReviewsAction } from "@/features/appraisal/api";
import { NewAppraisalDialog } from "@/features/appraisal/components/NewAppraisalDialog";
import { AppraisalContent } from "@/features/appraisal/components/AppraisalContent";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const { reviews, stats, totalCount } = await getAppraisalReviewsAction(page, limit);

  return (
    <main className="bg-secondary-very-light flex flex-col gap-6 p-5 *:min-[1440px]:w-270.75! *:lg:w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-[34px]/10 font-normal text-black">
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
    </main>
  );
}
