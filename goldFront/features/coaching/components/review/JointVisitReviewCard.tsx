import type { CSSProperties } from "react";
import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  CircleAlert,
  ThumbsUp,
  TrendingUp,
  ListChecks,
  FileText,
  PenLine,
  Send,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JointVisitReview } from "@/features/coaching/lib/types";
import { cn } from "@/lib/utils";

export default function JointVisitReviewCard({
  review,
  animationIndex = 0,
}: {
  review: JointVisitReview;
  animationIndex?: number;
}) {
  const getRatingLabel = (status: string) => {
    return status === "Excellent" ? "Excellent" : "Needs Improvement";
  };

  return (
    <Card
      className="coaching-card coaching-card-enter border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 overflow-hidden rounded-[16px] border py-0"
      style={
        {
          "--coaching-card-delay": `${animationIndex * 60}ms`,
        } as CSSProperties
      }
    >
      {/* Header */}
      <CardHeader className="flex flex-wrap items-center justify-start gap-3 p-4 sm:p-5">
        <div className="coaching-card-avatar text-gp-gold-500 bg-gp-navy-900 border-gp-gold-300/60 flex size-14 shrink-0 items-center justify-center rounded-full border text-sm font-bold">
          {review.repInitials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-gp-navy-900 text-base leading-6 font-semibold">
            {review.repName} & Dr. {review.doctorName}
          </h2>
          <div className="text-gp-text-secondary mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-5">
            <span className="flex items-center gap-1.5">
              <Calendar
                className="coaching-meta-icon size-3.5"
                aria-hidden="true"
              />
              {review.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock
                className="coaching-meta-icon size-3.5"
                aria-hidden="true"
              />
              {review.duration}
            </span>
            <span className="flex w-full items-center gap-1.5 sm:w-auto">
              <MapPin
                className="coaching-meta-icon size-3.5"
                aria-hidden="true"
              />
              {review.location}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "coaching-status-badge ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs leading-4 font-semibold",
            review.status === "Excellent"
              ? "text-gp-success border-gp-success-border bg-gp-success-soft"
              : "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
          )}
        >
          <span
            className={cn(
              "coaching-status-badge-dot size-1.5 rounded-full",
              review.status === "Excellent" ? "bg-gp-success" : "bg-gp-warning",
            )}
            aria-hidden="true"
          />
          {review.performanceRating} - {getRatingLabel(review.status)}
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="border-gp-border-subtle bg-gp-surface-subtle/40 relative overflow-hidden rounded-[12px] border p-4">
            <span
              className="coaching-panel-rail bg-gp-success absolute top-3 bottom-3 left-0 w-[3px]"
              aria-hidden="true"
            />
            <h3 className="text-gp-success flex items-center gap-2 text-sm leading-5 font-semibold">
              <ThumbsUp className="size-4" aria-hidden="true" />
              What Went Well
            </h3>
            <ul className="mt-3 space-y-2">
              {review.whatWentWell.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-gp-success mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-gp-text-secondary text-sm leading-5">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-gp-border-subtle bg-gp-surface-subtle/40 relative overflow-hidden rounded-[12px] border p-4">
            <span
              className="coaching-panel-rail bg-gp-warning absolute top-3 bottom-3 left-0 w-[3px]"
              aria-hidden="true"
            />
            <h3 className="text-gp-warning flex items-center gap-2 text-sm leading-5 font-semibold">
              <CircleAlert className="size-4" aria-hidden="true" />
              Areas for Improvement
            </h3>
            <ul className="mt-3 space-y-2">
              {review.areasForImprovement.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CircleAlert
                    size={14}
                    className="text-gp-warning mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-gp-text-secondary text-sm leading-5">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-gp-border-subtle bg-gp-surface-subtle/40 relative mt-3 overflow-hidden rounded-[12px] border p-4">
          <span
            className="coaching-panel-rail bg-gp-navy-900 absolute top-3 bottom-3 left-0 w-[3px]"
            aria-hidden="true"
          />
          <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm leading-5 font-semibold">
            <TrendingUp className="size-4" aria-hidden="true" />
            Recommendations & Coaching Points
          </h3>
          <p className="text-gp-text-secondary mt-2 text-sm leading-6">
            {review.recommendations}
          </p>
        </div>

        <div className="border-gp-border-subtle bg-gp-surface-subtle/40 relative mt-3 overflow-hidden rounded-[12px] border p-4">
          <span
            className="coaching-panel-rail bg-gp-warning absolute top-3 bottom-3 left-0 w-[3px]"
            aria-hidden="true"
          />
          <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm leading-5 font-semibold">
            <ListChecks className="size-4" aria-hidden="true" />
            Action Items
          </h3>
          <ul className="mt-2 space-y-1.5">
            {review.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-gp-warning mt-2 h-1 w-1 shrink-0 rounded-full" />
                <span className="text-gp-text-secondary text-sm leading-5">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-gp-border-subtle bg-gp-surface-subtle/30 mt-3 rounded-[12px] border p-4">
          <h3 className="text-gp-navy-900 mb-1.5 text-sm leading-5 font-semibold">
            Overall Notes
          </h3>
          <p className="text-gp-text-secondary text-sm leading-6">
            {review.overallNotes}
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-gp-border-subtle flex-wrap gap-2.5 border-t p-4 sm:px-5">
        <Button
          variant="outline"
          className="text-gp-navy-900 border-gp-border-control hover:border-gp-gold-300 hover:bg-gp-gold-50 bg-gp-surface-card h-9 cursor-pointer rounded-[10px] border px-4 text-sm font-semibold shadow-none"
        >
          <FileText className="size-4" aria-hidden="true" />
          View Full Report
        </Button>
        <Button
          variant="outline"
          className="text-gp-navy-900 border-gp-border-control hover:border-gp-gold-300 hover:bg-gp-gold-50 bg-gp-surface-card h-9 cursor-pointer rounded-[10px] border px-4 text-sm font-semibold shadow-none"
        >
          <PenLine className="size-4" aria-hidden="true" />
          Edit Review
        </Button>
        <Button className="bg-gp-gold-500 hover:bg-gp-gold-600 shadow-gp-gold-action ml-auto h-9 cursor-pointer rounded-[10px] border border-transparent px-4 text-sm font-semibold text-white">
          <Send className="size-4" aria-hidden="true" />
          Share with Rep
        </Button>
      </CardFooter>
    </Card>
  );
}
