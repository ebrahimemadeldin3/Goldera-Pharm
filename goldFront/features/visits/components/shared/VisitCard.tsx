"use client";

import { useState } from "react";
import { CircleCheckBig, Clock3, MapPin, UserRound, ChevronDown, ChevronUp, Tag, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Visit } from "@/features/visits/lib/types/ui";
import { VISIT_STATUS_COLORS } from "@/features/visits/lib/constants";
import { format } from "date-fns";
import Link from "next/link";

type VisitCardProps = {
  visit: Visit;
  reportBasePath?: string;
};

export default function VisitCard({ visit, reportBasePath }: VisitCardProps) {
  const [showTechDetails, setShowTechDetails] = useState(false);

  const s = VISIT_STATUS_COLORS[visit.status] || {
    badge: "bg-slate-500",
    bg: "bg-slate-50",
  };

  const createdAtLabel = visit.createdAt
    ? format(new Date(visit.createdAt), "MMM d, yyyy h:mm a")
    : "-";
  const updatedAtLabel = visit.updatedAt
    ? format(new Date(visit.updatedAt), "MMM d, yyyy h:mm a")
    : "-";
  const visitDateLabel = visit.date ? format(visit.date, "MMM d, yyyy") : "-";

  const isCompleted = visit.status === "COMPLETED";

  return (
    <Card className="border-secondary-light flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-none transition-shadow hover:shadow-2xs">
      {/* Top Header Row: Avatar + Doctor Name + Status + Primary Action */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#1E3A8A] text-white">
            <UserRound size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 leading-snug truncate">
                {visit.person || "Unnamed Doctor"}
              </h3>

              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium text-white ${s.badge}`}
              >
                {visit.badge ||
                  (isCompleted ? "Completed" : visit.status.replace("_", " "))}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1 truncate">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{visit.place || "Unassigned location"}</span>
              </span>

              <span className="flex items-center gap-1">
                <Clock3 size={13} className="text-slate-400 shrink-0" />
                <span>{visit.timeLabel}</span>
                {visit.duration && <span className="text-slate-400">({visit.duration})</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button (Complete Visit) */}
        {reportBasePath && !isCompleted && (
          <Link
            href={`${reportBasePath}?visitId=${visit.id}`}
            className="bg-emerald-600 hover:bg-emerald-700 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-white transition-colors shadow-2xs"
          >
            <CircleCheckBig size={14} />
            <span>Complete Visit</span>
          </Link>
        )}
      </div>

      {/* Metadata Strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Tag size={13} className="text-slate-400" />
          <span>Type: <strong className="text-slate-800 font-medium">{visit.visitType || "Routine Visit"}</strong></span>
        </div>
        <div className="h-3 w-px bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <User size={13} className="text-slate-400" />
          <span>Rep: <strong className="text-slate-800 font-medium">{visit.createdBy || "Assigned Rep"}</strong></span>
        </div>
        {visit.samples && visit.samples.length > 0 && (
          <>
            <div className="h-3 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span>Samples: <strong className="text-emerald-700 font-medium">{visit.samples.join(", ")}</strong></span>
            </div>
          </>
        )}
      </div>

      {/* Visit Notes (if present) */}
      {visit.notes && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-slate-700">
          <span className="font-semibold text-emerald-900 block mb-0.5">Notes</span>
          <p className="text-slate-700 whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      {/* Collapsible Technical Details (Section 2 - Technical noise hidden by default) */}
      <div className="pt-1">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          {showTechDetails ? (
            <>
              <span>Hide Technical Details</span>
              <ChevronUp size={13} />
            </>
          ) : (
            <>
              <span>Show Technical Details</span>
              <ChevronDown size={13} />
            </>
          )}
        </button>

        {showTechDetails && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-slate-200 bg-slate-100/60 p-2.5 text-[11px] text-slate-600 font-mono">
            <div><span className="text-slate-400 font-sans">Visit ID:</span> {visit.id}</div>
            <div><span className="text-slate-400 font-sans">Doctor ID:</span> {visit.doctorId}</div>
            <div><span className="text-slate-400 font-sans">Creator ID:</span> {visit.createdById}</div>
            <div><span className="text-slate-400 font-sans">Date:</span> {visitDateLabel}</div>
            <div><span className="text-slate-400 font-sans">Created At:</span> {createdAtLabel}</div>
            <div><span className="text-slate-400 font-sans">Updated At:</span> {updatedAtLabel}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
