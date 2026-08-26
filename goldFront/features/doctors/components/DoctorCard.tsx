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
      <Card className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none transition-all duration-170 hover:border-[#E9DDB8] hover:shadow-[0_4px_14px_rgba(16,27,51,0.06)] hover:-translate-y-px">
        <div className="flex flex-col gap-2.5">
          {/* Top Header: Avatar + Doctor Name & Badges */}
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF8E5] border border-[#E9DDB8] text-[#8A6515] shadow-2xs">
              <Stethoscope size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-base font-semibold text-[#182033] leading-snug truncate">
                  {displayName}
                </h3>
                {secondaryName && (
                  <span className="text-xs text-[#667085] font-normal truncate">
                    ({secondaryName})
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-[#D7E5FF] bg-[#EDF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#3972D5]">
                  {specialty || "General Doctor"}
                </span>

                {cleanGrade && (
                  <span className="rounded-md border border-[#F5DFAC] bg-[#FFF8E5] px-2 py-0.5 text-[11px] font-semibold text-[#8A6515]">
                    Grade {cleanGrade}
                  </span>
                )}

                {cleanSubRegion && (
                  <span className="rounded-md border border-[#E5E8EF] bg-[#F6F8FB] px-2 py-0.5 text-[11px] font-medium text-[#344054]">
                    {cleanSubRegion}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Volume Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#344054] bg-[#F9FAFB] p-2.5 rounded-[10px] border border-[#EEF1F6]">
            <div className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#8A94A6]" />
              <span className={cleanPhone ? "text-[#182033] font-medium" : "italic text-[#8A94A6]"}>
                {cleanPhone || "No phone provided"}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#8A94A6]" />
              <span className={cleanEmail ? "text-[#182033] font-medium truncate" : "italic text-[#8A94A6]"}>
                {cleanEmail || "No email provided"}
              </span>
            </div>

            {patientsPerDayText && (
              <div className="text-[#667085] truncate">
                Volume: <span className="font-semibold text-[#182033]">{patientsPerDayText}</span>
              </div>
            )}

            {cleanArea && (
              <div className="text-[#667085] truncate">
                Area: <span className="font-semibold text-[#182033]">{cleanArea}</span>
              </div>
            )}
          </div>

          {/* Hospital / Account Section */}
          {cleanAccount ? (
            <div className="flex items-center gap-2 rounded-[8px] border border-[#E5E8EF] bg-[#FBFCFE] px-3 py-1.5 text-xs">
              <Building2 size={15} className="text-[#3972D5] shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[#182033] truncate block">{cleanAccount}</span>
                <span className="text-[11px] text-[#667085] block truncate">
                  {cleanSubRegion || "Region N/A"}{cleanArea ? `, ${cleanArea}` : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-[#8A94A6] italic px-1">
              No hospital/account assigned
            </div>
          )}
        </div>

        {/* Action Buttons Row at Bottom Right */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEF1F6] mt-1">
          {features.doctors.canView && (
            <Link
              href={profilePath}
              className="border border-[#E5E8EF] bg-white hover:bg-[#F9FAFB] text-[#182033] inline-flex h-9 items-center justify-center rounded-[10px] px-3.5 text-xs font-semibold transition-colors duration-170 focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 focus-visible:outline-none"
            >
              View Profile
            </Link>
          )}
          {features.visits.canScheduleVisit && (
            <div className="flex items-center">
              <Button
                type="button"
                onClick={handleOpenSchedule}
                className="bg-[#C9A44C] hover:bg-[#B18732] text-white h-9 cursor-pointer px-3.5 text-xs font-semibold gap-1.5 transition-all duration-170 focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30 focus-visible:outline-none shadow-[0_4px_14px_rgba(201,164,76,0.25)] rounded-[10px]"
              >
                <Calendar size={13} className="stroke-[2.2]" />
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
