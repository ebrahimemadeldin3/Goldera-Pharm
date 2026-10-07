"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import VisitCard from "../shared/VisitCard";
import { Calendar, Plus } from "lucide-react";
import { Visit } from "@/features/visits/lib/types/ui";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getSchedulableDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";

type DayVisitsPanelProps = {
  date: Date;
  visits: Visit[];
  reportBasePath?: string;
  isSearching?: boolean;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  managerTheme?: boolean;
};

export default function DayVisitsPanel({
  date,
  visits,
  reportBasePath,
  isSearching = false,
  isFiltered = false,
  onClearFilters,
  managerTheme = false,
}: DayVisitsPanelProps) {
  const pathname = usePathname();
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const isManager =
    managerTheme || role === "MANAGER" || pathname?.startsWith("/manager");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isLoadingScheduleData, setIsLoadingScheduleData] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorApiResponse[]>([]);

  const addVisitPath =
    role === "MANAGER"
      ? "/manager/visits/add"
      : role === "SUPERVISOR"
        ? "/supervisor/visits/add"
        : "/rep/visits/add";

  const handleOpenSchedule = async () => {
    if (isLoadingScheduleData) return;

    if (doctorsList.length === 0) {
      setIsLoadingScheduleData(true);
      const doctorsRes = await getSchedulableDoctorsAction().finally(() => {
        setIsLoadingScheduleData(false);
      });

      if (!doctorsRes.success) {
        toast.error({
          title: "Couldn't load doctors",
          description:
            doctorsRes.error?.message ||
            "Doctors are required before scheduling a visit.",
        });
        return;
      }

      setDoctorsList(doctorsRes.data ?? []);
    }

    setScheduleDialogOpen(true);
  };

  const emptyTitle = isSearching
    ? "No visits match your search."
    : isFiltered
      ? "No visits match the current filters."
      : `No visits scheduled for ${format(date, "MMM d, yyyy")}`;
  const emptyDescription = isSearching
    ? "Try a different doctor, facility, rep, or visit type."
    : isFiltered
      ? "Clear filters to return to the full visit workspace."
      : "You can schedule a medical visit for this day.";

  return (
    <>
      {visits.length === 0 ? (
        <div className="visits-empty-state flex min-h-[238px] flex-col items-center justify-center rounded-[14px] border border-dashed border-[#DDE3EE] bg-[#FBFCFE] px-5 py-8 text-center">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-full",
              isRep
                ? "bg-gp-rep-primary-soft text-gp-rep-primary"
                : isManager
                  ? "border border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]"
                  : "bg-[#FFF8E5] text-[#B18732]",
            )}
          >
            <Calendar className="size-5" aria-hidden="true" />
          </span>
          <h4 className="mt-4 text-base font-semibold text-[#182033]">
            {emptyTitle}
          </h4>
          <p className="mt-2 max-w-[360px] text-sm leading-6 font-medium text-[#667085]">
            {emptyDescription}
          </p>
          {(isSearching || isFiltered) && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={cn(
                "mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-semibold transition-[background-color,border-color,color] duration-[170ms] focus-visible:outline-none",
                isRep
                  ? "border-[#CBEFDD] bg-white text-[#168557] hover:bg-[#E9F8F1] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
                  : "border-[#E9DDB8] bg-white text-[#101D36] hover:bg-[#FFF8E5] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20",
              )}
            >
              Clear Filters
            </button>
          ) : (
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenSchedule}
                disabled={isLoadingScheduleData}
                className={cn(
                  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold shadow-none transition-[background-color,border-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
                  isRep
                    ? "bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)]"
                    : isManager
                      ? "border border-[#E9DDB8] bg-white text-[#101D36] hover:border-[#C9A44C] hover:bg-[#FFFDF7] hover:text-[#101D36] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
                      : "border border-[#C9A44C] bg-white text-[#8A6515] hover:bg-[#FFF8E5] hover:text-[#182033]",
                )}
              >
                <Plus
                  className={cn("size-4", isManager && "text-[#C9A44C]")}
                  aria-hidden="true"
                />
                {isLoadingScheduleData ? "Loading..." : "Schedule Visit"}
              </button>
              <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
                Schedule Visit Page
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={cn(
              "grid grid-cols-1 gap-2.5",
              isManager ? "2xl:grid-cols-2" : "xl:grid-cols-2",
            )}
          >
            {visits.map((v, index) => (
              <VisitCard
                key={v.id}
                visit={v}
                reportBasePath={reportBasePath}
                animationDelay={`${Math.min(index * 24, 120)}ms`}
                managerTheme={isManager}
                density={isManager ? "compact" : "comfortable"}
              />
            ))}
          </div>
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
