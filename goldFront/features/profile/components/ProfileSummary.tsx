"use client";

import type { CSSProperties } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  Fingerprint,
} from "lucide-react";
import { cn, formatSaudiDateDisplay } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import {
  getFreshnessLabel,
  getDisplayEmployeeId,
  getTenureSummary,
  profileCardClass,
} from "../lib/utils";

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null): string {
  const date = parseDate(value);
  return date ? formatSaudiDateDisplay(date) : "Not available";
}

function formatTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "No login recorded";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

type ProfileSummaryProps = {
  profile: UserProfile;
  variant?: "standard" | "manager";
};

export default function ProfileSummary({
  profile,
  variant = "standard",
}: ProfileSummaryProps) {
  const leaveDays = Number.isFinite(Number(profile.leaveDaysCountTotal))
    ? Number(profile.leaveDaysCountTotal)
    : 0;
  const cards = [
    {
      label: variant === "manager" ? "TENURE" : "TENURE",
      value: getTenureSummary(profile.dateOfRecruitment),
      detail: `Joined ${formatDate(profile.dateOfRecruitment)}`,
      icon: CalendarClock,
      tone: "gold",
      iconClass: "bg-gold-50 text-gold-600 ring-gold-300/50",
    },
    {
      label: variant === "manager" ? "LEAVE BALANCE" : "LEAVE",
      value: `${leaveDays.toLocaleString()}${variant === "manager" ? " days" : ""}`,
      detail: variant === "manager" ? "Available leave" : "Days remaining",
      icon: BriefcaseBusiness,
      tone: "navy",
      iconClass: "bg-gp-surface-subtle text-gp-navy-900 ring-gp-border-control",
    },
    {
      label: variant === "manager" ? "LAST LOGIN" : "LOGIN",
      value: getFreshnessLabel(profile.lastLogin),
      detail: formatTime(profile.lastLogin),
      icon: Clock3,
      tone: "navy",
      iconClass: "bg-gp-surface-subtle text-gp-navy-900 ring-gp-border-control",
    },
    {
      label: variant === "manager" ? "EMPLOYEE ID" : "ID",
      value: getDisplayEmployeeId(profile.id),
      detail: profile.isActive ? "Verified" : "Inactive",
      icon: Fingerprint,
      tone: "navyGold",
      iconClass: "bg-gp-navy-900 text-gp-gold-500 ring-gp-navy-900",
    },
  ];

  if (variant === "manager") {
    const toneStyles = {
      gold: {
        shell: "manager-profile-icon-container-gold",
        hover: "",
        rail: "bg-gp-gold-500",
      },
      navy: {
        shell: "manager-profile-icon-container-navy",
        hover: "",
        rail: "bg-gp-navy-900",
      },
      navyGold: {
        shell: "manager-profile-icon-container-navy-solid",
        hover: "",
        rail: "bg-gp-gold-500",
      },
      neutral: {
        shell: "manager-profile-icon-container-neutral",
        hover: "",
        rail: "bg-gp-border-control",
      },
    } as const;

    return (
      <section
        aria-label="Profile summary cards"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          const tone = toneStyles[card.tone as keyof typeof toneStyles];

          return (
            <article
              key={card.label}
              className="profile-stat-card manager-profile-kpi group/card border-gp-border-default bg-gp-surface-card shadow-gp-card relative min-h-[112px] overflow-hidden rounded-[14px] border p-0"
              style={
                {
                  "--profile-delay": `${70 + index * 60}ms`,
                } as CSSProperties
              }
            >
              <span
                className={`manager-profile-kpi-rail absolute top-0 bottom-0 left-0 w-[3px] ${tone.rail}`}
                aria-hidden="true"
              />
              <div className="flex h-full items-center gap-4 py-4 pr-5 pl-[22px] sm:py-5">
                <span
                  className={cn(
                    "manager-profile-kpi-icon flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
                    tone.shell,
                    tone.hover,
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
                    {card.label}
                  </p>
                  <p className="manager-profile-kpi-value text-gp-navy-900 mt-1.5 truncate text-2xl leading-none font-semibold">
                    {card.value}
                  </p>
                  <p className="text-gp-text-placeholder mt-1.5 truncate text-xs font-medium">
                    {card.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    );
  }

  return (
    <section
      aria-label="Profile summary cards"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className={cn(`${profileCardClass} profile-stat-card p-5`)}
            style={
              {
                "--profile-delay": `${50 + index * 50}ms`,
              } as CSSProperties
            }
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg ring-1 ring-inset",
                card.iconClass,
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>

            <p className="mt-4 text-2xl leading-7 font-semibold text-[#182033]">
              {card.value}
            </p>
            <p className="mt-1 text-[11px] font-bold tracking-wide text-[#667085]">
              {card.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#7B8797]">
              {card.detail}
            </p>
          </article>
        );
      })}
    </section>
  );
}
