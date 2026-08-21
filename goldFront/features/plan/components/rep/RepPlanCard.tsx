"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { planTypeConfig, statusConfig } from "../../lib/constants";
import { VisitPlan } from "@/features/plan/api/get";
import { groupSelectedDoctorsByDay } from "../../lib/utils";

type PlanCardProps = {
  plan: VisitPlan;
};

export default function RepPlanCard({ plan }: PlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const doctorGroups = groupSelectedDoctorsByDay(plan.selectedDoctors);
  const selectedDoctors = plan.selectedDoctors || [];
  const selectedDoctorsCount = selectedDoctors.length;

  // Compact 6-doctor preview
  const previewDoctors = selectedDoctors.slice(0, 6);
  const remainingCount = Math.max(0, selectedDoctorsCount - 6);

  const isApproved = plan.status === "APPROVED";
  const isRejected = plan.status === "REJECTED";

  const startDateFormatted = plan.startDate ? format(new Date(plan.startDate), "MMM d, yyyy") : "N/A";
  const endDateFormatted = plan.endDate ? format(new Date(plan.endDate), "MMM d, yyyy") : "N/A";
  const submittedDateFormatted = plan.submittedDate ? format(new Date(plan.submittedDate), "MMM d, yyyy") : "N/A";

  return (
    <div
      className={`border-secondary-light flex flex-col justify-between gap-3.5 rounded-xl border-[0.8px] bg-white p-4 transition-all shadow-2xs ${
        isApproved ? "bg-slate-50/40 opacity-95" : isRejected ? "bg-slate-50/60 border-slate-200 opacity-90" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          <div className="gradient-green flex size-10 shrink-0 items-center justify-center rounded-full text-white">
            <Calendar size={20} />
          </div>

          <div className="flex-1 min-w-0">
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

            <p className="mt-1 text-xs text-slate-600">
              Period: <span className="font-medium text-slate-800">{startDateFormatted} – {endDateFormatted}</span>
              <span className="mx-2 text-slate-300">·</span>
              Submitted: <span className="text-slate-700">{submittedDateFormatted}</span>
            </p>
          </div>
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
            <span className="text-slate-500">Target Visits: </span>
            <span className="font-semibold text-slate-900">{plan.targetVisits ?? 0}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500">Selected Doctors: </span>
            <span className="font-semibold text-slate-900">{selectedDoctorsCount}</span>
          </div>
        </div>

        {/* Selected Doctors Progressive Disclosure (Section 3) */}
        {selectedDoctorsCount > 0 && (
          <div className="mt-1 border-t border-slate-100 pt-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-700">
                Selected Doctors ({selectedDoctorsCount})
              </span>

              {selectedDoctorsCount > 6 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Show compact preview</span>
                      <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      <span>View all {selectedDoctorsCount} doctors (+{remainingCount} more)</span>
                      <ChevronDown size={14} />
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

        {/* Supervisor Feedback */}
        {plan.supervisorFeedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-slate-700">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-emerald-800">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Supervisor Feedback:</span>
            </div>
            <p className="text-slate-700 pl-5">
              {plan.supervisorFeedback.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
