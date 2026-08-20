import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Calendar,
  User,
  Mail,
  MapPin,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import type { Review } from "@/features/appraisal/lib/types";

type Props = { reviews: Review[] };

export function ReviewsList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div className="text-secondary-dark text-sm">
        No reviews match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <Card
          key={r.id}
          className="border-secondary-light flex flex-row rounded-xl border-[.8px] bg-white p-6 shadow-none *:m-0 *:p-0"
        >
          <CardHeader className="gradient-blue flex size-14 items-center justify-center rounded-full text-base/6 font-normal text-white">
            {r.initials}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col items-start gap-4 p-0">
            <div className="flex items-center gap-2">
              <span className="text-base/6 font-medium text-black">
                {r.name}
              </span>
              <span className="bg-dashboard-blue rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
                {r.role}
              </span>
              {r.statusBadge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs/4 font-medium text-white ${
                    r.statusBadge === "Excellent"
                      ? "bg-gold"
                      : r.statusBadge === "Improving"
                        ? "bg-dashboard-green"
                        : "bg-dashboard-blue"
                  }`}
                >
                  {r.statusBadge}
                </span>
              )}
            </div>
            <div className="text-secondary-dark flex w-full flex-wrap gap-x-4 gap-y-2 text-sm/5 font-normal">
              <p className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {r.email}
              </p>
              {r.department && (
                <p className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {r.department}
                </p>
              )}
              {r.location && (
                <p className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {r.location}
                </p>
              )}
              <p className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Period: {r.period}
              </p>
              <p className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Reviewed by: {r.managerName}
              </p>
            </div>
            <div className="w-full">
              <p className="text-secondary-dark flex items-center text-sm/5 font-normal">
                Overall Score
                {r.overallPrevious && (
                  <span className="ml-auto text-xs/4">
                    Previous: {r.overallPrevious}%
                  </span>
                )}
                <span className="text-dashboard-blue ml-1 text-base/6 font-normal">
                  {r.overallCurrent}%
                </span>
              </p>
              <div className="bg-secondary-light mt-2 h-2 w-full rounded-full">
                <div
                  className="bg-dashboard-blue h-2 rounded-full"
                  style={{ width: `${r.overallCurrent}%` }}
                />
              </div>
            </div>
            <div className="mt-3 grid w-full grid-cols-4 gap-2">
              {r.kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-light-blue flex flex-col items-center justify-center rounded-lg px-2 py-3"
                >
                  <p className="text-secondary-dark text-center text-xs/4 font-normal">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-sm/5 font-semibold text-black">
                    {kpi.value}%
                  </p>
                </div>
              ))}
            </div>
            <div className="text-secondary-dark flex items-start gap-5 text-xs/4">
              <p className="flex items-center gap-1">
                <Calendar size={12} /> Last Review: {r.lastReview}
              </p>
              {r.feedbackComments && r.feedbackComments.trim() !== "" && (
                <p className="flex items-start gap-1">
                  <MessageSquare size={12} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{r.feedbackComments}</span>
                </p>
              )}
            </div>
          </CardContent>
          {/* <CardFooter className="ml-auto flex w-fit flex-col items-center gap-2">
            <Button
              variant="outline"
              className="border-secondary-light border-[0.8px] p-3 text-sm/5 font-medium"
            >
              View Profile
            </Button>
            <Button
              variant="outline"
              className="border-secondary-light border-[0.8px] p-3 text-sm/5 font-medium"
            >
              Edit Review
            </Button>
          </CardFooter> */}
        </Card>
      ))}
    </div>
  );
}
