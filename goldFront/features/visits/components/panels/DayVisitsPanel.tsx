"use client";

import { useState } from "react";
import { format } from "date-fns";
import VisitCard from "../shared/VisitCard";
import { Calendar, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Visit } from "@/features/visits/lib/types/ui";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { cn } from "@/lib/utils";

type DayVisitsPanelProps = {
  date: Date;
  visits: Visit[];
  reportBasePath?: string;
  isSearching?: boolean;
};

export default function DayVisitsPanel({
  date,
  visits,
  reportBasePath,
  isSearching = false,
}: DayVisitsPanelProps) {
  const { role } = useRoleUI();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorApiResponse[]>([]);
  const [expanded, setExpanded] = useState(false);

  const addVisitPath =
    role === "MANAGER"
      ? "/manager/visits/add"
      : role === "SUPERVISOR"
        ? "/supervisor/visits/add"
        : "/rep/visits/add";

  const handleOpenSchedule = async () => {
    if (doctorsList.length === 0) {
      const doctorsRes = await getDoctorsAction(
        undefined,
        undefined,
        undefined,
        false,
      );
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleDialogOpen(true);
  };

  // Progressive Disclosure: Max 2 visits by default unless searching or expanded
  const INITIAL_LIMIT = 2;
  const visibleVisits =
    isSearching || expanded ? visits : visits.slice(0, INITIAL_LIMIT);
  const remainingCount = visits.length - INITIAL_LIMIT;

  return (
    <>
      {visits.length === 0 ? (
        <div className="visits-empty-state flex min-h-[238px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#DDE3EE] bg-[#FBFCFE] px-5 py-8 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              role === "MEDICAL_REP"
                ? "bg-gp-rep-primary-soft text-gp-rep-primary"
                : "bg-[#FFF8E5] text-[#B18732]"
            )}
          >
            <Calendar className="size-5" aria-hidden="true" />
          </span>
          <h4 className="mt-4 text-base font-semibold text-[#182033]">
            No visits scheduled for {format(date, "MMM d, yyyy")}
          </h4>
          <p className="mt-2 max-w-[360px] text-sm leading-6 font-medium text-[#667085]">
            You can schedule a medical visit for this day.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenSchedule}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold shadow-none transition-[background-color,border-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px focus-visible:outline-none cursor-pointer",
                role === "MEDICAL_REP"
                  ? "bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                  : "border border-[#C9A44C] bg-white text-[#8A6515] hover:bg-[#FFF8E5] hover:text-[#182033]"
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              Schedule Visit
            </button>
            <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
              Schedule Visit Page
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {visibleVisits.map((v, index) => (
              <VisitCard
                key={v.id}
                visit={v}
                reportBasePath={reportBasePath}
                animationDelay={`${Math.min(index * 24, 120)}ms`}
              />
            ))}
          </div>

          {!isSearching && visits.length > INITIAL_LIMIT && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-white px-4 text-xs font-semibold text-[#344054] shadow-none transition-[background-color,border-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  role === "MEDICAL_REP"
                    ? "hover:border-gp-rep-primary-border hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary focus-visible:ring-2 focus-visible:ring-gp-rep-primary/20"
                    : "hover:border-[#E9DDB8] hover:bg-[#FFF8E5] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                )}
              >
                {expanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>
                      Show {remainingCount} more{" "}
                      {remainingCount === 1 ? "visit" : "visits"}
                    </span>
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Schedule Visit Modal Overlay with date preselected */}
      {scheduleDialogOpen && (
        <AddVisitDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          role={role as "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"}
          doctors={doctorsList}
          initialDate={date}
        />
      )}
    </>
  );
}
