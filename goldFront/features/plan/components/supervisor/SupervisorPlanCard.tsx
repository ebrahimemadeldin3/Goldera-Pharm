"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Stethoscope, ChevronDown, ChevronUp, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getInitials } from "@/lib/utils";
import { planTypeConfig, statusConfig } from "../../lib/constants";
import { VisitPlan } from "@/features/plan/api/get";
import { groupSelectedDoctorsByDay } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SupervisorPlanCardProps = {
  plan: VisitPlan;
  onApprove: (planId: string) => void;
  onReject: (planId: string, feedback?: string) => void;
};

export default function SupervisorPlanCard({
  plan,
  onApprove,
  onReject,
}: SupervisorPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const repName = plan.rep?.name || "Unknown Rep";
  const doctorGroups = groupSelectedDoctorsByDay(plan.selectedDoctors);
  const selectedDoctors = plan.selectedDoctors || [];
  const selectedDoctorsCount = selectedDoctors.length;
  
  // Compact 6-doctor preview
  const previewDoctors = selectedDoctors.slice(0, 6);
  const remainingCount = Math.max(0, selectedDoctorsCount - 6);

  const isPending = plan.status === "PENDING";
  const isApproved = plan.status === "APPROVED";
  const isRejected = plan.status === "REJECTED";

  const handleConfirmReject = () => {
    setIsSubmitting(true);
    onReject(plan.id, rejectFeedback.trim() || undefined);
    setRejectDialogOpen(false);
    setIsSubmitting(false);
  };

  const startDateFormatted = plan.startDate ? format(new Date(plan.startDate), "MMM d, yyyy") : "N/A";
  const endDateFormatted = plan.endDate ? format(new Date(plan.endDate), "MMM d, yyyy") : "N/A";

  return (
    <>
      <div
        className={`border-slate-200 flex flex-col justify-between gap-4 rounded-xl border bg-white p-4 transition-all shadow-none hover:border-slate-300 ${
          isApproved ? "opacity-95 bg-slate-50/40" : isRejected ? "opacity-90 bg-slate-50/60" : ""
        }`}
      >
        <div className="flex flex-col gap-3">
          {/* Header Row: Rep Avatar + Plan Title + Badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-white text-xs font-semibold ${
                  isApproved ? "bg-emerald-600" : isRejected ? "bg-slate-500" : "gradient-green"
                }`}
              >
                {getInitials(repName)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 leading-snug truncate">
                    {plan.title || "Untitled Visit Plan"}
                  </h3>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium text-white ${
                      planTypeConfig[plan.planType]?.className || "bg-slate-600"
                    }`}
                  >
                    {planTypeConfig[plan.planType]?.label || plan.planType}
                  </span>

                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-medium text-white ${
                      statusConfig[plan.status]?.className || "bg-slate-600"
                    }`}
                  >
                    {statusConfig[plan.status]?.label || plan.status}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>Rep: <strong>{repName}</strong></span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{startDateFormatted} – {endDateFormatted}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for Pending Plans */}
            {isPending && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => onApprove(plan.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 h-8 cursor-pointer gap-1.5 px-3 text-xs font-medium text-white shadow-2xs transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  <CheckCircle size={14} />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-8 cursor-pointer gap-1.5 px-3 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
                >
                  <XCircle size={14} />
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Description & Objectives */}
          {plan.description && (
            <p className="text-xs text-slate-600 line-clamp-2 pl-0.5">
              {plan.description}
            </p>
          )}

          {plan.objectives && plan.objectives.length > 0 && (
            <div className="text-xs text-slate-600 pl-0.5">
              <span className="font-medium text-slate-700">Objectives: </span>
              <span>{plan.objectives.join(" · ")}</span>
            </div>
          )}

          {/* Compact Metadata Strip (Section 5) */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100 text-xs text-slate-700">
            <div>
              <span className="text-slate-500">Target Doctors: </span>
              <span className="font-semibold text-slate-900">{plan.targetDoctors || 0}</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">Target Visits: </span>
              <span className="font-semibold text-slate-900">{plan.targetVisits || 0}</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500">Selected Doctors: </span>
              <span className="font-semibold text-slate-900">{selectedDoctorsCount}</span>
            </div>
          </div>

          {/* Progress Bar (if available) */}
          {plan.progress !== undefined && (
            <div className="mt-0.5">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Execution Progress</span>
                <span className="font-medium text-slate-700">{plan.progress}%</span>
              </div>
              <Progress value={plan.progress} className="h-1.5 bg-slate-100" />
            </div>
          )}

          {/* Selected Doctors Progressive Disclosure (Section 3) */}
          {selectedDoctorsCount > 0 && (
            <div className="mt-1 border-t border-slate-200/80 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Selected Doctors ({selectedDoctorsCount})
                </span>

                {selectedDoctorsCount > 6 && (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded-md px-2 py-1 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60"
                  >
                    {isExpanded ? (
                      <>
                        <span>Show compact preview</span>
                        <ChevronUp size={13} className="text-blue-600 shrink-0" />
                      </>
                    ) : (
                      <>
                        <span>View all {selectedDoctorsCount} doctors (+{remainingCount} more)</span>
                        <ChevronDown size={13} className="text-blue-600 shrink-0" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Collapsed State: Compact Preview Grid (4-6 items) */}
              {!isExpanded ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {previewDoctors.map((doc, idx) => (
                    <div
                      key={`${doc.id}-${idx}`}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs min-w-0"
                    >
                      <Stethoscope size={13} className="text-emerald-600 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-medium text-slate-900 truncate block">
                          {doc.nameEN || doc.nameAR || "Doctor"}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {doc.accountName || doc.specialty || "Unassigned"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Expanded State: Full Doctor Groups by Day */
                <div className="max-h-95 space-y-3 overflow-y-auto pr-1">
                  {doctorGroups.map((group) => (
                    <div key={`${plan.id}-${group.day}`}>
                      <p className="mb-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        {group.day === "No Date"
                          ? "No Date Assigned"
                          : format(new Date(group.day), "EEEE, MMM d, yyyy")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.doctors.map((doctor) => (
                          <div
                            key={`${group.day}-${doctor.id}`}
                            className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/50 px-2.5 py-1.5 text-xs min-w-0"
                          >
                            <Stethoscope size={13} className="text-emerald-600 shrink-0" />
                            <div className="min-w-0 flex-1 truncate">
                              <span className="font-medium text-slate-900 truncate block">
                                {doctor.nameEN || doctor.nameAR}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate block">
                                {doctor.accountName || "Unassigned hospital"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Confirmation Dialog (Section 8) */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-red-700">Confirm Plan Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this visit plan submitted by <strong>{repName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Rejection Reason / Feedback (Optional):
            </label>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the medical rep..."
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none min-h-20"
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isSubmitting}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReject}
              disabled={isSubmitting}
              className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
