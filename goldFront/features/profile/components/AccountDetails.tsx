"use client";

import type { CSSProperties } from "react";
import {
  BookUser,
  CalendarDays,
  CalendarRange,
  Clock,
  IdCard,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSaudiDateTimeDisplay, formatSaudiMonthYear } from "@/lib/utils";
import { UserProfile } from "../lib/types";
import { profileCardClass } from "../lib/utils";
import { useInView } from "../lib/use-in-view";
import { InfoField, MutedValue } from "./InfoField";

function StatusValue({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm font-semibold ${
        active ? "text-emerald-700" : "text-dashboard-red"
      }`}
    >
      <span
        className={`profile-status-dot size-2 rounded-full ${
          active ? "bg-emerald-500" : "bg-dashboard-red"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function AccountDetails({ profile }: { profile: UserProfile }) {
  const { ref, visible } = useInView<HTMLElement>(0.2);
  const isRep = profile.role === "MEDICAL_REP";

  return (
    <section
      ref={ref}
      aria-label="Account details"
      className={cn(
        `${profileCardClass} p-5`,
        "profile-inview",
        visible && "profile-inview-visible",
      )}
      style={{ "--profile-delay": "240ms" } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#EEF1F6] pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 ring-inset">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-[#182033]">
              Account Details
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <InfoField
          label="Date of Birth"
          icon={CalendarDays}
          accent={isRep ? "green" : "gold"}
          delay={40}
        >
          {profile.dateOfBirth ? (
            formatSaudiMonthYear(new Date(profile.dateOfBirth))
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

        <InfoField label="Iqama Number" icon={IdCard} accent="blue" delay={120}>
          {profile.iqamaNumber?.trim() ? (
            profile.iqamaNumber.trim()
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField
          label="Passport Number"
          icon={BookUser}
          accent="purple"
          delay={160}
        >
          {profile.passportNumber?.trim() ? (
            profile.passportNumber.trim()
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField label="Last Login" icon={Clock} accent="teal" delay={200}>
          {profile.lastLogin ? (
            formatSaudiDateTimeDisplay(new Date(profile.lastLogin))
          ) : (
            <MutedValue>Not available</MutedValue>
          )}
        </InfoField>

        <InfoField
          label="Leave Days"
          icon={CalendarRange}
          accent="green"
          delay={240}
        >
          {profile.leaveDaysCountTotal} days
        </InfoField>

        <InfoField
          label="Profile Created"
          icon={UserPlus}
          accent={isRep ? "green" : "gold"}
          delay={280}
        >
          {formatSaudiDateTimeDisplay(new Date(profile.createdAt))}
        </InfoField>

        <InfoField
          label="Last Updated"
          icon={RefreshCw}
          accent="blue"
          delay={320}
        >
          {formatSaudiDateTimeDisplay(new Date(profile.updatedAt))}
        </InfoField>
      </div>
    </section>
  );
}
