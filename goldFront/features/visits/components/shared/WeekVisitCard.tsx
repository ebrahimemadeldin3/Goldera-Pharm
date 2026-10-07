"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Clock,
  Building2,
  UserRound,
  FileText,
  ChevronDown,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Visit } from "@/features/visits/lib/types/ui";
import { VISIT_STATUS_LABELS } from "@/features/visits/lib/constants";
import type { VisitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  getVisitCompletionLocationMapUrl,
  normalizeVisitCompletionLocation,
} from "@/features/visits/lib/utils/completion-location";

type WeekVisitCardProps = {
  visit: Visit;
  reportBasePath?: string;
  managerTheme?: boolean;
  isRep?: boolean;
  animationDelay?: string;
};

const statusAccentStyles: Record<VisitStatus, string> = {
  COMPLETED: "before:bg-[#20A66A]",
  IN_PROGRESS: "before:bg-[#3972D5]",
  SCHEDULED: "before:bg-[#C9A44C]",
  CANCELLED: "before:bg-[#D92D20]",
};

const statusBadgeStyles: Record<VisitStatus, string> = {
  COMPLETED: "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]",
  IN_PROGRESS: "border-[#D7E5FF] bg-[#EDF4FF] text-[#3972D5]",
  SCHEDULED: "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]",
  CANCELLED: "border-[#FADBD7] bg-[#FEF3F2] text-[#B42318]",
};

function formatScheduledTime(timeLabel: string | undefined): string | null {
  if (!timeLabel) return null;

  const [hours, minutes] = timeLabel.split(":").map(Number);
  if (
    Number.isFinite(hours) &&
    Number.isFinite(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  ) {
    return format(new Date(2000, 0, 1, hours, minutes), "h:mm a");
  }

  return timeLabel;
}

export default function WeekVisitCard({
  visit,
  reportBasePath,
  managerTheme = false,
  isRep = false,
  animationDelay = "0ms",
}: WeekVisitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isCompleted = visit.status === "COMPLETED";
  const isCancelled = visit.status === "CANCELLED";
  const statusLabel =
    visit.badge || VISIT_STATUS_LABELS[visit.status] || visit.status;

  const doctorName =
    visit.person || visit.doctor?.nameAR || visit.doctor?.nameEN || "Doctor";
  const facilityLabel =
    visit.facility || visit.place || visit.doctor?.accountName || null;
  const specialtyLabel = visit.doctor?.specialty || null;
  const assignedRepName =
    visit.medicalRepName || (isRep ? visit.createdBy : undefined);
  const timeDisplay = formatScheduledTime(visit.timeLabel);

  const completionLocation = normalizeVisitCompletionLocation(
    visit.completionLocation,
  );
  const completionLocationMapUrl =
    getVisitCompletionLocationMapUrl(completionLocation);

  const hasDetails = Boolean(
    visit.notes || visit.samples?.length || completionLocationMapUrl,
  );

  return (
    <article
      style={{ animationDelay }}
      className={cn(
        "visits-row-enter relative flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-[#E5E8EF] bg-white pl-1 transition-[border-color,box-shadow] duration-150",
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
        statusAccentStyles[visit.status] || "before:bg-[#98A2B3]",
        managerTheme
          ? "hover:border-[#E9DDB8] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]"
          : "hover:border-[#CBEFDD] hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 pt-3 pb-2.5">
        {/* Doctor + status */}
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h4
            className="min-w-0 truncate text-sm leading-5 font-semibold text-[#101D36]"
            dir="auto"
            title={doctorName}
          >
            {doctorName}
          </h4>
          <span
            className={cn(
              "inline-flex h-5 shrink-0 items-center rounded-full border px-2 text-[10px] font-bold whitespace-nowrap",
              statusBadgeStyles[visit.status] ||
                "border-[#E5E8EF] bg-[#F4F6FA] text-[#475467]",
            )}
          >
            {statusLabel}
          </span>
        </div>

        {/* Facility */}
        {facilityLabel && (
          <p className="-mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#667085]">
            <Building2
              className="size-3.5 shrink-0 text-[#98A2B3]"
              aria-hidden="true"
            />
            <span className="truncate" dir="auto" title={facilityLabel}>
              {facilityLabel}
            </span>
          </p>
        )}

        {/* Meta */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#475467]">
          {timeDisplay && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F4F6FA] px-1.5 py-0.5 tabular-nums">
              <Clock className="size-3 text-[#667085]" aria-hidden="true" />
              {timeDisplay}
            </span>
          )}
          {visit.visitType && (
            <span className="rounded-md bg-[#F4F6FA] px-1.5 py-0.5 capitalize">
              {visit.visitType.toLowerCase()}
            </span>
          )}
          {specialtyLabel && (
            <span className="max-w-full truncate rounded-md bg-[#F4F6FA] px-1.5 py-0.5 text-[#667085]">
              {specialtyLabel}
            </span>
          )}
          {managerTheme && assignedRepName && (
            <span
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#F4F6FA] px-1.5 py-0.5"
              title={`Rep: ${assignedRepName}`}
            >
              <UserRound
                className="size-3 shrink-0 text-[#667085]"
                aria-hidden="true"
              />
              <span className="truncate" dir="auto">
                {assignedRepName}
              </span>
            </span>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && hasDetails && (
          <div className="space-y-2 rounded-[8px] border border-[#EEF2F6] bg-[#F8FAFC] p-2.5 text-xs">
            {visit.notes && (
              <div>
                <p className="font-semibold text-[#344054]">Notes</p>
                <p
                  className="mt-0.5 break-words text-[#667085]"
                  dir="auto"
                >
                  {visit.notes}
                </p>
              </div>
            )}
            {visit.samples && visit.samples.length > 0 && (
              <div>
                <p className="font-semibold text-[#344054]">Products</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {visit.samples.map((s, idx) => (
                    <span
                      key={`${s}-${idx}`}
                      className="rounded border border-[#E5E8EF] bg-white px-1.5 py-0.5 text-[10px] text-[#475467]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {completionLocationMapUrl && (
              <a
                href={completionLocationMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#168557] hover:underline"
              >
                <MapPin className="size-3" />
                Completion location
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 border-t border-[#F2F4F7] px-3 py-2">
        {hasDetails ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#667085] transition-colors hover:text-[#182033]"
          >
            {isExpanded ? "Hide details" : "Details"}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-150",
                isExpanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="text-[11px] text-[#98A2B3]">No notes</span>
        )}

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#168557]">
            <CheckCircle2 className="size-3.5" />
            Reported
          </span>
        ) : isCancelled ? null : reportBasePath ? (
          <Link
            href={`${reportBasePath}?visitId=${visit.id}`}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1 rounded-[7px] px-2.5 text-[11px] font-bold text-white transition-colors",
              managerTheme
                ? "bg-[#101D36] hover:bg-[#1D2B4A]"
                : "bg-[#168557] hover:bg-[#107349]",
            )}
          >
            <FileText className="size-3" />
            Submit report
          </Link>
        ) : null}
      </div>
    </article>
  );
}
