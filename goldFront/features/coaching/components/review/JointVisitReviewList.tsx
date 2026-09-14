import { ClipboardList } from "lucide-react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
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
    <section className="coaching-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-gp-navy-900 text-lg font-semibold">
            Recent Joint Visit Reviews
          </h2>
          <p
            className="coaching-count-refresh text-gp-text-muted text-sm font-medium"
            aria-live="polite"
          >
            {reviews.length === 0
              ? "No reviews on this page"
              : `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"} shown on this page`}
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {reviews.map((review, index) => (
              <JointVisitReviewCard
                key={review.id}
                review={review}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="coaching-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-8 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-11 items-center justify-center rounded-full">
              <ClipboardList className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-3 text-[15px] font-semibold">
              No joint visit reviews yet
            </h3>
            <p className="text-gp-text-muted mx-auto mt-1 max-w-md text-sm leading-6 font-medium">
              Reviews will appear here after coaching sessions are documented.
            </p>
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="reviews"
        ariaLabel="Joint visit reviews pagination"
        pageNavAriaLabel="Joint visit reviews pages"
      />
    </section>
  );
}
