"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import AddVisitDialog from "./AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import { getManagerTeamAction } from "@/features/team/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { User } from "@/features/team/lib/types";

type VisitsHeaderProps = {
  role: UserRole;
  stats: {
    total: number;
    completed: number;
    today: number;
  };
};

type VisitSummaryCardProps = {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: "navy" | "green" | "gold";
  animationDelay: string;
};

const summaryToneStyles: Record<VisitSummaryCardProps["tone"], string> = {
  navy: "bg-[#EEF4FF] text-[#3972D5]",
  green: "bg-[#E9F8F1] text-[#168557]",
  gold: "bg-[#FFF3D7] text-[#B18732]",
};

function VisitSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
  animationDelay,
}: VisitSummaryCardProps) {
  return (
    <article
      className="visits-kpi-card visits-page-enter group/kpi flex min-h-[112px] items-start justify-between gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none"
      style={
        {
          "--visits-enter-delay": animationDelay,
        } as CSSProperties
      }
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
          {label}
        </p>
        <p className="mt-2 text-2xl leading-none font-semibold text-[#182033]">
          {value.toLocaleString()}
        </p>
        <p className="mt-2 truncate text-xs font-medium text-[#8A94A6]">
          {helper}
        </p>
      </div>
      <span
        className={`visits-kpi-icon-shell visits-kpi-icon-shell-${tone} flex size-10 shrink-0 items-center justify-center rounded-[10px] ${summaryToneStyles[tone]}`}
      >
        <Icon className="visits-kpi-icon size-5" aria-hidden="true" />
      </span>
    </article>
  );
}

export default function VisitsHeader({ role, stats }: VisitsHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<DoctorApiResponse[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [medicalReps, setMedicalReps] = useState<User[]>([]);

  const addVisitPath =
    role === "MANAGER"
      ? "/manager/visits/add"
      : role === "SUPERVISOR"
        ? "/supervisor/visits/add"
        : "/rep/visits/add";

  useEffect(() => {
    if (dialogOpen && doctors.length === 0) {
      const fetchData = async () => {
        const doctorsRes = await getDoctorsAction(
          undefined,
          undefined,
          undefined,
          false,
        );
        if (doctorsRes.success && doctorsRes.data) {
          setDoctors(doctorsRes.data);
        }

        if (role === "MANAGER" || role === "SUPERVISOR") {
          const teamRes = await getManagerTeamAction();
          if (teamRes.success) {
            setSupervisors(teamRes.supervisors || []);
            setMedicalReps(teamRes.medicalReps || []);
          }
        }
      };
      fetchData();
    }
  }, [dialogOpen, doctors.length, role]);

  const summaryCards = [
    {
      id: "total-visits",
      label: "Total Visits",
      value: stats.total,
      helper: "All scheduled records",
      icon: CalendarDays,
      tone: "navy" as const,
      animationDelay: "0ms",
    },
    {
      id: "completed-visits",
      label: "Completed",
      value: stats.completed,
      helper: "Reports submitted",
      icon: CheckCircle2,
      tone: "green" as const,
      animationDelay: "60ms",
    },
    {
      id: "today-visits",
      label: "Today",
      value: stats.today,
      helper: "Scheduled for today",
      icon: Clock3,
      tone: "gold" as const,
      animationDelay: "120ms",
    },
  ];

  return (
    <>
      <div className="space-y-5">
        <header className="visits-page-enter flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-tight font-semibold text-[#182033] sm:text-[30px]">
              Visit Calendar
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#667085]">
              Track and manage medical rep visits, schedules, and completion
              reports.
            </p>
          </div>

          <div className="w-full shrink-0 sm:w-auto">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="visits-add-trigger group h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-[#C9A44C] px-5 text-sm font-semibold text-[#182033] shadow-[0_8px_18px_rgba(201,164,76,0.18)] transition-[background-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px hover:bg-[#B18732] hover:text-white hover:shadow-[0_12px_26px_rgba(201,164,76,0.24)] focus-visible:ring-[3px] focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto"
            >
              <CalendarPlus
                className="visits-add-trigger-icon h-4 w-4"
                aria-hidden="true"
              />
              Add Visit
            </Button>

            <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
              Add Visit Page
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <VisitSummaryCard
              key={card.id}
              label={card.label}
              value={card.value}
              helper={card.helper}
              icon={card.icon}
              tone={card.tone}
              animationDelay={card.animationDelay}
            />
          ))}
        </section>
      </div>

      {/* Add Visit Modal Overlay */}
      {dialogOpen && (
        <AddVisitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          role={role as "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"}
          doctors={doctors}
          supervisors={supervisors}
          medicalReps={medicalReps}
        />
      )}
    </>
  );
}
