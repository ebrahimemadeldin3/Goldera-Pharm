"use client";

import type { CSSProperties } from "react";
import { Award, CircleCheckBig, Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User } from "@/features/team/lib/types";
import {
  formatMaybeDate,
  MissingValue,
  ProfilePanelHeader,
} from "./ProfileInfoCards";

export default function Performance({
  performanceData,
}: {
  performanceData: User;
}) {
  const hasOverall =
    typeof performanceData.overall === "number" &&
    Number.isFinite(performanceData.overall);
  const overall = hasOverall
    ? Math.min(Math.max(performanceData.overall || 0, 0), 100)
    : 0;
  const lastReview = formatMaybeDate(performanceData.lastReview);
  const nextReview = formatMaybeDate(performanceData.nextReview);

  return (
    <Card
      className="member-profile-info-panel member-profile-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 rounded-[16px] border py-0"
      style={{ "--member-profile-delay": "260ms" } as CSSProperties}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <ProfilePanelHeader
            icon={Star}
            title="Performance Appraisal"
            description="Current review score, categories and manager feedback."
          />
          {performanceData.quarter ? (
            <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-bold">
              {performanceData.quarter}
            </span>
          ) : (
            <span className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-placeholder inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-semibold">
              Period not set
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5">
          <section className="border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
                  Overall Performance Score
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-gp-text-primary text-2xl leading-none font-semibold">
                    {hasOverall ? (
                      `${overall}%`
                    ) : (
                      <MissingValue>Not scored</MissingValue>
                    )}
                  </span>
                  {performanceData.deltaLabel && (
                    <span className="text-gp-success inline-flex items-center gap-1 text-sm font-semibold">
                      <TrendingUp className="size-4" aria-hidden="true" />
                      {performanceData.deltaLabel}
                    </span>
                  )}
                </div>
              </div>
              <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-12 shrink-0 items-center justify-center rounded-[12px] border">
                <Award className="size-6" aria-hidden="true" />
              </span>
            </div>
            <Progress
              value={overall}
              className="bg-gp-border-subtle mt-4 h-2.5"
              indicatorClassName="bg-gp-gold-500"
            />
          </section>

          <section>
            <h3 className="text-gp-navy-900 text-sm font-semibold">
              Performance Categories
            </h3>
            {performanceData.categories &&
            performanceData.categories.length > 0 ? (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {performanceData.categories.map((category) => (
                  <div
                    key={category.id}
                    className="member-profile-category-card border-gp-border-subtle rounded-[12px] border bg-white p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-gp-text-secondary min-w-0 truncate text-sm font-semibold">
                        {category.title}
                      </div>
                      <div className="text-gp-text-primary shrink-0 text-sm font-bold">
                        {category.value}%
                      </div>
                    </div>
                    <Progress
                      value={Math.min(Math.max(category.value, 0), 100)}
                      className="bg-gp-border-subtle mt-3 h-2"
                      indicatorClassName="bg-gp-gold-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-gp-border-control bg-gp-surface-subtle mt-3 rounded-[12px] border border-dashed p-6 text-center">
                <p className="text-gp-text-muted text-sm font-medium">
                  No performance categories available.
                </p>
              </div>
            )}
          </section>

          <section className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-4">
            <div className="text-gp-text-primary flex items-center gap-2 text-sm font-semibold">
              <CircleCheckBig
                className="text-gp-gold-700 size-4"
                aria-hidden="true"
              />
              Manager Comments
            </div>
            <p className="text-gp-text-muted mt-2 text-sm leading-6 font-medium">
              {performanceData.managerComments || "No comments available yet."}
            </p>
          </section>
        </div>
      </CardContent>

      <footer className="border-gp-border-subtle border-t p-5">
        <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
              Reviewed By
            </dt>
            <dd className="text-gp-text-primary mt-1 truncate text-sm font-semibold">
              {performanceData.reviewedBy || (
                <MissingValue>Not reviewed</MissingValue>
              )}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
              Last Review
            </dt>
            <dd className="text-gp-text-primary mt-1 truncate text-sm font-semibold">
              {lastReview || <MissingValue>Not provided</MissingValue>}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
              Next Review
            </dt>
            <dd className="text-gp-text-primary mt-1 truncate text-sm font-semibold">
              {nextReview || <MissingValue>Not provided</MissingValue>}
            </dd>
          </div>
        </dl>
      </footer>
    </Card>
  );
}
