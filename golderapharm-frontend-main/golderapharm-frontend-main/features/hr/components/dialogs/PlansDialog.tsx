"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plan } from "../../lib/types";
import { format } from "date-fns";
import { Calendar, Target } from "lucide-react";

type PlansDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  userName: string;
};

export function PlansDialog({
  open,
  onOpenChange,
  plans,
  userName,
}: PlansDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plans - {userName}</DialogTitle>
          <DialogDescription>Total plans: {plans.length}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {plans.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
              No plans found
            </div>
          ) : (
            plans.map((plan, idx) => (
              <div
                key={`${plan.id}-${idx}`}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-black">{plan.title}</h4>
                    <span className="rounded-xl border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {plan.type}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(plan.status)}`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>{plan.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(plan.startDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(plan.endDate), "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>
                          {plan.targetDoctors} doctors, {plan.targetVisits}{" "}
                          visits
                        </span>
                      </div>
                    </div>

                    {plan.objectives.length > 0 && (
                      <div>
                        <p className="font-medium text-black">Objectives:</p>
                        <ul className="ml-6 list-disc">
                          {plan.objectives.map((objective, idx) => (
                            <li key={idx}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.supervisorFeedback && (
                      <div className="mt-2 rounded-md bg-blue-50 p-3">
                        <p className="font-medium text-black">
                          Supervisor Feedback:
                        </p>
                        <p>{plan.supervisorFeedback}</p>
                      </div>
                    )}
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
