"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Mail,
  MapPinned,
  Phone,
  Stethoscope,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { useRoleUI } from "@/core/ui/role-ui-context";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { DoctorCardData } from "../lib/types";
import { getTerritoryLookup } from "@/features/plan/lib/territory";

function isClean(value?: string | null): value is string {
  return Boolean(
    value &&
      typeof value === "string" &&
      value.trim() !== "" &&
      !value.toLowerCase().includes("undefined") &&
      !value.toLowerCase().includes("null"),
  );
}

function InfoCell({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | null;
  icon: typeof Phone;
  accent?: boolean;
}) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle/80 min-w-0 rounded-[10px] border px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            accent ? "text-gp-gold-600" : "text-gp-navy-900",
          )}
          aria-hidden="true"
        />
        <span className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 truncate text-sm font-semibold",
          value ? "text-gp-navy-900" : "text-gp-text-placeholder italic",
        )}
        dir="auto"
        title={value ?? undefined}
      >
        {value ?? "Not provided"}
      </p>
    </div>
  );
}

export default function DoctorCard({
  data,
  index = 0,
}: {
  data: DoctorCardData;
  index?: number;
}) {
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

  const cleanNameAR = isClean(nameAR) ? nameAR.trim() : null;
  const cleanNameEN = isClean(nameEN) ? nameEN.trim() : null;
  const cleanSpecialty = isClean(specialty) ? specialty.trim() : "General Doctor";
  const cleanEmail = isClean(email) ? email.trim() : null;
  const cleanPhone = isClean(phone) ? phone.trim() : null;
  const cleanGrade = isClean(grade) ? grade.trim() : null;
  const cleanArea = isClean(area) ? area.trim() : null;
  const cleanAccount = isClean(accountName) ? accountName.trim() : null;
  const cleanSubRegion = isClean(subRegion) ? subRegion.trim() : null;
  const territory = getTerritoryLookup(cleanSubRegion || cleanArea);
  const primaryName = cleanNameAR || cleanNameEN || "Unnamed Doctor";
  const secondaryName =
    cleanNameAR && cleanNameEN ? cleanNameEN : cleanNameAR ? null : cleanNameAR;
  const initials = getInitials(cleanNameEN || cleanNameAR || "Doctor");
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
      const doctorsRes = await getDoctorsAction(
        undefined,
        undefined,
        undefined,
        false,
      );
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleDialogOpen(true);
  };

  const pathname = usePathname();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");

  return (
    <>
      <Card
        className={cn(
          "group/doctor border-gp-border-default bg-gp-surface-card shadow-gp-card relative flex min-h-[286px] flex-col justify-between gap-4 overflow-hidden rounded-[16px] border p-4 opacity-0 transition-[border-color,box-shadow,transform] duration-[200ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(16,29,54,0.09)] [animation:plans-card-in_350ms_ease-out_forwards] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none motion-reduce:[animation:none]",
          isRep ? "hover:border-[#168557]/40" : "hover:border-gp-gold-300",
        )}
        style={{ animationDelay: `${Math.min(index, 9) * 45}ms` }}
      >
        <span
          className={cn(
            "absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full",
            isRep ? "bg-[#168557]" : "bg-gp-gold-500",
          )}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-[12px] border text-sm font-semibold shadow-[0_6px_14px_rgba(16,29,54,0.15)] transition-[border-color,transform] duration-[200ms] group-hover/doctor:-translate-y-0.5 motion-reduce:transform-none",
                isRep
                  ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] group-hover/doctor:border-[#168557]"
                  : "border-gp-gold-300 bg-gp-navy-900 text-gp-gold-500 group-hover/doctor:border-gp-gold-500",
              )}
            >
              {initials}
            </span>

            <div className="min-w-0 flex-1">
              <h3
                className="text-gp-navy-900 truncate text-base leading-6 font-semibold transition-colors duration-[180ms]"
                dir="auto"
              >
                {primaryName}
              </h3>
              {secondaryName && (
                <p
                  className="text-gp-text-muted mt-0.5 truncate text-sm font-medium"
                  dir="auto"
                >
                  {secondaryName}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-[#E8D7A8] bg-[#F8F4E9] px-2.5 py-1 text-[11px] font-semibold text-[#8A681F] transition-[background-color,border-color] duration-[180ms] group-hover/doctor:border-gp-gold-400 group-hover/doctor:bg-gp-gold-50">
                  {cleanSpecialty}
                </span>

                <span className="group/territory border-gp-border-control bg-gp-surface-control text-gp-navy-900 relative rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                  <span className="inline-flex max-w-[170px] items-center gap-1 truncate">
                    <MapPinned
                      className="size-3 text-gp-gold-600"
                      aria-hidden="true"
                    />
                    <span className="truncate">{territory.territory}</span>
                  </span>
                  <span className="plans-territory-tooltip pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[232px] -translate-x-1/2 rounded-[12px] border border-gp-border-default bg-white p-3 text-left shadow-gp-popover group-hover/territory:block group-focus-within/territory:block">
                    <span className="text-gp-navy-900 block text-xs font-bold tracking-[0.06em] uppercase">
                      Territory
                    </span>
                    <span className="text-gp-text-muted mt-1 block text-xs font-medium">
                      {territory.district}
                    </span>
                    <span className="text-gp-text-muted mt-1 block text-xs font-medium">
                      {territory.region}
                    </span>
                    <span className="text-gp-navy-900 mt-2 block text-xs font-semibold">
                      {territory.territory}
                    </span>
                  </span>
                </span>

                {cleanGrade && (
                  <span className="border-gp-border-subtle bg-white text-gp-text-secondary rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                    Grade {cleanGrade}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <InfoCell label="Phone" value={cleanPhone} icon={Phone} />
            <InfoCell label="Email" value={cleanEmail} icon={Mail} />
            <InfoCell
              label="Facility"
              value={cleanAccount}
              icon={Building2}
              accent
            />
            <InfoCell
              label="Territory"
              value={`${territory.region} · ${territory.territory}`}
              icon={MapPinned}
              accent
            />
          </div>

          {(patientsPerDayText || cleanArea) && (
            <div className="text-gp-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
              {patientsPerDayText && (
                <span className="inline-flex items-center gap-1.5">
                  <Stethoscope
                    className="text-gp-gold-600 size-3.5"
                    aria-hidden="true"
                  />
                  {patientsPerDayText}
                </span>
              )}
              {cleanArea && (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPinned
                    className="text-gp-gold-600 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate" dir="auto">
                    {cleanArea}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="border-gp-border-subtle flex flex-col gap-2 border-t pt-3 sm:flex-row sm:justify-end">
          {features.visits.canScheduleVisit && (
            <div className="flex items-center">
              <Button
                type="button"
                onClick={handleOpenSchedule}
                className={cn(
                  "group/schedule h-10 w-full cursor-pointer rounded-[10px] border px-3.5 text-xs font-semibold shadow-none transition-[background-color,border-color,color,box-shadow] duration-[180ms] focus-visible:ring-3 focus-visible:outline-none sm:w-auto",
                  isRep
                    ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] hover:border-[#168557] hover:bg-[#D5F3E4] focus-visible:ring-[#168557]/20"
                    : "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 hover:border-gp-gold-500 hover:bg-gp-surface-hover focus-visible:ring-gp-gold-500/20",
                )}
              >
                <CalendarDays
                  className="size-3.5 transition-transform duration-[180ms] group-hover/schedule:-translate-y-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Schedule Visit
              </Button>
              <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
                Schedule Visit Page
              </Link>
            </div>
          )}

          {features.doctors.canView && (
            <Link
              href={profilePath}
              className={cn(
                "group/profile inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] px-3.5 text-xs font-semibold text-white transition-[background-color,box-shadow,transform] duration-[180ms] hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:outline-none motion-reduce:transform-none sm:w-auto",
                isRep
                  ? "bg-[#168557] hover:bg-[#126b46] shadow-[0_6px_16px_rgba(22,133,87,0.22)] focus-visible:ring-[#168557]/25"
                  : "bg-gp-navy-900 hover:bg-gp-navy-900/95 shadow-[0_6px_16px_rgba(16,29,54,0.16)] hover:shadow-[0_10px_22px_rgba(16,29,54,0.2)] focus-visible:ring-gp-gold-500/25",
              )}
            >
              View Profile
              <ArrowRight
                className={cn(
                  "size-3.5 transition-transform duration-[180ms] group-hover/profile:translate-x-0.5 motion-reduce:transition-none",
                  isRep ? "text-white" : "text-gp-gold-500",
                )}
                aria-hidden="true"
              />
            </Link>
          )}
        </div>
      </Card>

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
