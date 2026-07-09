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
  const { features } = useRoleUI();

  const displayName = nameEN || nameAR;
  const patientsPerDayText = avgPatientsPerDay
    ? `${avgPatientsPerDay} patients/day`
    : "N/A";

  return (
    <Card className="border-secondary-light flex w-full flex-row gap-4 rounded-[10px] border-[0.8px] bg-white p-4 shadow-none">
      <header className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#1E3A8A] text-white">
        <Stethoscope size={24} />
      </header>
      <CardContent className="flex flex-1 flex-col items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base/6 font-normal text-black">{displayName}</h3>
          <span className="border-dashboard-blue text-dashboard-blue rounded-xl border px-2 py-0.5 text-xs/4 font-medium">
            {specialty}
          </span>
          <span className="bg-dashboard-blue rounded-xl px-2 py-0.5 text-xs/4 font-medium text-white">
            {subRegion}
          </span>
          <span className="border-dashboard-blue text-dashboard-blue rounded-xl border px-2 py-0.5 text-xs/4 font-medium">
            Grade {grade}
          </span>
        </div>

        <div className="text-secondary-dark grid grid-cols-2 gap-2 gap-x-56 text-sm/5">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{email || "N/A"}</span>
          </div>
          <span>{patientsPerDayText}</span>
          {area && <span>{area}</span>}
        </div>

        {accountName && (
          <div>
            <div className="mb-2 text-sm/5 font-normal text-black">
              Account Name:
            </div>
            <div className="flex gap-5">
              <div className="flex w-78.75 items-start gap-2 rounded-lg border border-[#DBEAFE] bg-[#F5F9FF] px-3 py-3">
                <Building2 size={16} className="text-dashboard-blue" />
                <div className="flex flex-col">
                  <div className="flex items-center text-sm/5 font-normal text-black">
                    {accountName}
                  </div>
                  <div className="text-secondary-dark mt-1 text-xs/4 font-normal">
                    {subRegion}
                    {area ? `, ${area}` : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start justify-start gap-2 rounded-xl text-sm font-medium *:cursor-pointer">
        {features.doctors.canView && (
          <Link
            href={`doctors/${id}`}
            className="bg-dashboard-blue hover:border-dashboard-blue hover:text-dashboard-blue w-28 rounded-md border border-transparent py-2 text-center text-white hover:bg-white"
          >
            View Profile
          </Link>
        )}
        {features.visits.canScheduleVisit && (
          <Link href={`visits/add?doctorId=${id}`}>
            <Button variant="outline" className="w-28 cursor-pointer py-2">
              Schedule Visit
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
