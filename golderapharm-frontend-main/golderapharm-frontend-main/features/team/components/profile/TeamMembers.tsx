"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { User } from "@/features/team/lib/types"

type TeamMembersProps = {
  members: User[];
  baseUrl?: string;
};

export default function TeamMembers({
  members,
  baseUrl = "/manager/team",
}: TeamMembersProps) {
  return (
    <Card className="border-secondary-light flex w-full flex-col gap-2 rounded-[14px] border-[0.8px] bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-dashboard-blue text-[17px] font-semibold">
          Team Members ({members.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 divide-y">
        {members.map((member) => {
          const initials = getInitials(member.name);
          return (
            <div
              key={member.id}
              className="border-secondary-light flex items-center justify-start gap-4 rounded-[10px] border p-3"
            >
              <div
                aria-hidden
                className="flex size-10 items-center justify-center rounded-full bg-linear-to-b from-[#10B981] to-[#1E8A35] text-[16px] font-normal text-white"
              >
                {initials}
              </div>
              <div className="flex flex-col font-normal">
                <span className="text-[16px] text-black">{member.name}</span>
                <span className="text-secondary-dark text-[14px]">
                  {member.role === "MEDICAL_REP"
                    ? "Medical Representative"
                    : member.role === "SUPERVISOR"
                      ? "Supervisor"
                      : member.role}
                </span>
              </div>
              <div className="ml-auto flex flex-col items-end font-normal">
                <span className="text-secondary-dark text-[14px]">Sales</span>
                <span className="text-[16px] text-black">
                  {member.sales || "N/A"}
                </span>
              </div>
              <Link href={`${baseUrl}/${member.id}`}>
                <Button className="bg-dashboard-blue outline-dashboard-blue hover:text-dashboard-blue cursor-pointer p-3 text-[14px] font-medium text-white outline outline-solid hover:bg-white">
                  View
                </Button>
              </Link>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
