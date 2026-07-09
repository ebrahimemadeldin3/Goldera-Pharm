"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisitReport } from "../../lib/types";
import { format } from "date-fns";
import { Clock, Star, FileText, Package } from "lucide-react";

type VisitReportsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitReports: VisitReport[];
  userName: string;
};

export function VisitReportsDialog({
  open,
  onOpenChange,
  visitReports,
  userName,
}: VisitReportsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visit Reports - {userName}</DialogTitle>
          <DialogDescription>
            Total reports: {visitReports.length}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {visitReports.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No visit reports found
            </div>
          ) : (
            visitReports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium">
                        {report.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Rating: {report.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div>
                      <p className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4" />
                        <span className="font-medium text-black">Purpose:</span>
                      </p>
                      <p className="ml-6">{report.visitPurpose}</p>
                    </div>

                    {report.notes && (
                      <div>
                        <p className="font-medium text-black">Notes:</p>
                        <p className="ml-6">{report.notes}</p>
                      </div>
                    )}

                    {report.discussedTopics.length > 0 && (
                      <div>
                        <p className="font-medium text-black">
                          Discussed Topics:
                        </p>
                        <ul className="ml-6 list-disc">
                          {report.discussedTopics.map((topic, idx) => (
                            <li key={idx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.samplesProvided.length > 0 && (
                      <div>
                        <p className="flex items-center gap-2 font-medium text-black">
                          <Package className="h-4 w-4" />
                          Samples Provided:
                        </p>
                        <ul className="ml-6 list-disc">
                          {report.samplesProvided.map((sample, idx) => (
                            <li key={idx}>{sample}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.doctorFeedback && (
                      <div className="mt-2 rounded-md bg-blue-50 p-3">
                        <p className="font-medium text-black">
                          Doctor Feedback:
                        </p>
                        <p>{report.doctorFeedback}</p>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      Created:{" "}
                      {format(new Date(report.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
