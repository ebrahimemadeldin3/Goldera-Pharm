"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  AlertCircle,
  User2,
  FileText,
  CircleCheckBig,
  MessageSquare,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoachingReport } from "../lib/types";
import { StarRating } from "./ui/StarRating";
import { addRepCommentAction } from "../api/rep";
import { toast } from "@/lib/utils/toast";
import { AddCommentDialog } from "./AddCommentDialog";

export default function CoachingReportCard({
  report,
  isRep = false,
}: {
  report: CoachingReport;
  isRep?: boolean;
}) {
  const r = report;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmitComment = (commentText: string) => {
    startTransition(async () => {
      try {
        const result = await addRepCommentAction(r.id, commentText);

        if (result.success) {
          toast.success({ title: "Comment added successfully" });
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error({
            title: result.error?.message || "Failed to add comment",
          });
        }
      } catch (error) {
        console.error("Submit comment error:", error);
        toast.error({ title: "An unexpected error occurred" });
      }
    });
  };

  const handleAcceptSilently = () => {
    handleSubmitComment("");
  };

  return (
    <Card className="border-secondary-light gap-4 rounded-xl border bg-white p-6 shadow-none">
      <CardHeader className="flex items-start justify-between gap-3 p-0">
        <div className="flex items-start gap-3">
          <div className="gradient-green flex size-14 items-center justify-center rounded-full text-base/6 font-normal text-white">
            {r.rep.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base/6 font-normal text-black">
                {" "}
                {isRep ? "Coaching Session" : r.rep.name}
              </p>
              <span className="bg-dashboard-green rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
                {r.visitType}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs/4 font-medium ${
                  r.status === "Completed"
                    ? "bg-dashboard-green text-white"
                    : "bg-dashboard-orange text-white"
                }`}
              >
                {r.status}
              </span>
            </div>
            <div className="text-secondary-dark mt-1 flex w-[500px] flex-wrap items-center gap-x-30 gap-y-1 text-sm/5">
              <p className="flex items-center gap-1">
                <User2 size={12} />
                <span>Supervisor: {r.supervisor}</span>
              </p>
              <p className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{r.date}</span>
              </p>
              <p className="flex items-center gap-1">
                <FileText size={12} />
                <span>
                  Dr. {r.doctor} - {r.hospital}{" "}
                </span>
              </p>
            </div>
          </div>
        </div>
        <StarRating value={r.rating} />
      </CardHeader>
      <CardContent className="p-0">
        {/* Two columns: Strengths / Improvements */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="bg-light-green-gradiant rounded-lg p-4">
            <div className="text-dashboard-green mb-3 flex items-center gap-2 text-base/6 font-normal">
              <CircleCheckBig size={20} />
              Strengths
            </div>
            <ul className="space-y-2">
              {r.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-dashboard-green mt-[7px] h-1 w-1 rounded-full" />
                  <span className="text-secondary-dark text-sm/5 font-normal">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-light-orange-gradiant rounded-lg p-4">
            <div className="text-dashboard-orange mb-3 flex items-center gap-2 text-base/6 font-normal">
              <AlertCircle size={20} />
              Areas for Improvement
            </div>
            <ul className="space-y-2">
              {r.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-dashboard-orange mt-[7px] h-1 w-1 rounded-full" />
                  <span className="text-secondary-dark text-sm/5 font-normal">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-light-blue-gradiant mt-3 rounded-lg p-4">
          <div className="text-dashboard-blue mb-1.5 flex items-center gap-2 text-base/6 font-normal">
            Action Plan
          </div>
          <p className="text-secondary-dark text-sm/5 font-normal">
            {r.actionPlan}
          </p>
        </div>

        {/* Supervisor Comments */}
        <div className="bg-secondary-very-light mt-3 rounded-lg p-4">
          <p className="mb-1.5 flex items-center gap-2 text-base/6 font-normal text-black">
            <MessageSquare className="text-dashboard-blue h-4 w-4" />
            Supervisor Comments
          </p>
          <p className="text-secondary-dark text-sm/5 font-normal">
            {r.supervisorComments}
          </p>
        </div>

        {/* Rep Response */}
        <div className="border-dashboard-green bg-light-green-gradiant mt-3 rounded-lg border-l-4 p-4">
          <p className="mb-1.5 flex items-center gap-2 text-base/6 font-normal text-black">
            <MessageSquare className="text-dashboard-green h-4 w-4" />
            {isRep ? "Your Response" : `${r.rep.name}'s Response`}
          </p>
          {isRep && r.status === "Completed" && (
            <p className="text-secondary-dark text-sm/5 font-normal">
              {r.repResponse}
            </p>
          )}
        </div>
        {isRep && r.status === "Pending Feedback" && (
          <div className="mt-4 flex w-full gap-3 *:h-9 *:flex-1">
            <Button
              onClick={handleAcceptSilently}
              disabled={isPending}
              variant="outline"
              className="border-dashboard-green text-dashboard-green hover:bg-dashboard-green cursor-pointer transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              size="sm"
            >
              <Check className="h-4 w-4" />
              {isPending ? "Processing..." : "Accept Silently"}
            </Button>

            <AddCommentDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSubmit={handleSubmitComment}
              isPending={isPending}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
