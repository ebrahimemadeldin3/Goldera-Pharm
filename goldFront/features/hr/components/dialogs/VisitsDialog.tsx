"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Visit } from "../../lib/types";
import { format } from "date-fns";
import { Calendar, Clock, FileText } from "lucide-react";

type VisitsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visits: Visit[];
  userName: string;
};

export function VisitsDialog({
  open,
  onOpenChange,
  visits,
  userName,
}: VisitsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-dashboard-green text-white";
      case "SCHEDULED":
        return "bg-dashboard-blue text-white";
      case "CANCELLED":
        return "bg-dashboard-red text-white";
      default:
        return "bg-dashboard-orange text-white";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visits - {userName}</DialogTitle>
          <DialogDescription>Total visits: {visits.length}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {visits.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No visits found
            </div>
          ) : (
            visits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-medium text-black">
                        {visit.visitType}
                      </h4>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(visit.status)}`}
                      >
                        {visit.status}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(visit.date), "MMM d, yyyy")}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {visit.time}
                      </p>
                      {visit.notes && (
                        <p className="flex items-start gap-2">
                          <FileText className="mt-0.5 h-4 w-4" />
                          <span>{visit.notes}</span>
                        </p>
                      )}
                      {visit.samples.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium text-black">Samples:</p>
                          <ul className="ml-4 list-disc">
                            {visit.samples.map((sample, idx) => (
                              <li key={idx}>{sample}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
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
