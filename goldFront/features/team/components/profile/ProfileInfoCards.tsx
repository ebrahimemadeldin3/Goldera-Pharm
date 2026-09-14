"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  BookUser,
  Cake,
  CalendarDays,
  Check,
  ClipboardCopy,
  FileText,
  Files,
  GraduationCap,
  Info,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cn,
  formatSaudiDateDisplay,
  formatSaudiDateTimeDisplay,
  getSaudiDateParts,
  parseDateValue,
} from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import type { User } from "@/features/team/lib/types";
import { getTeamMemberAssignment } from "@/features/team/lib/utils";

type InformationRowProps = {
  icon: LucideIcon;
  label: string;
  tooltip?: string;
  delay?: number;
  children: ReactNode;
  className?: string;
};

type CopyableValueProps = {
  value?: string | null;
  label: string;
  fallback?: string;
  className?: string;
};

type DocumentTileProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  href?: string;
};

export type ProfileTabId = "overview" | "documents" | "team" | "performance";

export type ProfileTabItem = {
  id: ProfileTabId;
  label: string;
  icon: LucideIcon;
};

function hasText(value?: string | null) {
  return Boolean(value && value.trim());
}

export function formatMaybeDate(value?: string | null, withTime = false) {
  if (!hasText(value)) return "";

  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return "";

  try {
    const formatted = withTime
      ? formatSaudiDateTimeDisplay(date)
      : formatSaudiDateDisplay(date);

    return withTime ? formatted.replace(/, (?=\d{1,2}:)/, " • ") : formatted;
  } catch {
    return "";
  }
}

function splitDocumentList(value?: string) {
  const text = value?.trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }
  } catch {
    // The member mapper also supports a simple comma-separated display value.
  }

  return text
    .split(/,\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getUsableHref(value?: string | null) {
  if (!hasText(value)) return undefined;

  const trimmed = value!.trim();
  if (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:application/pdf") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }

  return undefined;
}

export function formatRoleLabel(role?: User["role"]) {
  if (role === "MEDICAL_REP") return "Medical Representative";
  if (role === "SUPERVISOR") return "Supervisor";
  if (role === "MANAGER") return "Manager";
  return role || "Not assigned";
}

export function getTerritoryLabel(data: Pick<User, "region" | "location">) {
  const assignment = getTeamMemberAssignment(data as User);

  return [assignment.district, assignment.region, assignment.territory]
    .filter(Boolean)
    .join(" / ");
}

export function getServiceDuration(
  data: Pick<User, "yearsOfService" | "joinedDate" | "dateOfRecruitment">,
) {
  const value = data.dateOfRecruitment || data.joinedDate;
  if (!hasText(value)) {
    return typeof data.yearsOfService === "number" &&
      Number.isFinite(data.yearsOfService)
      ? `${Math.max(0, data.yearsOfService)} ${
          data.yearsOfService === 1 ? "year" : "years"
        }`
      : "";
  }

  try {
    const joinedDate = parseDateValue(value as string);
    if (Number.isNaN(joinedDate.getTime())) return "";

    const start = getSaudiDateParts(joinedDate);
    const today = getSaudiDateParts(new Date());
    const startYear = Number(start.year);
    const startMonth = Number(start.month);
    const startDay = Number(start.day);
    const currentYear = Number(today.year);
    const currentMonth = Number(today.month);
    const currentDay = Number(today.day);

    let totalMonths =
      (currentYear - startYear) * 12 + (currentMonth - startMonth);
    if (currentDay < startDay) totalMonths -= 1;
    if (totalMonths < 0) return "";
    if (totalMonths === 0) return "Less than a month";

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const yearLabel = `${years} ${years === 1 ? "year" : "years"}`;
    const monthLabel = `${months} ${months === 1 ? "month" : "months"}`;

    if (years === 0) return monthLabel;
    if (months === 0) return yearLabel;
    return `${yearLabel} ${monthLabel}`;
  } catch {
    return "";
  }
}

export function getServiceYears(
  data: Pick<User, "yearsOfService" | "joinedDate">,
) {
  if (hasText(data.joinedDate)) {
    const joinedDate = new Date(data.joinedDate);
    if (!Number.isNaN(joinedDate.getTime())) {
      const start = getSaudiDateParts(joinedDate);
      const today = getSaudiDateParts(new Date());
      const startMonthDay = `${start.month}-${start.day}`;
      const todayMonthDay = `${today.month}-${today.day}`;
      const completedYears =
        Number(today.year) -
        Number(start.year) -
        (todayMonthDay < startMonthDay ? 1 : 0);

      return Math.max(0, completedYears);
    }
  }

  if (
    typeof data.yearsOfService === "number" &&
    Number.isFinite(data.yearsOfService)
  ) {
    return Math.max(0, data.yearsOfService);
  }

  return null;
}

export function MissingValue({
  children = "Not provided",
}: {
  children?: ReactNode;
}) {
  return (
    <span className="text-gp-text-placeholder font-medium">{children}</span>
  );
}

export function RolePill({ role }: { role: User["role"] }) {
  const isSupervisor = role === "SUPERVISOR";
  const Icon = isSupervisor ? ShieldCheck : UserRound;

  return (
    <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{formatRoleLabel(role)}</span>
    </span>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        active
          ? "border-gp-success-border bg-gp-success-soft text-gp-success"
          : "border-gp-border-control bg-gp-surface-control text-gp-text-secondary",
      )}
    >
      <span
        className="member-profile-status-dot size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function CopyableValue({
  value,
  label,
  fallback = "Not provided",
  className,
}: CopyableValueProps) {
  const [copied, setCopied] = useState(false);
  const text = value?.trim() || "";
  const canCopy = Boolean(text);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success({ title: `${label} copied` });
    } catch {
      toast.error({
        title: `Could not copy ${label.toLowerCase()}`,
        description: "Clipboard access is not available.",
      });
    }
  }

  return (
    <span
      className={cn(
        "group/copy inline-flex max-w-full min-w-0 items-center gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "min-w-0 break-words",
          canCopy ? "text-gp-text-primary" : "text-gp-text-placeholder",
        )}
        title={canCopy ? text : undefined}
        dir="auto"
      >
        {canCopy ? text : fallback}
      </span>
      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={
            copied ? `${label} copied` : `Copy ${label.toLowerCase()}`
          }
          className="member-profile-copy-button text-gp-text-placeholder hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex size-7 shrink-0 items-center justify-center rounded-full opacity-100 focus-visible:ring-2 focus-visible:outline-none sm:opacity-0 sm:group-focus-within/copy:opacity-100 sm:group-hover/copy:opacity-100"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <ClipboardCopy className="size-3.5" aria-hidden="true" />
          )}
        </button>
      )}
    </span>
  );
}

function InfoTooltip({ label, children }: { label: string; children: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${label} information`}
          className="text-gp-text-placeholder hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex size-5 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2"
        >
          <Info className="size-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={8}
        className="bg-gp-navy-900 shadow-gp-popover max-w-[260px] rounded-[8px] border-0 text-white"
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

export function InformationRow({
  icon: Icon,
  label,
  tooltip,
  delay = 0,
  children,
  className,
}: InformationRowProps) {
  return (
    <div
      className={cn(
        "member-profile-info-row group/row border-gp-border-subtle flex min-w-0 items-start gap-3 border-b px-2 py-3.5 last:border-b-0",
        className,
      )}
      style={
        {
          "--member-profile-row-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      <span className="member-profile-info-icon bg-gp-surface-subtle text-gp-text-muted flex size-8 shrink-0 items-center justify-center rounded-[9px]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(116px,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-4">
        <dt className="text-gp-text-muted flex items-center gap-1 text-xs font-semibold">
          <span>{label}</span>
          {tooltip && <InfoTooltip label={label}>{tooltip}</InfoTooltip>}
        </dt>
        <dd className="text-gp-text-primary min-w-0 text-sm leading-5 font-semibold break-words">
          {children}
        </dd>
      </div>
    </div>
  );
}

export function ProfilePanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="border-gp-border-subtle flex min-w-0 items-start gap-3 border-b pb-4">
      <span className="member-profile-panel-icon bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px]">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-gp-navy-900 text-base leading-6 font-semibold">
          {title}
        </h2>
        <p className="text-gp-text-muted mt-0.5 text-xs leading-5 font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}

export function ProfileNavigation({
  items,
  activeTab,
  onTabChange,
}: {
  items: ProfileTabItem[];
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeTab),
  );

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + items.length) % items.length;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % items.length;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTab = items[nextIndex].id;
    onTabChange(nextTab);
    window.requestAnimationFrame(() => refs.current[nextTab]?.focus());
  }

  return (
    <nav
      aria-label="Member profile sections"
      className="member-profile-section-enter member-profile-nav border-gp-border-default bg-gp-surface-card rounded-[14px] border px-2"
      style={{ "--member-profile-delay": "210ms" } as CSSProperties}
    >
      <div className="member-profile-nav-scroll max-w-full overflow-x-auto">
        <div
          role="tablist"
          aria-label="Member profile sections"
          className="relative grid h-12 min-w-max items-center"
          style={
            {
              gridTemplateColumns: `repeat(${items.length}, minmax(132px, 1fr))`,
              "--member-profile-nav-count": items.length,
              "--member-profile-nav-index": activeIndex,
            } as CSSProperties
          }
        >
          <span className="member-profile-nav-indicator" aria-hidden="true" />
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;

            return (
              <button
                key={item.id}
                ref={(button) => {
                  refs.current[item.id] = button;
                }}
                id={`member-profile-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`member-profile-panel-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(item.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "member-profile-nav-link focus-visible:ring-gp-gold-500/25 relative z-10 inline-flex h-full min-w-0 items-center justify-center gap-2 rounded-[9px] px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive
                    ? "bg-gp-navy-900 text-white shadow-[0_6px_14px_rgba(16,29,54,0.18)]"
                    : "text-gp-text-muted hover:text-gp-navy-800",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-gp-gold-700" : "text-gp-text-placeholder",
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function MemberInformationCard({ data }: { data: User }) {
  const dateOfBirth = formatMaybeDate(data.dateOfBirth);
  const recruitmentDate = formatMaybeDate(
    data.dateOfRecruitment || data.joinedDate,
  );

  return (
    <section className="member-profile-info-panel border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5">
      <ProfilePanelHeader
        icon={UserRound}
        title="Personal Information"
        description="Personal and employment details available for this member."
      />

      <dl className="mt-1">
        <InformationRow icon={Cake} label="Date of Birth" delay={40}>
          {dateOfBirth || <MissingValue>Not provided</MissingValue>}
        </InformationRow>
        <InformationRow icon={GraduationCap} label="Education" delay={80}>
          {data.education ? (
            <span title={data.education}>{data.education}</span>
          ) : (
            <MissingValue>No education record</MissingValue>
          )}
        </InformationRow>
        <InformationRow
          icon={CalendarDays}
          label="Recruitment Date"
          delay={120}
        >
          {recruitmentDate || <MissingValue>Not provided</MissingValue>}
        </InformationRow>
      </dl>
    </section>
  );
}

function DocumentTile({ icon: Icon, label, value, href }: DocumentTileProps) {
  return (
    <article className="member-profile-document-tile border-gp-border-default bg-gp-surface-subtle flex min-h-[132px] min-w-0 flex-col rounded-[14px] border p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="member-profile-panel-icon bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-gp-navy-850 text-sm font-semibold">{label}</h3>
          <div className="text-gp-text-secondary mt-1.5 text-sm leading-5 font-medium break-words">
            {value}
          </div>
        </div>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="member-profile-document-action text-gp-navy-850 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 mt-auto inline-flex w-fit items-center gap-1.5 rounded-[8px] pt-3 text-xs font-bold focus-visible:ring-2 focus-visible:outline-none"
        >
          View
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export function DocumentsEmploymentCard({ data }: { data: User }) {
  const certificates = splitDocumentList(data.certificates);
  const certificateHref = certificates.map(getUsableHref).find(Boolean);
  const resumeHref = getUsableHref(data.resume);
  const hasDocuments = Boolean(
    data.resume || certificates.length > 0 || data.iqama || data.passport,
  );

  return (
    <section className="member-profile-info-panel border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5">
      <ProfilePanelHeader
        icon={Files}
        title="Documents & Employment"
        description="Document availability from the existing member record."
      />

      {hasDocuments ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DocumentTile
            icon={FileText}
            label="CV / Resume"
            value={
              data.resume ? (
                resumeHref ? "Resume file available" : data.resume
              ) : (
                <MissingValue>No file uploaded</MissingValue>
              )
            }
            href={resumeHref}
          />
          <DocumentTile
            icon={BookOpenText}
            label="Certificates"
            value={
              certificates.length > 0 ? (
                `${certificates.length} ${
                  certificates.length === 1 ? "file" : "files"
                } available`
              ) : (
                <MissingValue>No files uploaded</MissingValue>
              )
            }
            href={certificateHref}
          />
          <DocumentTile
            icon={FileText}
            label="Iqama"
            value={data.iqama || <MissingValue>Not provided</MissingValue>}
          />
          <DocumentTile
            icon={BookUser}
            label="Passport"
            value={data.passport || <MissingValue>Not provided</MissingValue>}
          />
        </div>
      ) : (
        <div className="border-gp-border-control bg-gp-surface-subtle mt-5 rounded-[14px] border border-dashed px-5 py-10 text-center">
          <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-11 items-center justify-center rounded-full border">
            <Files className="size-5" aria-hidden="true" />
          </span>
          <p className="text-gp-navy-900 mt-4 text-sm font-semibold">
            No employee documents available.
          </p>
          <p className="text-gp-text-muted mx-auto mt-1 max-w-sm text-sm leading-6">
            Documents will appear here when they are attached to this employee
            record.
          </p>
        </div>
      )}
    </section>
  );
}
