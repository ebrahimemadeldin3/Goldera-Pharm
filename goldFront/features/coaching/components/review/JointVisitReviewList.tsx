import Pagination from "@/components/ui/Pagination";
import JointVisitReviewCard from "./JointVisitReviewCard";
import { JointVisitReview } from "../../lib/types";

type JointVisitReviewListProps = {
  reviews: JointVisitReview[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function JointVisitReviewList({
  reviews,
  page = 1,
  limit = 10,
  totalCount = 0,
}: JointVisitReviewListProps) {
  return (
    <>
      <h2 className="text-2xl md:text-[36px]/10 font-normal text-black">
        Recent Joint Visit Reviews
      </h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <JointVisitReviewCard key={review.id} review={review} />
        ))}
      </div>
      <div className="mt-6">
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </div>
    </>
  );
}
