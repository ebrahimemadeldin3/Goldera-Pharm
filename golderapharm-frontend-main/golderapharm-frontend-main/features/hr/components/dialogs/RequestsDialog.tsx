"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Request } from "../../lib/types";
import { format } from "date-fns";
import { AlertCircle, Calendar, FileText } from "lucide-react";

type RequestsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: Request[];
  userName: string;
};

export function RequestsDialog({
  open,
  onOpenChange,
  requests,
  userName,
}: RequestsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-dashboard-green text-white";
      case "REJECTED":
        return "bg-dashboard-red text-white";
      case "PENDING":
        return "bg-dashboard-orange text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "LEAVE":
        return "border-dashboard-blue text-dashboard-blue";
      case "EXPENSE":
        return "border-dashboard-gold text-dashboard-gold";
      case "SAMPLE":
        return "border-dashboard-green text-dashboard-green";
      default:
        return "border-gray-400 text-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Requests - {userName}</DialogTitle>
          <DialogDescription>
            Total requests: {requests.length}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No requests found
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-black">
                        {request.title}
                      </h4>
                      <span
                        className={`rounded-xl border px-2 py-0.5 text-xs font-medium ${getTypeColor(request.type)}`}
                      >
                        {request.type}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <strong>Subject:</strong> {request.subject}
                      </p>
                      <p>{request.description}</p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <strong>Created:</strong>{" "}
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </p>
                      {request.urgency && (
                        <p className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <strong>Urgency:</strong> {request.urgency}
                        </p>
                      )}
                      {request.leaveStartDate && request.leaveEndDate && (
                        <div className="mt-2 rounded-md bg-slate-50 p-3">
                          <p className="font-medium text-black">
                            Leave Details:
                          </p>
                          <p>
                            From:{" "}
                            {format(
                              new Date(request.leaveStartDate),
                              "MMM d, yyyy",
                            )}
                          </p>
                          <p>
                            To:{" "}
                            {format(
                              new Date(request.leaveEndDate),
                              "MMM d, yyyy",
                            )}
                          </p>
                          {request.leaveDaysCount && (
                            <p>Days: {request.leaveDaysCount}</p>
                          )}
                        </div>
                      )}
                      {request.response && (
                        <div className="mt-2 rounded-md bg-blue-50 p-3">
                          <p className="font-medium text-black">Response:</p>
                          <p>{request.response}</p>
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
