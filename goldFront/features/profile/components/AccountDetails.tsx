"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  BookUser,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  Copy,
  Fingerprint,
  IdCard,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSaudiDateTimeDisplay, formatSaudiMonthYear } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserProfile } from "../lib/types";
import { getDisplayEmployeeId, profileCardClass } from "../lib/utils";
import { useInView } from "../lib/use-in-view";
import { InfoField, MutedValue } from "./InfoField";

function StatusValue({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold ${
        active ? "text-gp-success" : "text-gp-text-muted"
      }`}
    >
      <span
        className={`profile-status-dot size-2 rounded-full ${
          active ? "bg-gp-success" : "bg-gp-text-placeholder"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatProfileMonthYear(
  value?: string | null,
  fallback = "Not specified",
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return formatSaudiMonthYear(date);
}

function formatProfileDateTime(
  value?: string | null,
  fallback = "Not available",
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return formatSaudiDateTimeDisplay(date);
}

function ManagerStatusValue({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold ${
        active
          ? "bg-gp-success-soft text-gp-success"
          : "bg-gp-surface-control text-gp-text-muted"
      }`}
    >
      <span
        className={`size-2 rounded-full ${
          active ? "bg-gp-success" : "bg-gp-text-placeholder"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CopyEmployeeId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Employee ID copied" : "Copy employee ID"}
          className={cn(
            "manager-profile-copy-button focus-visible:ring-gp-navy-900/15 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border transition-[border-color,color,background-color,box-shadow,transform] duration-[190ms] ease-out focus-visible:ring-3 focus-visible:outline-none",
            copied
              ? "border-gp-success-border bg-gp-success-soft text-gp-success"
              : "border-gp-border-control text-gp-navy-900 hover:border-gp-navy-900/20 hover:bg-gp-surface-subtle bg-white",
          )}
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gp-navy-900 text-white">
        {copied ? "Copied" : "Copy"}
      </TooltipContent>
    </Tooltip>
  );
}

type AccountDetailsProps = {
  profile: UserProfile;
  variant?: "standard" | "manager";
};

type ManagerAccountRow = {
  label: string;
  value: ReactNode;
  muted?: boolean;
  action?: ReactNode;
};

type ManagerAccountSection = {
  title: string;
  icon: typeof Fingerprint;
  iconTone: "gold" | "navy";
  rows: ManagerAccountRow[];
};

export default function AccountDetails({
  profile,
  variant = "standard",
}: AccountDetailsProps) {
  const { ref, visible } = useInView<HTMLElement>(0.2);
  const employeeId = getDisplayEmployeeId(profile.id);
  const leaveDays = Number.isFinite(Number(profile.leaveDaysCountTotal))
    ? Number(profile.leaveDaysCountTotal)
    : 0;

  if (variant === "manager") {
    const sections: ManagerAccountSection[] = [
      {
        title: "Identification",
        icon: Fingerprint,
        iconTone: "gold",
        rows: [
          {
            label: "Employee ID",
            value: employeeId,
            action:
              employeeId !== "Not available" ? (
                <CopyEmployeeId value={employeeId} />
              ) : undefined,
          },
          {
            label: "Iqama",
            value: profile.iqamaNumber?.trim() || "Not available",
            muted: !profile.iqamaNumber?.trim(),
          },
          {
            label: "Passport",
            value: profile.passportNumber?.trim() || "Not available",
            muted: !profile.passportNumber?.trim(),
          },
          {
            label: "Date of birth",
            value: formatProfileMonthYear(profile.dateOfBirth),
            muted: !profile.dateOfBirth,
          },
        ],
      },
      {
        title: "Account",
        icon: ShieldCheck,
        iconTone: "navy",
        rows: [
          {
            label: "Account Status",
            value: <ManagerStatusValue active={profile.isActive} />,
          },
          {
            label: "Profile Created",
            value: formatProfileDateTime(profile.createdAt),
          },
          {
            label: "Last Updated",
            value: formatProfileDateTime(profile.updatedAt),
          },
        ],
      },
      {
        title: "Activity",
        icon: Clock,
        iconTone: "navy",
        rows: [
          {
            label: "Last Login",
            value: formatProfileDateTime(profile.lastLogin),
            muted: !profile.lastLogin,
          },
          {
            label: "Leave Balance",
            value: `${leaveDays.toLocaleString()} days`,
          },
        ],
      },
    ];

    return (
      <section
        ref={ref}
        aria-label="Account and security"
        className={cn(
          `${profileCardClass} overflow-hidden p-0`,
          "profile-inview",
          visible && "profile-inview-visible",
        )}
        style={{ transitionDelay: "190ms" } as CSSProperties}
      >
        <header className="border-gp-border-subtle flex items-start gap-3 border-b px-5 py-5">
          <span className="profile-section-icon manager-profile-icon-container-navy flex size-10 shrink-0 items-center justify-center rounded-[12px] ring-1 ring-inset">
            <Fingerprint className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-gp-navy-900 text-lg font-semibold">
              Account &amp; Security
            </h2>
            <p className="text-gp-text-muted mt-1 text-sm leading-5 font-medium">
              Identification, access status and account lifecycle.
            </p>
          </div>
        </header>

        <div className="divide-gp-border-subtle divide-y">
          {sections.map((section, sectionIndex) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="manager-profile-account-group p-5"
                style={
                  {
                    "--profile-delay": `${220 + sectionIndex * 55}ms`,
                  } as CSSProperties
                }
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="bg-gp-gold-500 h-5 w-0.5 rounded-full"
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-[9px] border",
                      section.iconTone === "gold"
                        ? "manager-profile-icon-container-gold"
                        : "manager-profile-icon-container-navy",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-gp-navy-800 text-xs font-semibold tracking-[0.05em] uppercase">
                    {section.title}
                  </p>
                </div>

                <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border">
                  {section.rows.map((row) => (
                    <div
                      key={row.label}
                      className="manager-profile-account-row border-gp-border-subtle flex min-w-0 items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                    >
                      <span className="text-gp-text-muted text-sm font-medium">
                        {row.label}
                      </span>
                      <span
                        className={cn(
                          "text-gp-navy-900 flex min-w-0 items-center gap-2 text-right text-sm font-semibold break-words",
                          row.muted && "text-gp-text-placeholder italic",
                        )}
                      >
                        {row.value}
                        {row.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-label="Account details"
      className={cn(
        `${profileCardClass} p-5`,
        "profile-inview",
        visible && "profile-inview-visible",
      )}
      style={{ transitionDelay: "150ms" } as CSSProperties}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="profile-section-icon text-gp-navy-900 bg-gp-surface-subtle ring-gp-border-control flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset">
            <Fingerprint className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#182033]">
              Account Details
            </h3>
            <p className="mt-1 text-xs text-[#667085]">
              Account status, identification and lifecycle metadata.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F6F8FB] px-3 py-1 text-xs font-semibold text-[#667085] ring-1 ring-[#E5E8EF] ring-inset">
          <Fingerprint className="size-3.5" aria-hidden />
          {employeeId}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <InfoField
          label="Date of Birth"
          icon={CalendarDays}
          accent="navy"
          delay={40}
        >
          {profile.dateOfBirth ? (
            formatProfileMonthYear(profile.dateOfBirth)
          ) : (
            <MutedValue>Not specified</MutedValue>
          )}
        </InfoField>

        <InfoField
          label="Account Status"
          icon={ShieldCheck}
          accent={profile.isActive ? "green" : "slate"}
          delay={80}
        >
          <StatusValue active={profile.isActive} />
        </InfoField>

        <InfoField label="Iqama Number" icon={IdCard} accent="navy" delay={120}>
          {profile.iqamaNumber?.trim() ? (
            profile.iqamaNumber.trim()
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField
          label="Passport Number"
          icon={BookUser}
          accent="navy"
          delay={160}
        >
          {profile.passportNumber?.trim() ? (
            profile.passportNumber.trim()
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField label="Last Login" icon={Clock} accent="navy" delay={200}>
          {profile.lastLogin ? (
            formatProfileDateTime(profile.lastLogin)
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField
          label="Leave Days"
          icon={CalendarRange}
          accent="navy"
          delay={240}
        >
          {profile.leaveDaysCountTotal} days
        </InfoField>

        <InfoField
          label="Profile Created"
          icon={UserPlus}
          accent="navy"
          delay={280}
        >
          {formatProfileDateTime(profile.createdAt)}
        </InfoField>

        <InfoField
          label="Last Updated"
          icon={RefreshCw}
          accent="navy"
          delay={320}
        >
          {formatProfileDateTime(profile.updatedAt)}
        </InfoField>
      </div>
    </section>
  );
}
