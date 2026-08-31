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

  // Compact 3-doctor preview for half-width cards
  const previewDoctors = selectedDoctors.slice(0, 3);
  const remainingCount = Math.max(0, selectedDoctorsCount - 3);

  const startDateFormatted = plan.startDate ? format(new Date(plan.startDate), "MMM d, yyyy") : "N/A";
  const endDateFormatted = plan.endDate ? format(new Date(plan.endDate), "MMM d, yyyy") : "N/A";

  const statusBadgeStyles: Record<string, string> = {
    PENDING: "bg-[#FFF8E5] text-[#B18732] border-[#E9DDB8]",
    APPROVED: "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]",
    REJECTED: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
  };

  return (
    <div className="flex flex-col justify-between gap-3.5 rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 shadow-none transition-all hover:border-[#CBEFDD] hover:shadow-[0_4px_14px_rgba(16,27,51,0.04)]">
      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#E9F8F1] border border-[#CBEFDD] text-[#168557]">
            <Calendar size={16} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-base font-bold text-[#182033] leading-snug truncate">
                {plan.title || "Untitled Visit Plan"}
              </h3>

              <span className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#3972D5]">
                {planTypeConfig[plan.planType]?.label || plan.planType}
              </span>

              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                  statusBadgeStyles[plan.status] || "bg-[#F6F8FB] text-[#344054] border-[#E5E8EF]"
                }`}
              >
                {statusConfig[plan.status]?.label || plan.status}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#667085]">
              Period: <span className="font-semibold text-[#182033]">{startDateFormatted} – {endDateFormatted}</span>
            </p>
          </div>
        </div>

        {/* 3-Column Compact Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 bg-[#FBFCFE] p-2.5 rounded-[10px] border border-[#EEF1F6] text-xs">
          <div className="space-y-0.5">
            <span className="text-[#667085] text-[10px] font-medium block">Target Visits</span>
            <span className="font-bold text-sm text-[#182033]">{plan.targetVisits ?? 0}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[#667085] text-[10px] font-medium block">Selected Doctors</span>
            <span className="font-bold text-sm text-[#182033]">{selectedDoctorsCount}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[#667085] text-[10px] font-medium block">Coverage</span>
            <span className="font-bold text-sm text-[#168557]">
              {plan.targetVisits && selectedDoctorsCount
                ? `${Math.round((selectedDoctorsCount / plan.targetVisits) * 100)}%`
                : "100%"}
            </span>
          </div>
        </div>

        {/* Selected Doctors Progressive Disclosure */}
        {selectedDoctorsCount > 0 && (
          <div className="mt-1 border-t border-[#EEF1F6] pt-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#182033]">
                Selected Doctors ({selectedDoctorsCount})
              </span>

              {selectedDoctorsCount > 3 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#168557] hover:text-[#107349] transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Show compact</span>
                      <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      <span>View all (+{remainingCount} more)</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Collapsed State: Compact Preview List */}
            {!isExpanded ? (
              <div className="space-y-1.5">
                {previewDoctors.map((doc, idx) => (
                  <div
                    key={`${doc.id}-${idx}`}
                    className="flex items-center gap-2 rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] px-2.5 py-1.5 text-xs min-w-0"
                  >
                    <Stethoscope size={13} className="text-[#168557] shrink-0" />
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <span className="font-bold text-[#182033] truncate">
                        {doc.nameEN || doc.nameAR || "Doctor"}
                      </span>
                      <span className="text-[11px] text-[#667085] truncate shrink-0 ml-2">
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
                    <p className="mb-1.5 text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                      {group.day === "No Date"
                        ? "No Date Assigned"
                        : format(new Date(group.day), "EEEE, MMM d, yyyy")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.doctors.map((doctor) => (
                        <div
                          key={`${group.day}-${doctor.id}`}
                          className="flex items-center gap-2.5 rounded-[9px] border border-[#CBEFDD] bg-[#E9F8F1]/50 px-2.5 py-2 text-xs min-w-0"
                        >
                          <Stethoscope size={14} className="text-[#168557] shrink-0" />
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-semibold text-[#182033] truncate block">
                              {doctor.nameEN || doctor.nameAR}
                            </span>
                            <span className="text-[11px] text-[#667085] truncate block">
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
          <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1] p-3 text-xs text-[#182033]">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-[#168557]">
              <CheckCircle2 size={15} className="text-[#168557]" />
              <span>Supervisor Feedback:</span>
            </div>
            <p className="text-[#344054] pl-5">
              {plan.supervisorFeedback.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
