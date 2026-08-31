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

  const isCompleted = r.status === "Completed";

  return (
    <Card className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none transition-all hover:border-[#CBEFDD] space-y-4">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 p-0">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557] font-bold text-sm">
            {r.rep.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#182033]">
                {isRep ? "Coaching Session" : r.rep.name}
              </h3>
              <span className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#3972D5]">
                {r.visitType}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                  isCompleted
                    ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                    : "bg-[#FFF8E5] text-[#B18732] border-[#E9DDB8]"
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#667085]">
              <p className="flex items-center gap-1">
                <User2 size={13} className="text-[#98A2B3]" />
                <span>Coach: <strong className="text-[#182033] font-medium">{r.supervisor}</strong></span>
              </p>
              <p className="flex items-center gap-1">
                <Calendar size={13} className="text-[#98A2B3]" />
                <span>{r.date}</span>
              </p>
              <p className="flex items-center gap-1">
                <FileText size={13} className="text-[#98A2B3]" />
                <span>Dr. {r.doctor} ({r.hospital})</span>
              </p>
            </div>
          </div>
        </div>

        <StarRating value={r.rating} />
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {/* Two columns: Strengths / Improvements */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1]/40 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#168557]">
              <CircleCheckBig size={15} />
              Strengths
            </div>
            <ul className="space-y-1.5">
              {r.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#344054]">
                  <span className="size-1.5 rounded-full bg-[#168557] mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[10px] border border-[#E9DDB8] bg-[#FFF8E5]/40 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#B18732]">
              <AlertCircle size={15} />
              Areas for Improvement
            </div>
            <ul className="space-y-1.5">
              {r.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#344054]">
                  <span className="size-1.5 rounded-full bg-[#B18732] mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        {r.actionPlan && (
          <div className="rounded-[10px] border border-[#D7E5FF] bg-[#EDF4FF]/40 p-3.5">
            <p className="text-xs font-bold text-[#3972D5] mb-1">Action Plan</p>
            <p className="text-xs text-[#344054]">{r.actionPlan}</p>
          </div>
        )}

        {/* Supervisor Comments */}
        {r.supervisorComments && (
          <div className="rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-3.5">
            <p className="text-xs font-bold text-[#182033] mb-1 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-[#168557]" />
              Supervisor Comments
            </p>
            <p className="text-xs text-[#667085]">{r.supervisorComments}</p>
          </div>
        )}

        {/* Rep Response / Actions */}
        {isRep && r.status === "Pending Feedback" && (
          <div className="mt-3 flex items-center justify-end gap-3 pt-2 border-t border-[#EEF1F6]">
            <Button
              onClick={handleAcceptSilently}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="h-9 rounded-[10px] border-[#E5E8EF] bg-white px-4 text-xs font-semibold text-[#344054] hover:bg-[#F6F8FB]"
            >
              <Check className="mr-1.5 size-3.5 text-[#168557]" />
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
