import { Calendar, CircleCheckBig, CircleX } from "lucide-react";
import Link from "next/link";
import type { Visit } from "@/features/visits/lib/types/ui";
import {
  formatSaudiDateDisplay,
  getInitials,
  parseDateValue,
} from "@/lib/utils";

type TodayScheduleProps = {
  visits: Visit[];
};

type DashboardVisitLike = Partial<Visit> & {
  doctorId?: string;
  doctorName?: string;
  time?: string;
  visitType?: string;
  notes?: string | null;
  samples?: string[];
  status?: string;
  statusLabel?: string;
  person?: string;
  date?: string | Date;
};

export default function TodaySchedule({ visits }: TodayScheduleProps) {
  const safeVisits = Array.isArray(visits)
    ? (visits as DashboardVisitLike[])
    : [];

  const getVisitDateLabel = (dateValue: Visit["date"] | undefined) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    try {
      return formatSaudiDateDisplay(parseDateValue(dateValue));
    } catch {
      return "Date unavailable";
    }
  };

  return (
    <div className="border-secondary-light relative flex flex-col rounded-[14px] border-[0.8px] bg-white p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-gray-900">
            Today&apos;s Schedule
          </h2>
          <p className="text-secondary-dark mt-1 text-xs">
            All dates/times use{" "}
            <span className="font-bold text-black">Saudi Arabia</span> timezone
            (Asia/Riyadh).
          </p>
        </div>
        <Link
          href="/rep/visits/add"
          className="button-system-gradient-primary inline-flex h-8 items-center rounded-md px-3"
        >
          Add Visit
        </Link>
      </header>
      <div className="space-y-3">
        {safeVisits.length === 0 ? (
          <p className="text-secondary-text py-8 text-center text-sm">
            No visits scheduled for today
          </p>
        ) : (
          safeVisits.map((visit, index) => {
            const isCompleted = visit?.status === "COMPLETED";
            const displayName =
              visit?.person || visit?.doctor?.nameAR || visit?.doctor?.nameEN || visit?.doctorId || "Visit" + " - " + visit.doctor?.accountName || "";
            const initials = getInitials(displayName);
            const samples = Array.isArray(visit?.samples) ? visit.samples : [];
            const timeLabel =
              visit?.timeLabel || visit?.time || "Time unavailable";
            const statusLabel =
              visit?.statusLabel || visit?.status || "UNKNOWN";
            const visitId = visit?.id || `visit-${index}`;
            const visitDateLabel = getVisitDateLabel(visit?.date);
            const visitTypeLabel = visit?.visitType || "Routine";
            const notesLabel = visit?.notes || "No notes";

            return (
              <div
                key={visitId}
                className={`flex items-center gap-4 rounded-[14px] border-[0.8px] p-4 ${
                  isCompleted
                    ? "border-green-stroke bg-[#F0FDF4]"
                    : "border-[#E2E8F0] bg-[#FFFFFF]"
                }`}
              >
                <div
                  className={`mb-auto flex size-8 shrink-0 items-center justify-center rounded-full ${
                    isCompleted ? "bg-dashboard-green" : "bg-dashboard-blue"
                  } text-sm/6 font-normal text-white`}
                >
                  {displayName} 
                </div>
                <div className="flex-1">
                  <h3 className="text-sm/5 font-normal text-black">
                    {displayName}
                  </h3>
                  <p className="text-secondary-text text-xs/4 font-normal">
                    {samples.length > 0
                      ? samples.join(", ")
                      : `Doctor ID: ${visit?.doctorId || "N/A"}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar size={12} className="text-secondary-text" />
                    <span className="text-secondary-text text-xs/4">
                      {timeLabel}
                    </span>
                    <span className="text-secondary-text text-xs/4">
                      {visitDateLabel}
                    </span>
                    <span className="text-secondary-text text-xs/4">
                      {visitTypeLabel}
                    </span>
                    <span
                      className={`ml-2 rounded-lg px-2 py-0.5 text-xs/4 font-medium text-white ${
                        isCompleted ? "bg-dashboard-green" : "bg-dashboard-blue"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-secondary-text mt-2 text-xs/4 font-normal">
                    {notesLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <div className="bg-dashboard-green flex h-5.5 cursor-pointer items-center gap-1 rounded-md p-3 text-xs/4 font-medium text-white">
                      <CircleCheckBig size={16} />
                      Done
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/rep/visits/report?visitId=${visit.id}`}
                        className="button-system-gradient-primary flex h-8 items-center gap-1 rounded-md p-3"
                      >
                        <CircleCheckBig size={16} />
                        Complete
                      </Link>
                      <button className="text-dashboard-red border-dashboard-red flex h-8 w-9.5 cursor-pointer items-center justify-center rounded-md border-[0.8px] bg-white">
                        <CircleX size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
