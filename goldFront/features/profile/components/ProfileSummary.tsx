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

export default function ProfileSummary({ profile }: { profile: UserProfile }) {
  const cards = [
    {
      label: "TENURE",
      value: getTenureSummary(profile.dateOfRecruitment),
      detail: `Joined ${formatDate(profile.dateOfRecruitment)}`,
      icon: CalendarClock,
      iconClass: "bg-gold-50 text-gold-600 ring-gold-300/50",
    },
    {
      label: "LEAVE",
      value: `${profile.leaveDaysCountTotal}`,
      detail: "Days remaining",
      icon: BriefcaseBusiness,
      iconClass: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    },
    {
      label: "LOGIN",
      value: getFreshnessLabel(profile.lastLogin),
      detail: formatTime(profile.lastLogin),
      icon: Clock3,
      iconClass: "bg-blue-50 text-[#3972D5] ring-blue-200",
    },
    {
      label: "ID",
      value: profile.id.slice(-8).toUpperCase(),
      detail: profile.isActive ? "Verified" : "Inactive",
      icon: Fingerprint,
      iconClass: "bg-violet-50 text-[#7857C8] ring-violet-200",
    },
  ];

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
