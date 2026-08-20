"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { MapPin, Mail, Phone, Users } from "lucide-react";
import Link from "next/link";
import { User } from "../lib/types";
import { SafeCldImage } from "@/components/ui/safe-cld-image";

type TeamCardProps = {
  member: User;
  baseUrl?: string;
};

export default function TeamCard({
  member,
  baseUrl = "/manager/team",
}: TeamCardProps) {
  const isSupervisor = member.role === "SUPERVISOR";
  const isActive = true;

  return (
    <Card className="border-secondary-light w-full rounded-[14px] border-[0.8px] bg-white shadow-none">
      <CardHeader className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          {member.avatar ? (
            <SafeCldImage
              src={member.avatar}
              alt={member.name}
              width={48}
              height={48}
              className="size-12 shrink-0! rounded-full object-cover"
            />
          ) : (
            <div
              className={`flex size-12 items-center justify-center rounded-full bg-linear-to-b text-sm/6 text-white ${
                !isActive
                  ? "bg-secondary-dark"
                  : isSupervisor
                    ? "gradient-blue"
                    : "gradient-green"
              }`}
              aria-hidden
            >
              {getInitials(member.name)}
            </div>
          )}

          <div className="flex flex-col items-start justify-start">
            <h3 className="text-sm/6 font-normal">{member.name}</h3>
            <span
              className={`rounded-lg border px-3 py-0.5 text-xs/4 font-medium ${
                !isActive
                  ? "border-gold-stroke bg-light-warning text-dashboard-red"
                  : "border-dashboard-green text-dashboard-green"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col justify-center gap-2 text-sm/5 font-normal">
          <div className="text-secondary-dark flex items-center gap-2">
            <MapPin size={20} />
            <span className="truncate">
              {member.region?.name && member.region?.subRegion?.name
                ? `${member.region.name} - ${member.region.subRegion.name}`
                : member.region?.name || "N/A"}
            </span>
          </div>

          <div className="text-secondary-dark flex items-center gap-2">
            <Mail size={20} />
            <span className="truncate">{member.email}</span>
          </div>

          <div className="text-secondary-dark flex items-center gap-2">
            <Phone size={20} />
            <span>{member.phone || "N/A"}</span>
          </div>

          {isSupervisor && member.repsCount !== undefined && (
            <div className="text-secondary-dark flex items-center gap-2">
              <Users size={20} />
              <span>{member.repsCount} Medical Reps</span>
            </div>
          )}
        </div>

        {/* <div
          className={`mt-auto ${!isActive ? "border-secondary-light bg-secondary-very-light" : isSupervisor ? "border-blue-stroke bg-light-blue-gradiant" : "border-green-stroke bg-[#E7FFF7]"} mt-2 flex justify-between rounded-[10px] border p-4`}
        >
          <div className="flex flex-col items-start gap-1">
            <p className="text-secondary-dark text-xs/4 font-normal">Sales</p>
            <span className="text-sm/5 font-normal text-black">
              {member.sales || "N/A"}
            </span>
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-secondary-dark text-xs/4 font-normal">Target</p>
            <span className="text-sm/5 font-normal text-black">
              {member.targetPercentage || 0}%
            </span>
          </div>

          <div className="flex flex-col items-start gap-1">
            <p className="text-secondary-dark text-xs/4 font-normal">Pending</p>
            <span className="text-sm/5 font-normal text-black">
              {member.pendingRequests || 0}
            </span>
          </div>
        </div> */}

        <Link
          href={!isActive ? `${baseUrl}` : `${baseUrl}/${member.id}`}
          className={`mt-auto w-full rounded-[11px] border bg-linear-to-b py-2 text-center text-white transition-colors duration-200 ${
            !isActive
              ? "bg-secondary-dark hover:bg-secondary-dark cursor-not-allowed"
              : isSupervisor
                ? "hover:text-dashboard-blue hover:border-dashboard-blue cursor-pointer from-[#2563EB] to-[#1E3A8A] hover:border hover:from-white hover:to-white"
                : "hover:text-dashboard-green hover:border-dashboard-green cursor-pointer from-[#10B981] to-[#1E8A35] hover:border hover:from-white hover:to-white"
          }`}
        >
          {!isActive ? "View Details" : "View Profile"}
        </Link>
      </CardContent>
    </Card>
  );
}
