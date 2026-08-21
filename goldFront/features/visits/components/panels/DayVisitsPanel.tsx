"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import VisitCard from "../shared/VisitCard";
import { Calendar, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Visit } from "@/features/visits/lib/types/ui";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";

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
      const doctorsRes = await getDoctorsAction(undefined, undefined, undefined, false);
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleDialogOpen(true);
  };

  // Progressive Disclosure: Max 2 visits by default unless searching or expanded
  const INITIAL_LIMIT = 2;
  const visibleVisits = isSearching || expanded ? visits : visits.slice(0, INITIAL_LIMIT);
  const remainingCount = visits.length - INITIAL_LIMIT;

  return (
    <>
      <Card className="overflow-hidden border-none bg-transparent p-0 shadow-none space-y-3">
        {/* Lightweight Day Section Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-800">
            <Calendar size={15} className="text-slate-500 shrink-0" />
            <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {visits.length} {visits.length === 1 ? "visit" : "visits"}
            </span>
          </div>
        </div>

        {/* Visits Grid / Contextual Empty State */}
        <div>
          {visits.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <Calendar className="text-slate-300" size={36} />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  No visits scheduled for {format(date, "MMM d, yyyy")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can schedule a new medical visit for this day using the form.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleOpenSchedule}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  Schedule Visit for this Day
                </button>
                <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
                  Schedule Visit Page
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 2-Column Responsive Visit Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                {visibleVisits.map((v) => (
                  <VisitCard key={v.id} visit={v} reportBasePath={reportBasePath} />
                ))}
              </div>

              {/* Progressive Disclosure Toggle Button (Show N More / Show Less) */}
              {!isSearching && visits.length > INITIAL_LIMIT && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    {expanded ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        <span>Show {remainingCount} more {remainingCount === 1 ? "visit" : "visits"}</span>
                        <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

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
