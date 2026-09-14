"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  Calendar,
  AlertCircle,
  User2,
  FileText,
  CircleCheckBig,
  MessageSquare,
  Check,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoachingReport } from "../lib/types";
import { StarRating } from "./ui/StarRating";
import { addRepCommentAction } from "../api/rep";
import { toast } from "@/lib/utils/toast";
import { AddCommentDialog } from "./AddCommentDialog";
import { cn } from "@/lib/utils";

export default function CoachingReportCard({
  report,
  isRep = false,
  animationIndex = 0,
}: {
  report: CoachingReport;
  isRep?: boolean;
  animationIndex?: number;
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
    <Card
      className="coaching-card coaching-card-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 overflow-hidden rounded-[16px] border py-0"
      style={
        {
          "--coaching-card-delay": `${animationIndex * 60}ms`,
        } as CSSProperties
      }
    >
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="coaching-card-avatar text-gp-gold-500 bg-gp-navy-900 border-gp-gold-300/60 flex size-14 shrink-0 items-center justify-center rounded-full border text-sm font-bold">

            {r.rep.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-gp-navy-900 text-base leading-6 font-semibold">
                {isRep ? "Coaching Session" : r.rep.name}
              </p>
              <span className="text-gp-navy-900 border-gp-border-control bg-gp-surface-subtle rounded-full border px-2 py-0.5 text-xs leading-4 font-semibold">
                {r.visitType}
              </span>
              <span
                className={cn(
                  "coaching-status-badge inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs leading-4 font-semibold",
                  r.status === "Completed"
                    ? "text-gp-success border-gp-success-border bg-gp-success-soft"
                    : "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
                )}

              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    r.status === "Completed"
                      ? "bg-gp-success"
                      : "bg-gp-warning",
                  )}
                  aria-hidden="true"
                />
                {r.status}
              </span>
            </div>
            <div className="text-gp-text-secondary mt-1.5 flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-sm leading-5">
              <p className="flex items-center gap-1.5">
                <User2
                  className="coaching-meta-icon size-3.5"
                  aria-hidden="true"
                />
                <span className="font-medium">Supervisor: {r.supervisor}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar
                  className="coaching-meta-icon size-3.5"
                  aria-hidden="true"
                />
                <span className="font-medium">{r.date}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <FileText
                  className="coaching-meta-icon size-3.5"
                  aria-hidden="true"
                />
                <span className="font-medium">
                  Dr. {r.doctor}
                  {r.hospital ? ` - ${r.hospital}` : ""}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="border-gp-border-subtle bg-gp-surface-subtle/60 flex items-center gap-3 rounded-[12px] border px-3 py-2">
          <span className="text-gp-text-muted text-xs font-semibold">
            Rating
          </span>
          <StarRating value={r.rating} />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Two columns: Strengths / Improvements */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="coaching-card-panel border-gp-border-subtle bg-gp-surface-subtle/40 relative overflow-hidden rounded-[12px] border p-4">
            <span
              className="coaching-panel-rail bg-gp-success absolute top-3 bottom-3 left-0 w-[3px]"
              aria-hidden="true"
            />
            <div className="text-gp-success flex items-center gap-2 text-sm leading-5 font-semibold">
              <CircleCheckBig className="size-4" aria-hidden="true" />
              Strengths
            </div>
            <ul className="mt-3 space-y-2">
              {r.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-gp-success mt-[7px] h-1 w-1 rounded-full" />
                  <span className="text-gp-text-secondary text-sm leading-5">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="coaching-card-panel border-gp-border-subtle bg-gp-surface-subtle/40 relative overflow-hidden rounded-[12px] border p-4">
            <span
              className="coaching-panel-rail bg-gp-warning absolute top-3 bottom-3 left-0 w-[3px]"
              aria-hidden="true"
            />
            <div className="text-gp-warning flex items-center gap-2 text-sm leading-5 font-semibold">
              <AlertCircle className="size-4" aria-hidden="true" />
              Areas for Improvement
            </div>
            <ul className="mt-3 space-y-2">
              {r.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="bg-gp-warning mt-[7px] h-1 w-1 rounded-full" />
                  <span className="text-gp-text-secondary text-sm leading-5">
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Plan */}
        <div className="border-gp-border-subtle bg-gp-surface-subtle/40 relative mt-3 overflow-hidden rounded-[12px] border p-4">
          <span
            className="coaching-panel-rail bg-gp-navy-900 absolute top-3 bottom-3 left-0 w-[3px]"
            aria-hidden="true"
          />
          <div className="text-gp-navy-900 flex items-center gap-2 text-sm leading-5 font-semibold">
            <ListChecks className="size-4" aria-hidden="true" />
            Action Plan
          </div>
          <p className="text-gp-text-secondary mt-2 text-sm leading-6">
            {r.actionPlan}
          </p>
        </div>

        {/* Supervisor Comments */}
        <div className="border-gp-border-subtle bg-gp-surface-subtle/40 mt-3 rounded-[12px] border p-4">
          <p className="text-gp-navy-900 flex items-center gap-2 text-sm leading-5 font-semibold">
            <MessageSquare
              className="text-gp-navy-900 size-4"
              aria-hidden="true"
            />
            Supervisor Comments
          </p>
          <p className="text-gp-text-secondary mt-2 text-sm leading-6">
            {r.supervisorComments}
          </p>
        </div>

        {/* Rep Response */}
        <div className="border-gp-success-border bg-gp-success-soft/40 relative mt-3 overflow-hidden rounded-[12px] border p-4">
          <span
            className="coaching-panel-rail bg-gp-success absolute top-3 bottom-3 left-0 w-[3px]"
            aria-hidden="true"
          />
          <p className="text-gp-navy-900 flex items-center gap-2 text-sm leading-5 font-semibold">
            <MessageSquare
              className="text-gp-success size-4"
              aria-hidden="true"
            />
            {isRep ? "Your Response" : `${r.rep.name}'s Response`}
          </p>
          {isRep && r.status === "Completed" && (
            <p className="text-gp-text-secondary mt-2 text-sm leading-6">
              {r.repResponse}
            </p>
          )}
        </div>

        {isRep && r.status === "Pending Feedback" && (
          <div className="mt-4 flex w-full flex-wrap gap-3 *:h-10 *:flex-1">
            <Button
              onClick={handleAcceptSilently}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="border-gp-success-border text-gp-success hover:bg-gp-success-soft hover:border-gp-success bg-gp-surface-card hover:text-gp-success cursor-pointer rounded-[10px] border transition-[background-color,border-color,color,transform] duration-[190ms] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden="true" />
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
