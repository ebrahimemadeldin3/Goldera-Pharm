"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Award,
  Briefcase,
  CalendarDays,
  Eye,
  Mail,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Review } from "../lib/types";
import { AppraisalDetailDialog } from "./AppraisalDetailDialog";

type Props = {
  review: Review;
  animationIndex?: number;
};

const STATUS_TONES: Record<string, string> = {
  Excellent: "text-gp-success border-gp-success-border bg-gp-success-soft",
  Good: "text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50",
  Improving: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
};

const ROLE_TONES: Record<string, string> = {
  Supervisor: "border-gp-border-control bg-gp-surface-subtle text-gp-navy-900",
  "Medical Rep":
    "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
};

function scoreHex(score: number): string {
  if (score >= 85) return "#168557";
  if (score >= 70) return "#C9A44C";
  if (score >= 50) return "#F59E0B";
  return "#B42318";
}

type MetricCellProps = {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

function MetricCell({ label, icon: Icon, children }: MetricCellProps) {
  return (
    <div className="min-w-0">
      <p className="text-gp-text-muted flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
        <Icon className="text-gp-gold-600 size-3.5" aria-hidden="true" />
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function AppraisalCard({ review, animationIndex = 0 }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const score = Math.min(100, Math.max(0, review.overallCurrent));
  const scoreBarColor = scoreHex(score);
  const statusTone = review.statusBadge
    ? STATUS_TONES[review.statusBadge]
    : undefined;
  const roleTone = ROLE_TONES[review.role];
  const roleLabel =
    review.role === "Medical Rep" ? "Medical Representative" : "Supervisor";
  const StatusIcon =
    review.statusBadge === "Excellent"
      ? Award
      : review.statusBadge === "Improving"
        ? TrendingUp
        : Star;

  return (
    <Card
      className="appraisal-card appraisal-card-reveal border-gp-border-default bg-gp-surface-card shadow-gp-card group/card gap-0 overflow-hidden rounded-[16px] border py-0"
      style={
        {
          "--appraisal-card-delay": `${animationIndex * 70}ms`,
        } as CSSProperties
      }
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span
              className="appraisal-card-avatar text-gp-gold-500 bg-gp-navy-900 border-gp-gold-300/60 flex size-12 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
              aria-hidden="true"
            >
              {review.initials}
            </span>
            <div className="min-w-0">
              <h3 className="text-gp-navy-900 truncate text-base leading-6 font-semibold">
                {review.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    roleTone,
                  )}
                >
                  {roleLabel}
                </span>
                {review.statusBadge && statusTone && (
                  <span
                    className={cn(
                      "inline-flex min-h-6 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      statusTone,
                    )}
                  >
                    <StatusIcon className="size-3" aria-hidden="true" />
                    {review.statusBadge}
                  </span>
                )}
              </div>
              <p className="text-gp-text-muted mt-1.5 flex min-w-0 items-center gap-1 text-xs leading-5 font-medium">
                <Mail className="appraisal-meta-icon size-3.5" aria-hidden="true" />
                <span className="truncate">{review.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-gp-border-subtle mt-4 grid grid-cols-1 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCell label="Appraisal / Overall Score" icon={Award}>
            <div className="flex items-baseline gap-2">
              <span className="text-gp-navy-900 text-xl leading-none font-bold">
                {score}%
              </span>
              <span className="text-gp-text-muted text-[11px] leading-4 font-semibold">
                of 100
              </span>
            </div>
            <div className="bg-gp-border-subtle mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                role="progressbar"
                aria-label={`Overall score for ${review.name}: ${score} percent`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
                className="appraisal-score-fill h-full rounded-full"
                style={
                  {
                    background: scoreBarColor,
                    "--appraisal-card-delay": `${animationIndex * 70}ms`,
                  } as CSSProperties
                }
              />
            </div>
            {review.overallPrevious !== undefined && (
              <p className="text-gp-text-placeholder mt-1.5 text-[11px] font-medium">
                Previous: {review.overallPrevious}%
              </p>
            )}
          </MetricCell>

          <MetricCell label="Performance / Rating" icon={Star}>
            <p className="text-gp-navy-900 text-sm leading-5 font-semibold">
              {review.statusBadge ?? "-"}
            </p>
            <p className="text-gp-text-placeholder mt-1 text-[11px] font-medium">
              {review.kpis.length} criteria assessed
            </p>
          </MetricCell>

          <MetricCell label="Review Period" icon={CalendarDays}>
            <p className="text-gp-navy-900 text-sm leading-5 font-semibold">
              {review.period}
            </p>
            <p className="text-gp-text-placeholder mt-1 text-[11px] font-medium">
              Quarterly cycle
            </p>
          </MetricCell>

          <MetricCell label="Reviewer" icon={Briefcase}>
            <p className="text-gp-navy-900 min-w-0 truncate text-sm leading-5 font-semibold">
              {review.managerName}
            </p>
            <p className="text-gp-text-placeholder mt-1 text-[11px] font-medium">
              Reviewed by manager
            </p>
          </MetricCell>
        </div>

        <div className="border-gp-border-subtle mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3">
          <span className="text-gp-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
            <MapPin className="appraisal-meta-icon text-gp-gold-600 size-3.5" aria-hidden="true" />
            {review.location || "-"}
          </span>
          <span className="text-gp-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
            <CalendarDays className="appraisal-meta-icon text-gp-gold-600 size-3.5" aria-hidden="true" />
            {review.lastReview}
          </span>
          {review.department && (
            <span className="text-gp-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
              <Briefcase className="appraisal-meta-icon text-gp-gold-600 size-3.5" aria-hidden="true" />
              {review.department}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            aria-label={`View appraisal for ${review.name}`}
            className="appraisal-view-button group/action bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/30 shadow-[0_4px_12px_rgba(16,29,54,0.24)] inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] hover:-translate-y-px hover:text-white hover:shadow-[0_6px_16px_rgba(16,29,54,0.3)] focus-visible:ring-3 focus-visible:outline-none active:translate-y-0"
          >
            <Eye
              className="text-gp-gold-500 size-4"
              aria-hidden="true"
            />
            View Appraisal
            <ArrowRight
              className="appraisal-view-button-arrow text-gp-gold-500 size-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </CardContent>

      <AppraisalDetailDialog
        review={review}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </Card>
  );
}
