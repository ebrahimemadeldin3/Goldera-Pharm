import CoachingHeader from "@/features/coaching/components/CoachingHeader";
import ReviewForm from "@/features/coaching/components/review/ReviewForm";
import JointVisitReviewList from "@/features/coaching/components/review/JointVisitReviewList";
import { getSupervisorCoachingReportsAction } from "@/features/coaching/api/supervisor";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams?: { page?: string; limit?: string } }) {
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 10;
  const result = await getSupervisorCoachingReportsAction(page, limit);

  if (!result.success || !result.data) {
    return (
      <main className="flex flex-col gap-6 p-6 *:min-[1440px]:w-270.75! *:lg:w-5xl">
        <div className="text-dashboard-red flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm">
            {result.error?.message || "Failed to load coaching reports"}
          </p>
        </div>
      </main>
    );
  }

  const { reports, stats } = result.data;

  return (
    <main className="flex flex-col gap-6 p-6 *:min-[1440px]:w-270.75! *:lg:w-5xl">
      <CoachingHeader data={stats} />
      <ReviewForm />
      <JointVisitReviewList
        reviews={reports}
        page={page}
        limit={limit}
        totalCount={result.totalCount ?? stats.totalReviews}
      />
    </main>
  );
}
