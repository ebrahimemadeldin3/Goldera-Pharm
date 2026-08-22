"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Phone, Mail, Building2, Calendar } from "lucide-react";
import { DoctorCardData } from "../lib/types";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";

export default function DoctorCard({ data }: { data: DoctorCardData }) {
  const {
    id,
    nameEN,
    nameAR,
    specialty,
    subRegion,
    phone,
    email,
    grade,
    avgPatientsPerDay,
    accountName,
    area,
  } = data;
  const { features, role } = useRoleUI();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorApiResponse[]>([]);

  // Strict Data Sanitization (Prevent literal 'undefined' or 'null' strings)
  const isClean = (val?: string | null): val is string =>
    Boolean(val && typeof val === "string" && val.trim() !== "" && !val.toLowerCase().includes("undefined") && !val.toLowerCase().includes("null"));

  const cleanEmail = isClean(email) ? email : null;
  const cleanPhone = isClean(phone) ? phone : null;
  const cleanGrade = isClean(grade) ? grade : null;
  const cleanArea = isClean(area) ? area : null;
  const cleanAccount = isClean(accountName) ? accountName : null;
  const cleanSubRegion = isClean(subRegion) ? subRegion : null;

  const displayName = nameEN || nameAR || "Unnamed Doctor";
  const secondaryName = nameEN && nameAR ? nameAR : null;
  const patientsPerDayText = avgPatientsPerDay
    ? `${avgPatientsPerDay} patients/day`
    : null;

  const profilePath =
    role === "MANAGER"
      ? `/manager/doctors/${id}`
      : role === "SUPERVISOR"
        ? `/supervisor/doctors/${id}`
        : `/rep/doctors/${id}`;

  const addVisitPath =
    role === "MANAGER"
      ? `/manager/visits/add?doctorId=${id}`
      : role === "SUPERVISOR"
        ? `/supervisor/visits/add?doctorId=${id}`
        : `/rep/visits/add?doctorId=${id}`;

  const handleOpenSchedule = async () => {
    if (doctorsList.length === 0) {
      const doctorsRes = await getDoctorsAction(undefined, undefined, undefined, false);
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleDialogOpen(true);
  };

  return (
    <>
      <Card className="border-slate-200 flex flex-col justify-between gap-3 rounded-xl border bg-white p-4 shadow-none hover:border-slate-300 hover:shadow-xs transition-all duration-150">
        <div className="flex flex-col gap-2.5">
          {/* Top Header: Avatar + Doctor Name & Badges */}
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#1E3A8A] text-white">
              <Stethoscope size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-base font-semibold text-slate-900 leading-snug truncate">
                  {displayName}
                </h3>
                {secondaryName && (
                  <span className="text-xs text-slate-500 font-normal truncate">
                    ({secondaryName})
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                  {specialty || "General Doctor"}
                </span>

                {cleanGrade && (
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                    Grade {cleanGrade}
                  </span>
                )}

                {cleanSubRegion && (
                  <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    {cleanSubRegion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Volume Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className={cleanPhone ? "text-slate-700" : "italic text-slate-400"}>
                {cleanPhone || "No phone provided"}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className={cleanEmail ? "text-slate-700 truncate" : "italic text-slate-400"}>
                {cleanEmail || "No email provided"}
              </span>
            </div>

            {patientsPerDayText && (
              <div className="text-slate-500 truncate">
                Volume: <span className="font-medium text-slate-700">{patientsPerDayText}</span>
              </div>
            )}

            {cleanArea && (
              <div className="text-slate-500 truncate">
                Area: <span className="font-medium text-slate-700">{cleanArea}</span>
              </div>
            )}
          </div>

          {/* Hospital / Account Section */}
          {cleanAccount ? (
            <div className="flex items-center gap-2 rounded-md border border-blue-stroke bg-light-blue-gradiant px-3 py-1.5 text-xs">
              <Building2 size={15} className="text-dashboard-blue shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-slate-900 truncate block">{cleanAccount}</span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {cleanSubRegion || "Region N/A"}{cleanArea ? `, ${cleanArea}` : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic px-1">
              No hospital/account assigned
            </div>
          )}
        </div>

        {/* Action Buttons Row at Bottom Right */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
          {features.doctors.canView && (
            <Link
              href={profilePath}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 inline-flex h-8 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            >
              View Profile
            </Link>
          )}
          {features.visits.canScheduleVisit && (
            <div className="flex items-center">
              <Button
                type="button"
                onClick={handleOpenSchedule}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 cursor-pointer px-3 text-xs font-medium gap-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none shadow-2xs"
              >
                <Calendar size={13} />
                Schedule Visit
              </Button>
              <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
                Schedule Visit Page
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Schedule Visit Modal Overlay with doctor preselected */}
      {scheduleDialogOpen && (
        <AddVisitDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          role={role as "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"}
          doctors={doctorsList}
          initialDoctorId={id}
        />
      )}
    </>
  );
}
