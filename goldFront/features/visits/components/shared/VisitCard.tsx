"use client";

import { useState, type CSSProperties } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  Clock3,
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

import { useRoleUI } from "@/core/ui/role-ui-context";

type VisitCardProps = {
  visit: Visit;
  reportBasePath?: string;
  animationDelay?: string;
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

export default function VisitCard({
  visit,
  reportBasePath,
  animationDelay = "0ms",
}: VisitCardProps) {
  const { role } = useRoleUI();
  const isRep = role === "MEDICAL_REP";
  const [showTechDetails, setShowTechDetails] = useState(false);

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

  return (
    <Card
      className={cn(
        "visits-record-card visits-row-enter group/visit flex flex-col gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none focus-within:outline-none",
        isRep
          ? "focus-within:ring-2 focus-within:ring-[#168557]/25"
          : "focus-within:ring-2 focus-within:ring-[#C9A44C]/25"
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
                : "border-[#E9DDB8] bg-[#FFF8E5] text-[#8A6515]"
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
                <span className="truncate">
                  {visit.place || "Unassigned location"}
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

      <dl className="grid gap-3 rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-3 text-xs sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
            <Tag className="size-3.5 shrink-0" aria-hidden="true" />
            Type
          </dt>
          <dd className="mt-1 truncate font-semibold text-[#182033]">
            {visit.visitType || "Routine Visit"}
          </dd>
        </div>

        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 font-semibold text-[#8A94A6]">
            <User className="size-3.5 shrink-0" aria-hidden="true" />
            Rep
          </dt>
          <dd className="mt-1 truncate font-semibold text-[#182033]">
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
            "inline-flex items-center gap-1.5 rounded-full px-1 text-[11px] font-semibold text-[#667085] transition-colors duration-[150ms] focus-visible:outline-none",
            isRep
              ? "hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/20"
              : "hover:text-[#8A6515] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/20"
          )}
        >
          {showTechDetails ? (
            <>
              <span>Hide Technical Details</span>
              <ChevronUp className="size-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Show Technical Details</span>
              <ChevronDown className="size-3.5" aria-hidden="true" />
            </>
          )}
        </button>

        {showTechDetails && (
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
        )}
      </div>
    </Card>
  );
}
