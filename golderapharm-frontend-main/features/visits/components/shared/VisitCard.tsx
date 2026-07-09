"use client";

import { CircleCheckBig, Clock3, MapPin, UserRound } from "lucide-react";
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
  const s = VISIT_STATUS_COLORS[visit.status];
  const createdAtLabel = visit.createdAt
    ? format(new Date(visit.createdAt), "MMM d, yyyy h:mm a")
    : "-";
  const updatedAtLabel = visit.updatedAt
    ? format(new Date(visit.updatedAt), "MMM d, yyyy h:mm a")
    : "-";
  const visitDateLabel = visit.date ? format(visit.date, "MMM d, yyyy") : "-";

  return (
    <Card className="border-secondary-light gap-4 bg-white p-5 shadow-none">
      <div className="flex items-start justify-between">
        <div className="flex w-full items-start gap-3">
          <div className="bg-system-primary-light border-system-primary-stroke text-system-primary flex size-11 items-center justify-center rounded-[10px] border">
            <UserRound size={20} />
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="text-lg/[27px] font-semibold text-black">
                {visit.person}
              </div>
              <div
                className={`ml-auto rounded-full px-2 py-0.5 text-xs/4 font-semibold ${s.badge} text-white`}
              >
                {visit.badge ||
                  (visit.status === "COMPLETED"
                    ? "Completed"
                    : visit.status.replace("_", " "))}
              </div>
            </div>

            <div className="text-secondary-dark mt-1 flex flex-col items-start gap-1 text-sm/[21px] font-normal">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                {visit.place || "-"}
              </div>
              <div className="flex items-center gap-1">
                <Clock3 size={16} />
                {visit.timeLabel}
                <span className="ml-4">Duration: {visit.duration || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-secondary-light grid grid-cols-2 gap-3 rounded-lg border p-3 text-xs">
        <div>
          <span className="text-secondary-dark">Visit ID:</span> {visit.id}
        </div>
        <div>
          <span className="text-secondary-dark">Doctor ID:</span>{" "}
          {visit.doctorId}
        </div>
        <div>
          <span className="text-secondary-dark">Date:</span> {visitDateLabel}
        </div>
        <div>
          <span className="text-secondary-dark">Time:</span> {visit.timeLabel}
        </div>
        <div>
          <span className="text-secondary-dark">Visit Type:</span>{" "}
          {visit.visitType || "-"}
        </div>
        <div>
          <span className="text-secondary-dark">Status:</span>{" "}
          {visit.statusLabel}
        </div>
        <div>
          <span className="text-secondary-dark">Created By:</span>{" "}
          {visit.createdBy}
        </div>
        <div>
          <span className="text-secondary-dark">Creator ID:</span>{" "}
          {visit.createdById}
        </div>
        <div className="col-span-2">
          <span className="text-secondary-dark">Doctor (EN/AR):</span>{" "}
          {visit.doctorNameEN || "-"} / {visit.doctorNameAR || "-"}
        </div>
        <div className="col-span-2">
          <span className="text-secondary-dark">Samples:</span>{" "}
          {visit.samples.length > 0 ? visit.samples.join(", ") : "-"}
        </div>
        <div>
          <span className="text-secondary-dark">Created At:</span>{" "}
          {createdAtLabel}
        </div>
        <div>
          <span className="text-secondary-dark">Updated At:</span>{" "}
          {updatedAtLabel}
        </div>
      </div>

      {visit.notes && (
        <div
          className={`rounded-lg border border-[#BBF7D0] p-3 text-xs ${s.bg} `}
        >
          <div className="text-sm/[21px] font-semibold">Notes</div>
          <div className="text-secondary-dark text-sm/[21px] font-normal">
            {visit.notes}
          </div>
        </div>
      )}

      {reportBasePath && visit.status !== "COMPLETED" && (
        <div className="border-secondary-light flex w-full items-center border-t pt-3 *:ml-auto">
          <Link
            href={`${reportBasePath}?visitId=${visit.id}`}
            className="button-system-gradient-primary inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm/5"
          >
            <CircleCheckBig size={16} />
            Complete
          </Link>
        </div>
      )}
    </Card>
  );
}
