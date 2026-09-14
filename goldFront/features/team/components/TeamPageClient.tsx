"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheckBig,
  GalleryVerticalEnd,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import AddMemberDialog from "./AddMemberDialog";
import TeamList from "./TeamList";
import { User } from "../lib/types";
import { Region } from "@/lib/types/regions";
import { PageContainer } from "@/components/layout/page-container";
import { getTeamMemberAssignment } from "../lib/utils";

type TeamPageClientProps = {
  supervisors: User[];
  medicalReps: User[];
  regions: Region[];
  stats: {
    totalMembers: number;
    supervisorsCount: number;
    repsCount: number;
  };
  success: boolean;
  openDialog: boolean;
  page?: number;
  limit?: number;
  medicalRepsTotalCount?: number;
  supervisorsTotalCount?: number;
};

type OverviewCard = {
  id: string;
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  toneClassName: string;
  accentClassName: string;
};

type TeamSummary = {
  totalMembers: number;
  repsCount: number;
  supervisorsCount: number;
  activeMembers: number;
  coverageCount: number;
};

export default function TeamPageClient({
  supervisors,
  medicalReps,
  regions,
  stats,
  success,
  openDialog,
  page = 1,
  limit = 10,
  medicalRepsTotalCount = 0,
  supervisorsTotalCount = 0,
}: TeamPageClientProps) {
  const router = useRouter();
  const totalMembers = Math.max(
    stats.totalMembers,
    stats.repsCount + stats.supervisorsCount,
    medicalRepsTotalCount + supervisorsTotalCount,
  );
  const loadedMembers = [...supervisors, ...medicalReps];
  const initialCoverageCount = new Set(
    loadedMembers
      .map(getTeamMemberAssignment)
      .filter((assignment) => assignment.hasTerritory)
      .map((assignment) => assignment.territory),
  ).size;
  const [summary, setSummary] = useState<TeamSummary>({
    totalMembers: loadedMembers.length || totalMembers,
    repsCount: medicalReps.length || stats.repsCount,
    supervisorsCount: supervisors.length || stats.supervisorsCount,
    activeMembers: loadedMembers.filter((member) => member.isActive).length,
    coverageCount: initialCoverageCount,
  });
  const handleSummaryChange = useCallback((nextSummary: TeamSummary) => {
    setSummary((currentSummary) => {
      if (
        currentSummary.totalMembers === nextSummary.totalMembers &&
        currentSummary.repsCount === nextSummary.repsCount &&
        currentSummary.supervisorsCount === nextSummary.supervisorsCount &&
        currentSummary.activeMembers === nextSummary.activeMembers &&
        currentSummary.coverageCount === nextSummary.coverageCount
      ) {
        return currentSummary;
      }

      return nextSummary;
    });
  }, []);
  const overviewCards: OverviewCard[] = [
    {
      id: "total-members",
      label: "TOTAL MEMBERS",
      value: summary.totalMembers,
      helper: "People in the selected team scope",
      icon: UsersRound,
      toneClassName:
        "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
      accentClassName: "bg-gp-navy-900",
    },
    {
      id: "medical-reps",
      label: "MEDICAL REPS",
      value: summary.repsCount,
      helper: "Field coverage roles",
      icon: UserRoundCheck,
      toneClassName:
        "border-gp-border-control bg-gp-surface-subtle text-gp-navy-800",
      accentClassName: "bg-gp-navy-900",
    },
    {
      id: "supervisors",
      label: "SUPERVISORS",
      value: summary.supervisorsCount,
      helper: "Leadership roles",
      icon: ShieldCheck,
      toneClassName:
        "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
      accentClassName: "bg-gp-navy-900",
    },
    {
      id: "active-members",
      label: "ACTIVE MEMBERS",
      value: summary.activeMembers,
      helper: summary.coverageCount
        ? `${summary.coverageCount} territories in scope`
        : "Active members in the selected scope",
      icon: CircleCheckBig,
      toneClassName: "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
      accentClassName: "bg-gp-gold-500",
    },
  ];

  useEffect(() => {
    if (openDialog) {
      // Trigger dialog opening by clicking the button
      const dialogTrigger = document.querySelector(
        '[data-dialog-trigger="add-member"]',
      ) as HTMLButtonElement;
      if (dialogTrigger) {
        dialogTrigger.click();
      }
      // Clean up URL
      router.replace("/manager/team");
    }
  }, [openDialog, router]);

  return (
    <PageContainer className="bg-gp-surface-page min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="team-header-eyebrow mb-2 flex items-center gap-2">
            <span
              className="bg-gp-gold-500 h-px w-9 rounded-full"
              aria-hidden="true"
            />
            <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-7 items-center justify-center rounded-[8px] border">
              <GalleryVerticalEnd className="size-3.5" aria-hidden="true" />
            </span>
            <p className="text-gp-gold-700 text-[11px] font-bold tracking-[0.12em] uppercase">
              Management
            </p>
          </div>
          <h1 className="team-header-title text-gp-navy-900 text-[26px] leading-tight font-semibold sm:text-[30px]">
            Team Management
          </h1>
          <p className="team-header-description text-gp-text-muted mt-1 max-w-2xl text-sm leading-6">
            Manage representatives, supervisors, reporting structure and field
            assignments.
          </p>
        </div>

        <div className="team-header-action w-full sm:w-auto">
          <AddMemberDialog supervisors={supervisors} regions={regions} />
        </div>
      </header>

      {success ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.id}
                  className="team-overview-card team-page-enter border-gp-border-default bg-gp-surface-card shadow-gp-card relative flex min-h-[124px] flex-col overflow-hidden rounded-[14px] border p-5"
                  style={
                    {
                      "--team-enter-delay": `${index * 60}ms`,
                    } as CSSProperties
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`team-overview-icon flex size-11 shrink-0 items-center justify-center rounded-[12px] border ${card.toneClassName}`}
                    >
                      <Icon
                        className="team-overview-icon-svg size-5"
                        aria-hidden="true"
                      />
                    </span>
                    <span
                      className={`team-overview-indicator mt-1 h-1.5 w-12 rounded-full opacity-70 ${card.accentClassName}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-4 min-w-0">
                    <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.06em] uppercase">
                      {card.label}
                    </p>
                    <p className="text-gp-navy-900 mt-2 text-2xl leading-none font-semibold">
                      {card.value.toLocaleString()}
                    </p>
                    <p className="text-gp-text-muted mt-2 truncate text-xs font-medium">
                      {card.helper}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>

          <TeamList
            members={[]}
            medicalReps={medicalReps}
            supervisors={supervisors}
            stats={stats}
            page={page}
            limit={limit}
            medicalRepsTotalCount={medicalRepsTotalCount}
            supervisorsTotalCount={supervisorsTotalCount}
            onSummaryChange={handleSummaryChange}
          />
        </>
      ) : (
        <div className="team-page-enter border-gp-danger-border bg-gp-danger-soft text-gp-danger shadow-gp-card rounded-[16px] border p-5 text-sm font-semibold">
          Failed to load team members.
        </div>
      )}
    </PageContainer>
  );
}
