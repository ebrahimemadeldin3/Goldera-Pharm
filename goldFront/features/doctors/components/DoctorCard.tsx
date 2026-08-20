import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Phone, Mail, Building2 } from "lucide-react";
import { DoctorCardData } from "../lib/types";
import Link from "next/link";
import { useRoleUI } from "@/core/ui/role-ui-context";

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

  const displayName = nameEN || nameAR;
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

  return (
    <Card className="border-secondary-light flex w-full flex-col gap-4 rounded-[10px] border-[0.8px] bg-white p-4 shadow-none sm:flex-row">
      <header className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#1E3A8A] text-white">
        <Stethoscope size={24} />
      </header>
      <CardContent className="flex flex-1 flex-col items-start justify-between gap-3 p-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base/6 font-semibold text-black">
            {displayName}
            {secondaryName && (
              <span className="ml-1.5 text-xs font-normal text-slate-500">
                ({secondaryName})
              </span>
            )}
          </h3>
          {specialty && (
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {specialty}
            </span>
          )}
          {grade && (
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
              Grade {grade}
            </span>
          )}
          {subRegion && (
            <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {subRegion}
            </span>
          )}
        </div>

        <div className="text-secondary-dark grid grid-cols-1 gap-2 text-sm/5 md:grid-cols-2">
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{phone}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{email}</span>
            </div>
          )}
          {patientsPerDayText && (
            <div className="text-xs text-slate-500">
              Avg volume: <span className="font-medium text-slate-700">{patientsPerDayText}</span>
            </div>
          )}
          {area && (
            <div className="text-xs text-slate-500">
              Area: <span className="font-medium text-slate-700">{area}</span>
            </div>
          )}
        </div>

        {accountName && (
          <div className="w-full">
            <div className="flex w-full max-w-[340px] items-start gap-2 rounded-lg border border-blue-stroke bg-light-blue-gradiant px-3 py-2.5">
              <Building2 size={16} className="text-dashboard-blue mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <div className="text-sm font-medium text-black">
                  {accountName}
                </div>
                <div className="text-secondary-dark text-xs font-normal">
                  {subRegion}
                  {area ? `, ${area}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-row items-center justify-start gap-2 rounded-xl text-sm font-medium sm:flex-col sm:items-stretch sm:justify-start">
        {features.doctors.canView && (
          <Link
            href={profilePath}
            className="bg-dashboard-blue hover:border-dashboard-blue hover:text-dashboard-blue inline-flex h-9 min-w-[120px] items-center justify-center rounded-md border border-transparent px-3 text-center text-sm font-medium text-white transition-colors hover:bg-white"
          >
            View Profile
          </Link>
        )}
        {features.visits.canScheduleVisit && (
          <Link href={addVisitPath}>
            <Button
              variant="outline"
              className="h-9 min-w-[120px] cursor-pointer px-3 text-sm font-medium"
            >
              Schedule Visit
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
