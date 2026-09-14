"use client";

import type { CSSProperties } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  MapPin,
  MessageSquare,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Review } from "../lib/types";

type Props = {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type KpiItem = { label: string; value: number };

const STATUS_TONES: Record<string, string> = {
  Excellent: "text-gp-success border-gp-success-border bg-gp-success-soft",
  Good: "text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50",
  Improving: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
};

const GROUP_DEFINITIONS: {
  title: string;
  icon: LucideIcon;
  labels: string[];
}[] = [
  {
    title: "Job Related Skills",
    icon: Briefcase,
    labels: ["Presentation Skills", "Selling Skills", "Reporting"],
  },
  {
    title: "Job Knowledge Skills",
    icon: BookOpen,
    labels: ["Product Information", "Competitors Information"],
  },
  {
    title: "Organizational Skills",
    icon: Building2,
    labels: ["Org. Value & Policy Awareness", "Utilization of Resources"],
  },
  {
    title: "Interpersonal Skills",
    icon: Users,
    labels: [
      "Reliability & Credibility",
      "Independence & Judgment",
      "Team Spirit",
      "Personal Drive",
      "Creativity & Initiative",
      "Broad Prospective",
      "Communication Skills",
      "Planning & Organizing",
    ],
  },
  {
    title: "General Factors",
    icon: UserRound,
    labels: ["Appearance", "Attitude", "Timing"],
  },
];

function scoreHex(score: number): string {
  if (score >= 85) return "#168557";
  if (score >= 70) return "#C9A44C";
  if (score >= 50) return "#F59E0B";
  return "#B42318";
}

function groupKpis(kpis: KpiItem[]) {
  const groups = GROUP_DEFINITIONS.map((definition) => ({
    title: definition.title,
    icon: definition.icon,
    items: [] as KpiItem[],
  }));
  const leftovers: KpiItem[] = [];

  for (const kpi of kpis) {
    const groupIndex = GROUP_DEFINITIONS.findIndex((definition) =>
      definition.labels.includes(kpi.label),
    );
    if (groupIndex >= 0) groups[groupIndex].items.push(kpi);
    else leftovers.push(kpi);
  }

  if (leftovers.length > 0) {
    groups.push({ title: "Other Criteria", icon: Star, items: leftovers });
  }

  return groups.filter((group) => group.items.length > 0);
}

function ScoreRing({
  value,
  employeeName,
}: {
  value: number;
  employeeName: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const color = scoreHex(clamped);

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      role="img"
      aria-label={`Overall score for ${employeeName}: ${clamped} percent`}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 124 124"
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="62"
          cy="62"
          r={radius}
          fill="none"
          stroke="var(--gp-border-control)"
          strokeWidth="10"
        />
        <circle
          cx="62"
          cy="62"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          className="appraisal-ring-fill"
          style={
            {
              "--appraisal-ring-circumference": circumference,
              "--appraisal-ring-offset": circumference * (1 - clamped / 100),
            } as CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-gp-navy-900 text-[26px] leading-none font-bold">
          {clamped}%
        </span>
        <span className="text-gp-text-muted mt-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
          Score
        </span>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  icon: Icon,
  badgeTone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  badgeTone?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-gp-text-muted flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] uppercase">
        <Icon className="text-gp-gold-600 size-3.5" aria-hidden="true" />
        {label}
      </p>
      {badgeTone ? (
        <span
          className={cn(
            "mt-1.5 inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            badgeTone,
          )}
        >
          {value}
        </span>
      ) : (
        <p className="text-gp-navy-900 mt-1.5 truncate text-sm font-semibold">
          {value}
        </p>
      )}
    </div>
  );
}

export function AppraisalDetailDialog({ review, open, onOpenChange }: Props) {
  const groups = groupKpis(review.kpis);
  const score = Math.min(100, Math.max(0, review.overallCurrent));
  const statusTone = review.statusBadge
    ? STATUS_TONES[review.statusBadge]
    : undefined;
  const roleLabel =
    review.role === "Medical Rep" ? "Medical Representative" : "Supervisor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="appraisal-dialog border-gp-border-default shadow-gp-dialog z-[60] flex max-h-[calc(100dvh-16px)] w-[calc(100vw-16px)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-[16px] border bg-white p-0 sm:max-h-[calc(100dvh-32px)] sm:w-[min(900px,calc(100vw-32px))] sm:rounded-[18px]"
      >
        <div className="bg-gp-navy-900 shrink-0 px-5 py-5 text-white sm:px-6">
          <DialogHeader className="gap-3 pr-10 text-left">
            <div className="flex min-w-0 items-start gap-3.5">
              <span className="border-gp-gold-500/35 bg-gp-gold-500/15 text-gp-gold-500 flex size-11 shrink-0 items-center justify-center rounded-[12px] border">
                <Award className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate text-[20px] leading-tight font-semibold text-white">
                  {review.name}
                </DialogTitle>
                <DialogDescription className="mt-1.5 flex flex-wrap items-center gap-2 text-sm leading-6 text-[#C8D2E1]">
                  <span>{roleLabel}</span>
                  <span aria-hidden="true">/</span>
                  <span>{review.period}</span>
                  {review.statusBadge && statusTone ? (
                    <span
                      className={cn(
                        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                        statusTone,
                      )}
                    >
                      {review.statusBadge}
                    </span>
                  ) : null}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close appraisal details"
              className="text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-gp-gold-500/40 absolute top-4 right-4 flex size-9 items-center justify-center rounded-[10px] transition-[background-color,color,transform] duration-[160ms] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </DialogClose>
        </div>

        <div
          className="appraisal-dialog-body min-h-0 flex-1 space-y-4 overflow-y-auto bg-gp-surface-subtle p-4 sm:p-5"
          style={{ "--appraisal-dialog-delay": "0ms" } as CSSProperties}
        >
          <section className="border-gp-border-subtle bg-gp-surface-card shadow-gp-card flex flex-col gap-5 rounded-[14px] border p-4 sm:flex-row sm:items-center sm:p-5">
            <ScoreRing value={score} employeeName={review.name} />
            <div className="min-w-0 flex-1">
              <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
                Overall Score
              </p>
              <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="text-gp-navy-900 text-[28px] leading-none font-bold">
                  {score}
                </span>
                <span className="text-gp-text-muted pb-1 text-sm font-semibold">
                  / 100
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <MetaItem
                  label="Performance"
                  value={review.statusBadge ?? "-"}
                  icon={Star}
                  badgeTone={statusTone}
                />
                <MetaItem
                  label="Reviewer"
                  value={review.managerName}
                  icon={Briefcase}
                />
                <MetaItem
                  label="Review Date"
                  value={review.lastReview}
                  icon={CalendarDays}
                />
                <MetaItem
                  label="Location"
                  value={review.location || "-"}
                  icon={MapPin}
                />
              </div>
            </div>
          </section>

          {groups.map((group, groupIndex) => {
            const GroupIcon = group.icon;
            return (
              <section
                key={group.title}
                className="appraisal-detail-section border-gp-border-subtle bg-gp-surface-card shadow-gp-card rounded-[14px] border p-4 sm:p-5"
                style={
                  {
                    "--appraisal-dialog-delay": `${groupIndex * 60}ms`,
                  } as CSSProperties
                }
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px] border">
                    <GroupIcon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-gp-navy-900 min-w-0 truncate text-sm font-semibold">
                    {group.title}
                  </h3>
                  <span className="text-gp-text-muted ml-auto shrink-0 text-xs font-semibold">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "criterion" : "criteria"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                  {group.items.map((kpi, itemIndex) => {
                    const value = Math.min(100, Math.max(0, kpi.value));
                    return (
                      <div key={kpi.label} className="min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gp-text-muted min-w-0 truncate text-xs font-medium">
                            {kpi.label}
                          </span>
                          <span className="text-gp-navy-900 shrink-0 text-xs font-bold">
                            {value}%
                          </span>
                        </div>
                        <div className="bg-gp-border-subtle mt-1.5 h-1.5 overflow-hidden rounded-full">
                          <div
                            role="progressbar"
                            aria-label={`${kpi.label}: ${value} percent`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={value}
                            className="appraisal-kpi-bar h-full rounded-full"
                            style={
                              {
                                background: scoreHex(value),
                                "--appraisal-kpi-delay": `${
                                  120 + itemIndex * 50
                                }ms`,
                              } as CSSProperties
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {review.feedbackComments && review.feedbackComments.trim() !== "" && (
            <section className="border-gp-border-subtle bg-gp-surface-card shadow-gp-card rounded-[14px] border p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px] border">
                  <MessageSquare className="size-4" aria-hidden="true" />
                </span>
                <h3 className="text-gp-navy-900 text-sm font-semibold">
                  Feedback Comments
                </h3>
              </div>
              <p className="text-gp-text-secondary mt-3 text-sm leading-6 whitespace-pre-wrap">
                {review.feedbackComments}
              </p>
            </section>
          )}
        </div>

        <DialogFooter className="appraisal-dialog-footer border-gp-border-subtle flex-row items-center justify-between gap-3 border-t bg-white px-4 py-3.5 sm:px-5">
          <p className="text-gp-text-muted hidden min-w-0 truncate text-xs font-medium sm:block">
            Review period:{" "}
            <span className="text-gp-navy-900 font-semibold">
              {review.period}
            </span>
          </p>
          <DialogClose asChild>
            <button
              type="button"
              className="appraisal-btn border-gp-border-control bg-gp-surface-card text-gp-text-secondary hover:border-gp-navy-900/20 hover:bg-gp-navy-900/5 hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/25 ml-auto inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none"
            >
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
