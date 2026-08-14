"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Appraisal } from "../../lib/types";
import { format } from "date-fns";
import { Calendar, TrendingUp } from "lucide-react";

type AppraisalsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisals: Appraisal[];
  userName: string;
};

export function AppraisalsDialog({
  open,
  onOpenChange,
  appraisals,
  userName,
}: AppraisalsDialogProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-dashboard-green";
    if (score >= 60) return "text-dashboard-blue";
    if (score >= 40) return "text-dashboard-orange";
    return "text-dashboard-red";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-dashboard-green";
    if (score >= 60) return "bg-dashboard-blue";
    if (score >= 40) return "bg-dashboard-orange";
    return "bg-dashboard-red";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appraisals - {userName}</DialogTitle>
          <DialogDescription>
            Total appraisals: {appraisals.length}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {appraisals.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No appraisals found
            </div>
          ) : (
            appraisals.map((appraisal, idx) => {
              const avgScore = Math.round(
                (appraisal.salesPerformance +
                  appraisal.customerRelationships +
                  appraisal.productKnowledge +
                  appraisal.complianceAndRegulations +
                  appraisal.teamworkAndCollaboration) /
                  5,
              );

              return (
                <div
                  key={`${appraisal.id}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-black">
                          {format(new Date(appraisal.period), "MMMM yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span
                          className={`text-lg font-bold ${getScoreColor(avgScore)}`}
                        >
                          {avgScore}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Sales Performance
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(appraisal.salesPerformance)}`}
                              style={{
                                width: `${appraisal.salesPerformance}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {appraisal.salesPerformance}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Customer Relationships
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(appraisal.customerRelationships)}`}
                              style={{
                                width: `${appraisal.customerRelationships}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {appraisal.customerRelationships}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Product Knowledge
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(appraisal.productKnowledge)}`}
                              style={{
                                width: `${appraisal.productKnowledge}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {appraisal.productKnowledge}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-slate-500">
                          Compliance & Regulations
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(appraisal.complianceAndRegulations)}`}
                              style={{
                                width: `${appraisal.complianceAndRegulations}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {appraisal.complianceAndRegulations}%
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p className="mb-1 text-xs text-slate-500">
                          Teamwork & Collaboration
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${getScoreBgColor(appraisal.teamworkAndCollaboration)}`}
                              style={{
                                width: `${appraisal.teamworkAndCollaboration}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {appraisal.teamworkAndCollaboration}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {appraisal.feedbackComments && (
                      <div className="mt-2 rounded-md bg-blue-50 p-3">
                        <p className="font-medium text-black">Feedback:</p>
                        <p className="text-sm">{appraisal.feedbackComments}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
