"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Mail, UsersRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import { cn, getInitials } from "@/lib/utils";
import { User } from "@/features/team/lib/types";
import {
  formatRoleLabel,
  MissingValue,
  ProfilePanelHeader,
  StatusPill,
} from "./ProfileInfoCards";

type TeamMembersProps = {
  members: User[];
  baseUrl?: string;
};

export default function TeamMembers({
  members,
  baseUrl = "/manager/team",
}: TeamMembersProps) {
  return (
    <Card className="member-profile-info-panel member-profile-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 rounded-[16px] border py-0">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <ProfilePanelHeader
            icon={UsersRound}
            title={`Team Members (${members.length})`}
            description="Medical representatives assigned under this supervisor."
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {members.map((member, index) => (
            <article
              key={member.id}
              className="member-profile-team-row border-gp-border-subtle bg-gp-surface-subtle flex min-w-0 flex-col gap-4 rounded-[12px] border p-4 sm:flex-row sm:items-center"
              style={
                {
                  "--member-profile-row-delay": `${index * 45}ms`,
                } as CSSProperties
              }
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {member.avatar ? (
                  <SafeCldImage
                    src={member.avatar}
                    alt={`Profile photo of ${member.name}`}
                    width={48}
                    height={48}
                    className="border-gp-gold-300 size-12 shrink-0 rounded-full border-2 object-cover"
                  />
                ) : (
                  <div
                    className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold"
                    role="img"
                    aria-label={`Avatar for ${member.name}`}
                  >
                    {getInitials(member.name)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3
                    className="text-gp-navy-900 truncate text-sm font-semibold"
                    title={member.name}
                    dir="auto"
                  >
                    {member.name}
                  </h3>
                  <p className="text-gp-text-muted mt-1 text-xs font-medium">
                    {formatRoleLabel(member.role)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill active={member.isActive} />
                    <span
                      className={cn(
                        "border-gp-border-subtle text-gp-text-secondary inline-flex max-w-full items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold",
                        !member.email && "text-gp-text-placeholder",
                      )}
                    >
                      <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {member.email || (
                          <MissingValue>Not provided</MissingValue>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`${baseUrl}/${member.id}`}
                aria-label={`View profile for ${member.name}`}
                className="member-profile-team-action border-gp-border-control text-gp-navy-850 hover:border-gp-gold-300 hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] border bg-white px-3 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none"
              >
                View
                <ArrowRight
                  className="member-profile-team-action-icon size-4"
                  aria-hidden="true"
                />
              </Link>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
