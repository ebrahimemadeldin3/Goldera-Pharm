"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  FileText,
  GraduationCap,
  IdCard,
  Info,
  Mail,
  MoreHorizontal,
  Network,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getInitials } from "@/lib/utils";
import type { HRMember } from "../lib/types";
import {
  formatHRDate,
  formatServiceDuration,
  getApprovedLeaveDays,
  getDocumentUrl,
  getReportsTo,
  getTerritory,
} from "../lib/utils";

type HRMemberCardProps = {
  member: HRMember;
  animationIndex?: number;
};

type InformationItemProps = {
  label: string;
  value: string;
  fallback: string;
  dir?: "auto" | "ltr";
};

function InformationItem({
  label,
  value,
  fallback,
  dir = "auto",
}: InformationItemProps) {
  return (
    <div className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] gap-2 text-[13px] leading-5">
      <dt className="text-gp-text-muted font-medium">{label}</dt>
      <dd
        className={cn(
          "min-w-0 font-semibold break-words",
          value ? "text-gp-navy-900" : "text-gp-text-placeholder",
        )}
        title={value || undefined}
        dir={dir}
      >
        {value || fallback}
      </dd>
    </div>
  );
}

function InformationGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof IdCard;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="hr-member-info-group min-w-0 py-1">
      <h4 className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <Icon className="text-gp-gold-600 size-3.5" aria-hidden="true" />
        {title}
      </h4>
      <dl className="mt-2.5 space-y-2">{children}</dl>
    </section>
  );
}

export function HRMemberCard({
  member,
  animationIndex = 0,
}: HRMemberCardProps) {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const isSupervisor = member.role === "SUPERVISOR";
  const roleLabel = isSupervisor ? "Supervisor" : "Medical Representative";
  const profileImageUrl = getDocumentUrl(member.profileImage);
  const resumeUrl = getDocumentUrl(member.resume);
  const dateOfBirth = formatHRDate(member.dateOfBirth);
  const startDate = formatHRDate(member.dateOfRecruitment);
  const serviceDuration = formatServiceDuration(member.dateOfRecruitment);
  const lastLogin = formatHRDate(member.lastLogin, true);
  const reportsTo = getReportsTo(member);
  const territory = getTerritory(member);
  const leaveDays = getApprovedLeaveDays(member.leaveDaysCountTotal);
  const leaveValue = `${leaveDays.toLocaleString()} ${leaveDays === 1 ? "day" : "days"}`;
  const hasAdditionalInformation = Boolean(
    member.phone ||
    member.department ||
    member.location ||
    territory ||
    member.educationBackground ||
    member.bio ||
    member.certificates?.length,
  );
  const hasSecondaryActions = hasAdditionalInformation || Boolean(resumeUrl);
  const status =
    member.isActive === true
      ? {
          label: "Active",
          className:
            "border-gp-success-border bg-gp-success-soft text-gp-success",
        }
      : member.isActive === false
        ? {
            label: "Inactive",
            className:
              "border-gp-border-control bg-gp-surface-control text-gp-text-secondary",
          }
        : {
            label: "Status unavailable",
            className:
              "border-gp-border-control bg-gp-surface-control text-gp-text-muted",
          };

  return (
    <Card
      className="hr-member-card hr-member-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card gap-0 overflow-hidden rounded-[14px] border py-0"
      style={
        {
          "--hr-card-delay": `${Math.min(animationIndex, 5) * 50}ms`,
        } as CSSProperties
      }
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            {profileImageUrl ? (
              <SafeCldImage
                src={profileImageUrl}
                alt={`Profile photo of ${member.name}`}
                width={56}
                height={56}
                className="hr-member-avatar border-gp-gold-300 size-14 shrink-0 rounded-full border-2 object-cover shadow-sm"
              />
            ) : (
              <div
                className="hr-member-avatar border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-14 shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold shadow-sm"
                role="img"
                aria-label={`Avatar for ${member.name}`}
              >
                {getInitials(member.name)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <h3
                  className="text-gp-navy-900 min-w-0 text-base leading-5 font-semibold break-words sm:text-[17px]"
                  title={member.name}
                  dir="auto"
                >
                  {member.name}
                </h3>
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  <UserRound className="size-3.5" aria-hidden="true" />
                  {roleLabel}
                </span>
                <span
                  className={cn(
                    "hr-status-badge inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    status.className,
                  )}
                  aria-label={`Status: ${status.label}`}
                >
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  {status.label}
                </span>
              </div>

              <p
                className="text-gp-text-muted mt-2 flex min-w-0 items-start gap-2 text-sm font-medium"
                dir="ltr"
              >
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-all">{member.email}</span>
              </p>
            </div>
          </div>

          <dl className="hr-member-meta flex min-w-0 shrink-0 flex-col gap-2 pl-[60px] text-[13px] leading-5 xl:pl-0 xl:pt-1">
            <div className="flex min-w-0 items-start gap-2">
              <CalendarDays
                className="hr-meta-icon text-gp-gold-600 mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <dt className="text-gp-text-muted font-medium">Joined</dt>
              <dd className="text-gp-navy-900 min-w-0 truncate font-semibold">
                {startDate || "Not available"}
              </dd>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <Network
                className="hr-meta-icon text-gp-text-placeholder mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <dt className="text-gp-text-muted font-medium">Reports to</dt>
              <dd className="text-gp-navy-900 min-w-0 truncate font-semibold">
                {reportsTo || "Not assigned"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-gp-border-subtle mt-4 grid grid-cols-1 gap-3 border-t pt-3.5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-0">
          <InformationGroup icon={IdCard} title="Employee Info">
            <InformationItem
              label="Iqama"
              value={member.iqamaNumber?.trim() || ""}
              fallback="Not provided"
              dir="ltr"
            />
            <InformationItem
              label="Date of birth"
              value={dateOfBirth}
              fallback="Not provided"
            />
          </InformationGroup>

          <InformationGroup icon={BriefcaseBusiness} title="Employment">
            <InformationItem
              label="Service"
              value={serviceDuration}
              fallback="Not available"
            />
            <InformationItem
              label="Last login"
              value={lastLogin}
              fallback="No activity yet"
            />
          </InformationGroup>

          <InformationGroup icon={CalendarCheck2} title="Leave / Activity">
            <InformationItem
              label="Approved leave"
              value={leaveValue}
              fallback="No approved leave"
            />
          </InformationGroup>
        </div>

        <footer className="border-gp-border-subtle mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gp-text-muted min-w-0 text-[13px] leading-5 font-medium">
            Approved leave recorded:{" "}
            <strong className="text-gp-navy-900 font-semibold">
              {leaveValue}
            </strong>
          </p>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Link
              href={`/manager/team/${member.id}`}
              aria-label={`View profile for ${member.name}`}
              className="hr-view-profile group/action bg-gp-navy-900 focus-visible:ring-gp-gold-500/30 shadow-[0_4px_12px_rgba(16,29,54,0.24)] inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-[border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none hover:shadow-[0_6px_16px_rgba(16,29,54,0.3)] sm:flex-none"
            >
              View Profile
              <ArrowRight
                className="hr-view-profile-arrow text-gp-gold-500 size-4"
                aria-hidden="true"
              />
            </Link>

            {hasSecondaryActions && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`More actions for ${member.name}`}
                        className="hr-more-action border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/20 size-10 shrink-0 cursor-pointer rounded-[10px] bg-white shadow-none"
                      >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    More employee actions
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="border-gp-border-default shadow-gp-popover min-w-52 rounded-[10px] bg-white p-1.5"
                >
                  {hasAdditionalInformation && (
                    <DropdownMenuItem
                      onSelect={() => setShowMoreInfo((current) => !current)}
                      aria-expanded={showMoreInfo}
                      aria-controls={`hr-member-details-${member.id}`}
                      className="text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-gold-700 h-9 cursor-pointer rounded-[8px] px-2.5 font-medium"
                    >
                      <Info className="size-4" aria-hidden="true" />
                      {showMoreInfo ? "Hide" : "View"} additional information
                    </DropdownMenuItem>
                  )}
                  {resumeUrl && (
                    <DropdownMenuItem asChild>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open CV or resume for ${member.name}`}
                        className="text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-gold-700 h-9 cursor-pointer rounded-[8px] px-2.5 font-medium"
                      >
                        <FileText className="size-4" aria-hidden="true" />
                        Open CV / Resume
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </footer>

        {showMoreInfo && hasAdditionalInformation && (
          <section
            id={`hr-member-details-${member.id}`}
            className="hr-member-details border-gp-border-subtle bg-gp-surface-subtle mt-4 rounded-[12px] border p-4"
            aria-label={`Additional information for ${member.name}`}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InformationItem
                label="Phone"
                value={member.phone?.trim() || ""}
                fallback="Not provided"
                dir="ltr"
              />
              <InformationItem
                label="Department"
                value={member.department?.trim() || ""}
                fallback="Not assigned"
              />
              <InformationItem
                label="Territory"
                value={territory}
                fallback="Not assigned"
              />
              <InformationItem
                label="Education"
                value={member.educationBackground?.trim() || ""}
                fallback="No education record"
              />
              <InformationItem
                label="Certificates"
                value={
                  member.certificates?.length
                    ? `${member.certificates.length} ${member.certificates.length === 1 ? "record" : "records"}`
                    : ""
                }
                fallback="No files uploaded"
              />
            </div>
            {member.bio?.trim() && (
              <div className="border-gp-border-subtle mt-4 border-t pt-4">
                <p className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.05em] uppercase">
                  <GraduationCap
                    className="text-gp-gold-600 size-3.5"
                    aria-hidden="true"
                  />
                  Professional summary
                </p>
                <p className="text-gp-text-secondary mt-2 text-sm leading-6 break-words">
                  {member.bio}
                </p>
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
