"use client";

import type { CSSProperties, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getInitials } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  IdCard,
  Mail,
  MapPinned,
  ShieldCheck,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { User } from "../lib/types";
import { getTeamMemberAssignment } from "../lib/utils";
import { SafeCldImage } from "@/components/ui/safe-cld-image";

type TeamCardProps = {
  member: User;
  baseUrl?: string;
  animationIndex?: number;
};

type DetailItemProps = {
  label: string;
  value?: string | number | null;
  fallback?: string;
  dir?: "auto" | "ltr";
  preserve?: boolean;
};

type DetailGroupProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRoleLabel(member: User) {
  if (member.role === "SUPERVISOR") return "Supervisor";
  if (member.role === "MEDICAL_REP") return "Medical Representative";
  return "Manager";
}

function DetailItem({
  label,
  value,
  fallback = "Not provided",
  dir = "auto",
  preserve = false,
}: DetailItemProps) {
  const displayValue =
    typeof value === "number" ? String(value) : value?.trim() || "";

  return (
    <div className="team-detail-item grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-3 text-[13px] leading-5">
      <dt className="text-gp-text-muted whitespace-nowrap font-medium">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 font-semibold",
          preserve
            ? "overflow-hidden text-ellipsis whitespace-nowrap"
            : "break-words",
          displayValue ? "text-gp-navy-900" : "text-gp-text-placeholder",
        )}
        title={displayValue || undefined}
        dir={dir}
      >
        {displayValue || fallback}
      </dd>
    </div>
  );
}

function DetailGroup({ title, icon: Icon, children }: DetailGroupProps) {
  return (
    <section className="team-info-group min-w-0 py-1">
      <h4 className="text-gp-text-muted flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <Icon className="text-gp-gold-600 size-3.5" aria-hidden="true" />
        {title}
      </h4>
      <dl className="mt-2.5 space-y-2">{children}</dl>
    </section>
  );
}

export default function TeamCard({
  member,
  baseUrl = "/manager/team",
  animationIndex = 0,
}: TeamCardProps) {
  const isSupervisor = member.role === "SUPERVISOR";
  const isActive = member.isActive;
  const roleLabel = getRoleLabel(member);
  const RoleIcon = isSupervisor ? ShieldCheck : UserRoundCheck;
  const motionIndex = Math.min(animationIndex, 5);
  const email = member.email || "";
  const phone = member.phone || "";
  const assignment = getTeamMemberAssignment(member);
  const reportsTo = assignment.reportsTo;
  const joinedDate = formatDate(member.joinedDate || member.dateOfRecruitment);
  const lastLogin = formatDate(member.lastLogin);
  const employeeId = member.employeeId || "";
  const iqama = member.iqama || "";
  const territoryLabel = assignment.territory || "Not assigned";
  const reportsToLabel = reportsTo || "Not assigned";
  const hasIncompleteAssignment = !assignment.isComplete;
  const footerMessage = hasIncompleteAssignment
    ? "Territory assignment incomplete"
    : "Territory assigned";
  const footerTitle = hasIncompleteAssignment
    ? [
        !assignment.hasTerritory ? "Territory has not been assigned." : "",
        !assignment.hasReporting
          ? "Reporting manager or supervisor has not been assigned."
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return (
    <Card
      className="team-member-card team-card-enter border-gp-border-default bg-gp-surface-card shadow-gp-card group/card relative h-full gap-0 overflow-hidden rounded-[14px] border py-0"
      style={
        {
          "--team-card-delay": `${motionIndex * 50}ms`,
        } as CSSProperties
      }
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {member.avatar ? (
              <SafeCldImage
                src={member.avatar}
                alt={`Profile photo of ${member.name}`}
                width={60}
                height={60}
                className="team-member-avatar border-gp-gold-300 shadow-gp-card size-[60px] shrink-0 rounded-full border-2 object-cover"
              />
            ) : (
              <div
                className="team-member-avatar border-gp-gold-300 bg-gp-navy-900 text-gp-gold-100 shadow-gp-card flex size-[60px] shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold"
                role="img"
                aria-label={`Avatar for ${member.name}`}
              >
                {getInitials(member.name)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3
                className="team-member-name text-gp-navy-900 text-base leading-5 font-semibold sm:text-[17px]"
                title={member.name}
                dir="auto"
              >
                {member.name}
              </h3>

              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "team-role-chip inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                    isSupervisor
                      ? "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900"
                      : "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
                  )}
                >
                  <RoleIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{roleLabel}</span>
                </span>
                <span
                  aria-label={`Status: ${isActive ? "Active" : "Inactive"}`}
                  className={cn(
                    "team-status-badge inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap",
                    isActive
                      ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                      : "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
                  )}
                >
                  <span
                    className="size-1.5 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p
                className="text-gp-text-muted mt-2 flex min-w-0 items-start gap-2 text-sm font-medium"
                dir="ltr"
              >
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span
                  className="min-w-0 truncate"
                  title={email || "Email not provided"}
                >
                  {email || "Email not provided"}
                </span>
              </p>
            </div>
          </div>

          <dl className="team-assignment-summary border-gp-border-subtle bg-gp-surface-subtle grid min-w-0 gap-2 rounded-[12px] border px-3.5 py-3 text-[13px] leading-5 lg:w-[260px] lg:shrink-0">
            <div className="flex min-w-0 items-start gap-2">
              <MapPinned
                className="text-gp-gold-600 mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                  Territory
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 font-semibold break-words",
                    assignment.territory
                      ? "text-gp-navy-900"
                      : "text-gp-text-placeholder",
                  )}
                  title={territoryLabel}
                >
                  {territoryLabel}
                </dd>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <Users
                className="text-gp-gold-600 mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                  Reports to
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 font-semibold break-words",
                    reportsTo ? "text-gp-navy-900" : "text-gp-text-placeholder",
                  )}
                  title={reportsToLabel}
                >
                  {reportsToLabel}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="border-gp-border-subtle mt-4 grid grid-cols-1 gap-4 border-t pt-3.5 md:grid-cols-2">
          <DetailGroup icon={IdCard} title="Employee Information">
            <DetailItem
              label="Employee ID"
              value={employeeId}
              dir="ltr"
              preserve
              fallback="Not assigned"
            />
            <DetailItem label="Iqama" value={iqama} dir="ltr" />
            <DetailItem label="Phone" value={phone} dir="ltr" />
          </DetailGroup>

          <DetailGroup icon={BriefcaseBusiness} title="Field Assignment">
            <DetailItem
              label="District"
              value={assignment.district}
              fallback="Not assigned"
            />
            <DetailItem
              label="Region"
              value={assignment.region}
              fallback="Not assigned"
            />
            {isSupervisor && member.repsCount !== undefined && (
              <DetailItem
                label="Team"
                value={`${member.repsCount} Medical Reps`}
              />
            )}
          </DetailGroup>
        </div>

        <div className="team-card-meta text-gp-text-muted mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
          <CalendarDays
            className="text-gp-gold-600 size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">
            Joined {joinedDate || "Not available"}
          </span>
          <span aria-hidden="true">{"\u2022"}</span>
          <BadgeCheck
            className="text-gp-gold-600 size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">
            Last login {lastLogin || "Never"}
          </span>
        </div>

        <footer className="border-gp-border-subtle mt-auto flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "min-w-0 text-[13px] leading-5 font-medium",
              hasIncompleteAssignment ? "text-gp-gold-700" : "text-gp-success",
            )}
            title={footerTitle}
          >
            {hasIncompleteAssignment ? (
              <AlertTriangle
                className="mr-1.5 inline size-3.5 align-[-2px]"
                aria-hidden="true"
              />
            ) : (
              <BadgeCheck
                className="text-gp-success mr-1.5 inline size-3.5 align-[-2px]"
                aria-hidden="true"
              />
            )}
            {footerMessage}
          </p>

          <Link
            href={`${baseUrl}/${member.id}`}
            aria-label={`View profile for ${member.name}`}
            className="team-profile-action group/action border-gp-navy-900 bg-gp-navy-900 hover:bg-gp-navy-850 hover:text-white focus-visible:ring-gp-gold-500/30 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border px-5 text-sm font-semibold whitespace-nowrap text-white shadow-[0_6px_16px_rgba(16,29,54,0.2)] transition-[background-color,border-color,box-shadow,transform,color] duration-200 ease-out hover:-translate-y-0.5 hover:border-gp-navy-900 hover:shadow-lg focus-visible:ring-3 focus-visible:outline-none active:translate-y-0 active:scale-[0.99] active:shadow-[0_3px_10px_rgba(16,29,54,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
          >
            <span className="team-profile-action-text text-white group-hover/action:text-white">
              View Profile
            </span>
            <ArrowRight
              className="team-profile-action-icon text-gp-gold-500 size-4 shrink-0"
              aria-hidden="true"
            />
          </Link>
        </footer>
      </CardContent>
    </Card>
  );
}
