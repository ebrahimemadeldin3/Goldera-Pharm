import {
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  FileText,
  CircleAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JointVisitReview } from "@/features/coaching/lib/types";

export default function JointVisitReviewCard({
  review,
}: {
  review: JointVisitReview;
}) {
  const getRatingLabel = (status: string) => {
    return status === "Excellent" ? "Excellent" : "Needs Improvement";
  };

  return (
    <Card className="border-secondary-light rounded-xl border-[0.8px] bg-white shadow-none">
      {/* Header */}
      <CardHeader className="flex items-center justify-start gap-4">
        <div className="from-system-gradient-from to-system-gradient-to flex size-14 items-center justify-center rounded-full bg-linear-to-b text-sm/5 font-medium text-white">
          {review.repInitials}
        </div>
        <div className="flex flex-col">
          <h2 className="text-base/6 font-normal text-black">
            {review.repName} & Dr. {review.doctorName}
          </h2>
          <div className="text-secondary-dark mt-1 flex flex-wrap items-center gap-x-4 text-base/6">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {review.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {review.duration}
            </span>
            <span className="flex w-full items-center gap-1">
              <MapPin size={16} />
              {review.location}
            </span>
          </div>
        </div>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs/4 font-medium ${
            review.status === "Excellent"
              ? "bg-dashboard-green text-white"
              : "bg-dashboard-red text-white"
          }`}
        >
          {review.performanceRating} - {getRatingLabel(review.status)}
        </span>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-light-green-gradiant border-green-stroke rounded-[8px] border-[0.8px] p-4">
            <h3 className="text-dashboard-green mb-2.5 flex items-center gap-2 text-sm/6 font-medium">
              <ThumbsUp className="text-dashboard-green h-4 w-4" /> What Went
              Well
            </h3>
            <ul className="space-y-1.5">
              {review.whatWentWell.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle
                    size={14}
                    className="text-dashboard-green mt-0.5 flex-shrink-0"
                  />
                  <span className="text-base/6 font-normal text-black">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-light-red-gradiant border-red-stroke rounded-[8px] border-[0.8px] p-4">
            <h3 className="text-dashboard-red mb-2.5 flex items-center gap-2 text-sm/6 font-medium">
              <ThumbsDown className="text-dashboard-red h-4 w-4" />
              Areas for Improvement
            </h3>
            <ul className="space-y-1.5">
              {review.areasForImprovement.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CircleAlert
                    size={14}
                    className="text-dashboard-red mt-0.5 flex-shrink-0"
                  />
                  <span className="text-base/6 font-normal text-black">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-light-blue-gradiant border-blue-stroke mb-4 rounded-[8px] border-[0.8px] p-4">
          <h3 className="text-dashboard-blue mb-1.5 flex items-center gap-2 text-sm/6 font-normal">
            <TrendingUp className="text-dashboard-blue h-4 w-4" />
            Recommendations & Coaching Points
          </h3>
          <p className="text-base/6 font-normal text-black">
            {review.recommendations}
          </p>
        </div>
        <div className="bg-light-orange-gradiant border-orange-stroke mb-4 rounded-[8px] border-[0.8px] p-4">
          <h3 className="text-dashboard-orange mb-2 flex items-center gap-2 text-sm/6 font-normal">
            <FileText className="h-4 w-4" />
            Action Items
          </h3>
          <ul className="space-y-1">
            {review.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-dashboard-orange mt-2 h-1 w-1 flex-shrink-0 rounded-full" />
                <span className="text-base/6 font-normal text-black">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-secondary-very-light border-secondary-stroke mb-4 rounded-[8px] border-[0.8px] p-4">
          <h3 className="mb-1.5 text-sm/6 font-medium text-black">
            Overall Notes
          </h3>
          <p className="text-secondary-dark text-sm/5 font-normal">
            {review.overallNotes}
          </p>
        </div>
      </CardContent>
      <CardFooter className="gap-4">
        <Button
          variant="outline"
          className="border-secondary-light h-9 cursor-pointer rounded-md border bg-white px-4 text-sm/5 font-medium text-black hover:bg-gray-50"
        >
          View Full Report
        </Button>
        <Button
          variant="outline"
          className="border-dashboard-blue text-dashboard-blue hover:bg-dashboard-blue h-9 cursor-pointer rounded-md border bg-white px-4 text-sm/5 font-medium hover:text-white"
        >
          Edit Review
        </Button>
        <Button className="border-dashboard-green text-dashboard-green hover:bg-dashboard-green h-9 cursor-pointer rounded-md border bg-white px-4 text-sm/5 font-medium hover:text-white">
          Share with Rep
        </Button>
      </CardFooter>
    </Card>
  );
}
