"use client";

import { useState, type CSSProperties } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  ExternalLink,
  Info,
  MapPin,
  Tag,
  User,
  UserRound,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Visit } from "@/features/visits/lib/types/ui";
import { VISIT_STATUS_LABELS } from "@/features/visits/lib/constants";
import type { VisitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getVisitCompletionLocationMapUrl,
  normalizeVisitCompletionLocation,
} from "@/features/visits/lib/utils/completion-location";
import { CopyId } from "@/features/requests/components/manager/CopyId";

import { useRoleUI } from "@/core/ui/role-ui-context";

type VisitCardProps = {
  visit: Visit;
  reportBasePath?: string;
  animationDelay?: string;
  managerTheme?: boolean;
};

const statusBadgeStyles: Record<VisitStatus, string> = {
  COMPLETED: "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]",
  IN_PROGRESS: "border-[#D7E5FF] bg-[#EDF4FF] text-[#3972D5]",
  SCHEDULED: "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]",
  CANCELLED: "border-[#FADBD7] bg-[#FEF3F2] text-[#B42318]",
};

const statusDotStyles: Record<VisitStatus, string> = {
  COMPLETED: "bg-[#20A66A]",
  IN_PROGRESS: "bg-[#3972D5]",
  SCHEDULED: "bg-[#C9A44C]",
  CANCELLED: "bg-[#D92D20]",
};

function formatCoordinate(value: number) {
  return value.toFixed(4);
}

function formatAccuracy(accuracy: number | null) {
  if (accuracy === null) {
    return "Unavailable";
  }

  const rounded =
    accuracy >= 10 ? Math.round(accuracy) : Number(accuracy.toFixed(1));
  return `+/-${rounded} meters`;
}

function formatCapturedAt(capturedAt: string | null) {
  if (!capturedAt) {
    return "Unavailable";
  }

  return format(new Date(capturedAt), "MMM d, h:mm a");
}

function formatScheduledTime(timeLabel: string | undefined) {
  if (!timeLabel) {
    return "-";
  }

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

function compactId(value: string) {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export default function VisitCard({
  visit,
  reportBasePath,
  animationDelay = "0ms",
  managerTheme = false,
}: VisitCardProps) {
  const pathname = usePathname();
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const isManager =
    managerTheme || role === "MANAGER" || pathname?.startsWith("/manager");
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  const createdAtLabel = visit.createdAt
    ? format(new Date(visit.createdAt), "MMM d, yyyy h:mm a")
    : "-";
  const updatedAtLabel = visit.updatedAt
    ? format(new Date(visit.updatedAt), "MMM d, yyyy h:mm a")
    : "-";
  const visitDateLabel = visit.date ? format(visit.date, "MMM d, yyyy") : "-";

  const isCompleted = visit.status === "COMPLETED";
  const statusLabel =
    visit.badge || VISIT_STATUS_LABELS[visit.status] || visit.status;
  const completionLocation = normalizeVisitCompletionLocation(
    visit.completionLocation,
  );
  const completionLocationMapUrl =
    getVisitCompletionLocationMapUrl(completionLocation);
  const plannedLocation = visit.place || "Unassigned location";
  const detailsLabel = isManager ? "Details" : "Technical Details";
  const hasAssignedLocation = Boolean(visit.place);
  const scheduledTimeLabel = formatScheduledTime(visit.timeLabel);

  return (
    <Card
      className={cn(
        "visits-record-card visits-row-enter group/visit flex flex-col gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 focus-within:outline-none",
        isManager ? "shadow-[0_1px_2px_rgba(16,24,40,0.04)]" : "shadow-none",
        isRep
          ? "focus-within:ring-2 focus-within:ring-[#168557]/25"
          : "focus-within:ring-2 focus-within:ring-[#C9A44C]/25",
      )}
      style={
        {
          "--visits-row-delay": animationDelay,
        } as CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
              isRep
                ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                : isManager
                  ? "border-[#E9DDB8] bg-[#FBF7EA] text-[#B18732]"
                  : "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]",
            )}
          >
            <UserRound className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h4 className="truncate text-base leading-snug font-semibold text-[#182033]">
                {visit.person || "Unnamed Doctor"}
              </h4>

              <span
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold",
                  statusBadgeStyles[visit.status],
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    statusDotStyles[visit.status],
                  )}
                  aria-hidden="true"
                />
                {statusLabel}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#667085]">
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-[#98A2B3]" />
                <span
                  className={cn(
                    "truncate",
                    isManager &&
                      (hasAssignedLocation
                        ? "text-[#344054]"
                        : "text-[#98A2B3]"),
                  )}
                  title={plannedLocation}
                >
                  {plannedLocation}
                </span>
              </span>

              {(visit.timeLabel || visit.duration) && (
                <span className="flex shrink-0 items-center gap-1.5">
                  <Clock3 className="size-3.5 shrink-0 text-[#98A2B3]" />
                  <span>{visit.timeLabel || "Scheduled"}</span>
                  {visit.duration && (
                    <span className="text-[#98A2B3]">({visit.duration})</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {reportBasePath && !isCompleted && (
          <Link
            href={`${reportBasePath}?visitId=${visit.id}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[9px] bg-[#168557] px-3 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(22,133,87,0.16)] transition-[background-color,transform,box-shadow] duration-[160ms] hover:-translate-y-px hover:bg-[#107349] focus-visible:ring-2 focus-visible:ring-[#20A66A]/25 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <CircleCheckBig className="size-4" aria-hidden="true" />
            <span>Complete Visit</span>
          </Link>
        )}
      </div>

      <dl
        className={cn(
          "grid gap-3 rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-3 text-xs sm:grid-cols-2",
          isManager && "sm:grid-cols-[minmax(130px,0.8fr)_minmax(0,1.2fr)]",
        )}
      >
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
            <Tag className="size-3.5 shrink-0" aria-hidden="true" />
            {isManager ? "Visit Type" : "Type"}
          </dt>
          <dd
            className={cn(
              "mt-1 font-semibold text-[#182033]",
              isManager ? "break-words" : "truncate",
            )}
          >
            {visit.visitType || "Routine Visit"}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
            <User className="size-3.5 shrink-0" aria-hidden="true" />
            {isManager ? "Medical Representative" : "Rep"}
          </dt>
          <dd
            className={cn(
              "mt-1 font-semibold text-[#182033]",
              isManager ? "leading-5 break-words" : "truncate",
            )}
            title={visit.createdBy || "Assigned Rep"}
          >
            {visit.createdBy || "Assigned Rep"}
          </dd>
        </div>

        {visit.samples && visit.samples.length > 0 && (
          <div className="min-w-0 sm:col-span-2">
            <dt className="font-semibold text-[#8A94A6]">Samples</dt>
            <dd className="mt-1 truncate font-semibold text-[#168557]">
              {visit.samples.join(", ")}
            </dd>
          </div>
        )}
      </dl>

      {visit.notes && (
        <div className="rounded-[12px] border border-[#CBEFDD] bg-[#F7FCFA] p-3 text-xs text-[#344054]">
          <span className="block font-semibold text-[#168557]">Notes</span>
          <p className="mt-1 leading-5 whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      <div className="pt-0.5">
        <button
          type="button"
          aria-expanded={showTechDetails}
          onClick={() => setShowTechDetails(!showTechDetails)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-1 text-[11px] font-semibold text-[#667085] transition-colors duration-[180ms] focus-visible:outline-none motion-reduce:transition-none",
            isRep
              ? "hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
              : "text-[#101D36] hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20",
          )}
        >
          <span>
            {showTechDetails ? "Hide" : "Show"} {detailsLabel}
          </span>
          {isManager ? (
            <ChevronDown
              className={cn(
                "size-3.5 text-[#B18732] transition-transform duration-200 motion-reduce:transition-none",
                showTechDetails && "rotate-180",
              )}
              aria-hidden="true"
            />
          ) : showTechDetails ? (
            <ChevronUp className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          )}
        </button>

        {showTechDetails &&
          (isManager ? (
            <div className="mt-3 space-y-3">
              <section className="rounded-[12px] border border-[#E5E8EF] bg-white p-3 text-xs text-[#344054]">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#EEF1F6] pb-2">
                  <h5 className="text-[11px] font-bold tracking-[0.08em] text-[#101D36] uppercase">
                    Visit Information
                  </h5>
                  <span className="rounded-full border border-[#E9DDB8] bg-[#FFFDF7] px-2 py-0.5 text-[10px] font-bold text-[#8A6515]">
                    {statusLabel}
                  </span>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
                      <CalendarDays className="size-3.5 text-[#B18732]" />
                      Visit Date
                    </dt>
                    <dd className="mt-1 font-semibold text-[#182033]">
                      {visitDateLabel}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
                      <Clock3 className="size-3.5 text-[#B18732]" />
                      Scheduled Time
                    </dt>
                    <dd className="mt-1 font-semibold text-[#182033]">
                      {scheduledTimeLabel}
                    </dd>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
                      <User className="size-3.5 text-[#B18732]" />
                      Medical Representative
                    </dt>
                    <dd
                      className="mt-1 font-semibold break-words text-[#182033]"
                      title={visit.createdBy || "Assigned Rep"}
                    >
                      {visit.createdBy || "Assigned Rep"}
                    </dd>
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
                      <MapPin className="size-3.5 text-[#B18732]" />
                      Planned Location
                    </dt>
                    <dd
                      className={cn(
                        "mt-1 font-semibold break-words",
                        hasAssignedLocation
                          ? "text-[#182033]"
                          : "text-[#8A94A6]",
                      )}
                      title={plannedLocation}
                    >
                      {plannedLocation}
                    </dd>
                  </div>
                </dl>
              </section>

              {isCompleted && (
                <section className="rounded-[12px] border border-[#CBEFDD] bg-[#FCFFFD] p-3 text-xs text-[#344054]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 shrink-0 text-[#168557]" />
                        <h5 className="text-[11px] font-bold tracking-[0.08em] text-[#101D36] uppercase">
                          Actual Completion Location
                        </h5>
                      </div>
                      <p className="mt-1 font-medium text-[#667085]">
                        Visit completed position
                      </p>
                    </div>

                    {completionLocationMapUrl && (
                      <a
                        href={completionLocationMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-[#E9DDB8] bg-white px-2.5 text-[11px] font-bold text-[#8A6515] transition-colors duration-[180ms] hover:border-[#C9A44C] hover:bg-[#FFF8E5] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none"
                      >
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span>View on Map</span>
                      </a>
                    )}
                  </div>

                  {completionLocation ? (
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
                          <MapPin className="size-3.5 text-[#B18732]" />
                          Coordinates
                        </dt>
                        <dd className="mt-1 font-semibold break-words text-[#182033]">
                          {formatCoordinate(completionLocation.latitude)},{" "}
                          {formatCoordinate(completionLocation.longitude)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8A94A6]">
                          Accuracy
                        </dt>
                        <dd className="mt-1 font-semibold text-[#182033]">
                          {formatAccuracy(completionLocation.accuracy)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8A94A6]">
                          Completed
                        </dt>
                        <dd className="mt-1 font-semibold text-[#182033]">
                          {formatCapturedAt(completionLocation.capturedAt)}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="mt-3 rounded-[10px] border border-[#EEF1F6] bg-white p-3">
                      <p className="font-semibold text-[#182033]">
                        Actual Completion Location
                      </p>
                      <p className="mt-1 font-medium text-[#667085]">
                        Location data unavailable for this visit.
                      </p>
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE]">
                <button
                  type="button"
                  aria-expanded={showSystemInfo}
                  onClick={() => setShowSystemInfo(!showSystemInfo)}
                  className="flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-left text-xs font-semibold text-[#344054] transition-colors duration-[180ms] hover:bg-[#F4F6FA] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none motion-reduce:transition-none"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Info className="size-3.5 text-[#8A94A6]" />
                    Technical Information
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-[#8A94A6] transition-transform duration-200 motion-reduce:transition-none",
                      showSystemInfo && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {showSystemInfo && (
                  <div className="border-t border-[#EEF1F6] p-3">
                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                      <div className="min-w-0 sm:col-span-2">
                        <dt className="font-semibold text-[#8A94A6]">
                          Visit ID
                        </dt>
                        <dd className="mt-1">
                          <CopyId
                            value={visit.id}
                            displayValue={compactId(visit.id)}
                            ariaLabel="Copy visit ID"
                          />
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-semibold text-[#8A94A6]">
                          Doctor ID
                        </dt>
                        <dd className="mt-1">
                          <CopyId
                            value={visit.doctorId}
                            displayValue={compactId(visit.doctorId)}
                            ariaLabel="Copy doctor ID"
                          />
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-semibold text-[#8A94A6]">
                          Creator ID
                        </dt>
                        <dd className="mt-1">
                          <CopyId
                            value={visit.createdById}
                            displayValue={compactId(visit.createdById)}
                            ariaLabel="Copy creator ID"
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8A94A6]">
                          Created
                        </dt>
                        <dd className="mt-1 font-medium text-[#344054]">
                          {createdAtLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-[#8A94A6]">
                          Updated
                        </dt>
                        <dd className="mt-1 font-medium text-[#344054]">
                          {updatedAtLabel}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="visits-tech-details mt-2 grid grid-cols-1 gap-2 rounded-[12px] border border-[#E5E8EF] bg-[#F4F6FA] p-3 font-mono text-[11px] text-[#667085] sm:grid-cols-2">
              <div>
                <span className="font-sans text-[#8A94A6]">Visit ID:</span>{" "}
                {visit.id}
              </div>
              <div>
                <span className="font-sans text-[#8A94A6]">Doctor ID:</span>{" "}
                {visit.doctorId}
              </div>
              <div>
                <span className="font-sans text-[#8A94A6]">Creator ID:</span>{" "}
                {visit.createdById}
              </div>
              <div>
                <span className="font-sans text-[#8A94A6]">Date:</span>{" "}
                {visitDateLabel}
              </div>
              <div>
                <span className="font-sans text-[#8A94A6]">Created At:</span>{" "}
                {createdAtLabel}
              </div>
              <div>
                <span className="font-sans text-[#8A94A6]">Updated At:</span>{" "}
                {updatedAtLabel}
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
