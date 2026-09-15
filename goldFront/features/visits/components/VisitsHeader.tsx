"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";
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
  iconBg: string;
  cardBorder: string;
  isPrimary?: boolean;
  animationDelay: string;
};

function VisitSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  iconBg,
  cardBorder,
  isPrimary = false,
  animationDelay,
}: VisitSummaryCardProps) {
  return (
    <article
      className={cn(
        "visits-kpi-card visits-page-enter group/kpi flex min-h-[96px] items-start justify-between gap-4 rounded-[14px] p-4 shadow-none transition-all sm:p-4.5",
        cardBorder,
        isPrimary && "shadow-[0_4px_16px_rgba(22,133,87,0.08)]",
      )}
      style={
        {
          "--visits-enter-delay": animationDelay,
        } as CSSProperties
      }
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
            {label}
          </p>
          {isPrimary && (
            <span className="inline-flex rounded-full bg-[#168557] px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
              Primary Focus
            </span>
          )}
        </div>
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#182033]">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-[#667085]">
          {helper}
        </p>
      </div>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[10px] transition-transform duration-200 group-hover/kpi:scale-105",
          iconBg,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
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

  const pathname = usePathname();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const isManager = role === "MANAGER" || pathname?.startsWith("/manager");

  const completionPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const summaryCards = isRep
    ? [
        {
          id: "today-visits",
          label: "Today's Visits",
          value: stats.today,
          helper: "Scheduled for today",
          icon: Clock3,
          isPrimary: true,
          iconBg: "bg-[#168557] text-white shadow-xs",
          cardBorder: "border-[#CBEFDD] bg-[#E9F8F1]/30",
          animationDelay: "0ms",
        },
        {
          id: "completed-visits",
          label: "Completed",
          value: stats.completed,
          helper:
            stats.total > 0
              ? `${completionPercent}% completion rate`
              : "Reports submitted",
          icon: CheckCircle2,
          isPrimary: false,
          iconBg: "bg-[#E9F8F1] text-[#168557]",
          cardBorder: "border-[#E5E8EF] bg-white",
          animationDelay: "60ms",
        },
        {
          id: "total-visits",
          label: "Total Visits",
          value: stats.total,
          helper: "Territory plan total",
          icon: CalendarDays,
          isPrimary: false,
          iconBg: "bg-[#F6F8FB] text-[#344054]",
          cardBorder: "border-[#E5E8EF] bg-white",
          animationDelay: "120ms",
        },
      ]
    : isManager
      ? [
          {
            id: "total-visits",
            label: "Total Visits",
            value: stats.total,
            helper: "All scheduled",
            icon: CalendarDays,
            isPrimary: false,
            iconBg: "border border-[#E9DDB8] bg-[#FBF7EA] text-[#B18732]",
            cardBorder:
              "border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#DDE3EE] hover:shadow-[0_8px_22px_rgba(16,29,54,0.06)]",
            animationDelay: "0ms",
          },
          {
            id: "completed-visits",
            label: "Completed",
            value: stats.completed,
            helper: "Reports submitted",
            icon: CheckCircle2,
            isPrimary: false,
            iconBg: "border border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]",
            cardBorder:
              "border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#DDE3EE] hover:shadow-[0_8px_22px_rgba(16,29,54,0.06)]",
            animationDelay: "60ms",
          },
          {
            id: "today-visits",
            label: "Today",
            value: stats.today,
            helper: "Scheduled for today",
            icon: Clock3,
            isPrimary: false,
            iconBg: "border border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]",
            cardBorder:
              "border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-[#DDE3EE] hover:shadow-[0_8px_22px_rgba(16,29,54,0.06)]",
            animationDelay: "120ms",
          },
        ]
      : [
          {
            id: "total-visits",
            label: "Total Visits",
            value: stats.total,
            helper: "All scheduled records",
            icon: CalendarDays,
            isPrimary: false,
            iconBg: "bg-[#EEF4FF] text-[#3972D5]",
            cardBorder: "border-[#E5E8EF] bg-white",
            animationDelay: "0ms",
          },
          {
            id: "completed-visits",
            label: "Completed",
            value: stats.completed,
            helper: "Reports submitted",
            icon: CheckCircle2,
            isPrimary: false,
            iconBg: "bg-[#E9F8F1] text-[#168557]",
            cardBorder: "border-[#E5E8EF] bg-white",
            animationDelay: "60ms",
          },
          {
            id: "today-visits",
            label: "Today",
            value: stats.today,
            helper: "Scheduled for today",
            icon: Clock3,
            isPrimary: false,
            iconBg: "bg-[#FFF3D7] text-[#B18732]",
            cardBorder: "border-[#E5E8EF] bg-white",
            animationDelay: "120ms",
          },
        ];

  return (
    <>
      <div className="space-y-5">
        {isRep ? (
          <div className="flex items-center justify-end pb-1">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="visits-add-trigger group bg-gp-rep-primary hover:bg-gp-rep-primary-hover focus-visible:ring-gp-rep-primary/30 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-[170ms] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(22,133,87,0.28)] focus-visible:ring-2 focus-visible:outline-none"
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
        ) : (
          <header className="visits-page-enter flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1
                className={cn(
                  "leading-tight font-semibold text-[#182033]",
                  isManager
                    ? "text-[30px] sm:text-[34px]"
                    : "text-[26px] sm:text-[30px]",
                )}
              >
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
                className={cn(
                  "visits-add-trigger group h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] px-5 text-sm font-semibold text-white transition-[background-color,color,transform,box-shadow] duration-[170ms] hover:-translate-y-px focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:w-auto",
                  isManager
                    ? "bg-[#101D36] shadow-[0_8px_18px_rgba(16,29,54,0.16)] hover:bg-[#182033] hover:shadow-[0_10px_24px_rgba(16,29,54,0.22)] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/25"
                    : "bg-[#C9A44C] shadow-[0_4px_14px_rgba(201,164,76,0.25)] hover:bg-[#B18732] hover:shadow-[0_8px_20px_rgba(201,164,76,0.3)] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30",
                )}
              >
                <CalendarPlus
                  className={cn(
                    "visits-add-trigger-icon h-4 w-4",
                    isManager && "text-[#D4AF4F]",
                  )}
                  aria-hidden="true"
                />
                Add Visit
              </Button>

              <Link href={addVisitPath} className="sr-only" tabIndex={-1}>
                Add Visit Page
              </Link>
            </div>
          </header>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <VisitSummaryCard
              key={card.id}
              label={card.label}
              value={card.value}
              helper={card.helper}
              icon={card.icon}
              iconBg={card.iconBg}
              cardBorder={card.cardBorder}
              isPrimary={card.isPrimary}
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
