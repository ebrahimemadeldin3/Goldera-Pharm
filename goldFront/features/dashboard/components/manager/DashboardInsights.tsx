"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  MapPinned,
  Stethoscope,
  UserRoundCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  displayDate,
  money,
  type DashboardSummary,
} from "./dashboard-utils";
import { EmptyState } from "./DashboardPrimitives";
import styles from "./manager-dashboard.module.css";

function Panel({
  title,
  subtitle,
  href,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn(styles.card, "min-w-0 p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-gp-navy-900 text-base font-semibold">{title}</h2>
          {subtitle && (
            <p className="text-gp-text-muted mt-1 text-xs leading-5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="text-gp-navy-900 hover:text-gp-gold-700 inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-semibold"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        )}
      </header>
      {children}
    </article>
  );
}

function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Stethoscope;
}) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle flex min-w-0 items-center gap-3 rounded-[12px] border px-3 py-3">
      <span className="bg-gp-gold-50 text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[10px]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </p>
        <p className="text-gp-navy-900 mt-1 text-lg font-semibold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ManagementAttention({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const cancelledVisits =
    summary.statuses.find((status) => status.value === "CANCELLED")?.count ?? 0;
  const unassignedTerritories = summary.regionalCoverage.reduce(
    (count, region) =>
      count +
      region.territories.filter((territory) => !territory.assigned.length)
        .length,
    0,
  );
  const items = [
    cancelledVisits > 0
      ? {
          severity: "HIGH",
          label: `${cancelledVisits} cancelled visits this month`,
          href: "/manager/visits",
        }
      : null,
    unassignedTerritories > 0
      ? {
          severity: "MEDIUM",
          label: `${unassignedTerritories} territories currently have no assigned medical representative`,
          href: "/manager/team",
        }
      : null,
    summary.appraisalStats.needsAttention > 0
      ? {
          severity: "MEDIUM",
          label: `${summary.appraisalStats.needsAttention} appraisal score is below 70`,
          href: "/manager/appraisal",
        }
      : null,
    summary.dataQuality.doctorsMissingEmail > 0
      ? {
          severity: "LOW",
          label: `${summary.dataQuality.doctorsMissingEmail} doctor profiles are missing contact information`,
          href: "/manager/doctors",
        }
      : null,
    summary.pastScheduled > 0
      ? {
          severity: "MEDIUM",
          label: `${summary.pastScheduled} past-date scheduled visits`,
          href: "/manager/visits",
        }
      : null,
    summary.dataQuality.teamMissingTerritory > 0
      ? {
          severity: "MEDIUM",
          label: `${summary.dataQuality.teamMissingTerritory} reps missing territory coverage`,
          href: "/manager/team",
        }
      : null,
    summary.requestStats.pending > 0
      ? {
          severity: "MEDIUM",
          label: `${summary.requestStats.pending} pending requests`,
          href: "/manager/requests",
        }
      : null,
    summary.lowRatings > 0
      ? {
          severity: "LOW",
          label: `${summary.lowRatings} low coaching ratings`,
          href: "/manager/coaching",
        }
      : null,
  ].filter(Boolean) as Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    label: string;
    href: string;
  }>;

  return (
    <Panel title="Management Attention" subtitle="Operational items requiring follow-up">
      {!items.length ? (
        <div className="flex items-center gap-3 rounded-[12px] border border-[#DDEEDB] bg-[#F4FBF4] px-4 py-3 text-sm font-semibold text-[#398567]">
          <BadgeCheck className="size-4" aria-hidden="true" />
          No urgent attention items in the current scope.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="border-gp-border-subtle hover:border-gp-gold-300 hover:bg-gp-gold-50 flex items-center justify-between gap-3 rounded-[12px] border px-3 py-2.5 text-sm font-semibold transition-colors"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <AlertTriangle
                    className="size-4 shrink-0 text-[#A37C27]"
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.06em]",
                      item.severity === "HIGH"
                        ? "bg-[#FDECEC] text-[#9F3A3A]"
                        : item.severity === "MEDIUM"
                          ? "bg-[#FFF7E0] text-[#8A6518]"
                          : "bg-[#F2F4F7] text-[#667085]",
                    )}
                  >
                    {item.severity}
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function FieldCoveragePanel({ summary }: { summary: DashboardSummary }) {
  return (
    <Panel title="Field Coverage" subtitle="Directory coverage in the current geography">
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricTile
          label="Doctors"
          value={summary.fieldCoverage.doctors.toLocaleString()}
          icon={Stethoscope}
        />
        <MetricTile
          label="Pharmacies"
          value={summary.fieldCoverage.pharmacies.toLocaleString()}
          icon={Building2}
        />
        <MetricTile
          label="Facilities"
          value={summary.fieldCoverage.facilities.toLocaleString()}
          icon={ClipboardList}
        />
        <MetricTile
          label="Territories"
          value={summary.fieldCoverage.territories.toLocaleString()}
          icon={MapPinned}
        />
      </div>
    </Panel>
  );
}

export function TeamPerformancePanel({ summary }: { summary: DashboardSummary }) {
  return (
    <Panel
      title="Team Performance"
      subtitle="Medical representative activity in the current scope"
      href="/manager/team"
      className="xl:col-span-2"
    >
      {!summary.teamPerformance.length ? (
        <EmptyState>No representative performance in this scope.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medical Rep</th>
                <th>Territory</th>
                <th>Completed Visits</th>
                <th>Completion</th>
                <th>Sales</th>
                <th>Appraisal</th>
              </tr>
            </thead>
            <tbody>
              {summary.teamPerformance.map((rep) => (
                <tr key={rep.id}>
                  <td className="font-semibold">{rep.name}</td>
                  <td>{rep.territories.join(" / ") || "Not assigned"}</td>
                  <td className="tabular-nums">{rep.completedVisits}</td>
                  <td className="tabular-nums">
                    {rep.completionRate === null
                      ? "--"
                      : `${rep.completionRate.toFixed(1)}%`}
                  </td>
                  <td>{rep.sales === null ? "--" : money(rep.sales)}</td>
                  <td>
                    {rep.appraisal === null ? "--" : rep.appraisal.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

export function TerritoryPerformancePanel({
  summary,
}: {
  summary: DashboardSummary;
}) {
  return (
    <Panel title="Territory Performance" subtitle="Assigned coverage by territory">
      {!summary.territoryPerformance.length ? (
        <EmptyState>No assigned territories match this scope.</EmptyState>
      ) : (
        <div className="grid gap-2">
          {summary.territoryPerformance.map((item) => (
            <div
              key={`${item.repId}-${item.territory}`}
              className="border-gp-border-subtle flex items-center justify-between gap-3 rounded-[12px] border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-gp-navy-900 truncate text-sm font-semibold">
                  {item.territory}
                </p>
                <p className="text-gp-text-muted mt-0.5 truncate text-xs">
                  {item.repName}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="text-gp-navy-900 font-semibold tabular-nums">
                  {item.completedVisits} / {item.visits}
                </p>
                <p className="text-gp-text-muted">completed visits</p>
                {item.sales !== null && (
                  <p className="text-gp-navy-900 mt-1 font-semibold tabular-nums">
                    {money(item.sales)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export function RegionalCoveragePanel({
  summary,
}: {
  summary: DashboardSummary;
}) {
  return (
    <Panel
      title="Regional Coverage"
      subtitle="Assigned and unassigned territories"
      className="xl:col-span-2"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {summary.regionalCoverage.map((region) => (
          <section
            key={`${region.district}-${region.region}`}
            className="border-gp-border-subtle rounded-[12px] border p-3"
          >
            <p className="text-gp-navy-900 text-sm font-semibold">
              {region.region}
            </p>
            <p className="text-gp-text-muted mt-0.5 text-xs">
              {region.district}
            </p>
            <ul className="mt-3 space-y-2">
              {region.territories.map((territory) => {
                const assigned = territory.assigned.length > 0;
                return (
                  <li
                    key={territory.name}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span
                      className={cn(
                        "mt-1 size-2.5 rounded-full",
                        assigned ? "bg-[#398567]" : "bg-[#D0D5DD]",
                      )}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="text-gp-navy-900 block font-semibold">
                        {territory.name}
                      </span>
                      <span className="text-gp-text-muted block text-xs">
                        {assigned ? territory.assigned.join(", ") : "Unassigned"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}

export function OperationsSnapshot({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title="Appraisal Overview" subtitle="Scored appraisal reviews">
        {summary.quality?.kind === "appraisals" ? (
          <div className="space-y-3 text-sm">
            <p className="text-gp-navy-900 text-2xl font-semibold">
              {summary.quality.average.toFixed(1)} / 100
            </p>
            <p className="text-gp-text-muted">
              {summary.quality.count} scored reviews
            </p>
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="High performers"
                value={summary.appraisalStats.highPerformers}
                icon={BadgeCheck}
              />
              <MetricTile
                label="Needs attention"
                value={summary.appraisalStats.needsAttention}
                icon={AlertTriangle}
              />
            </div>
          </div>
        ) : (
          <EmptyState>No appraisal scores in this scope.</EmptyState>
        )}
      </Panel>
      <Panel title="Coaching Overview" subtitle="Joint visit coaching">
        <div className="space-y-3 text-sm">
          <p className="text-gp-navy-900 text-2xl font-semibold">
            {summary.coachingStats.total.toLocaleString()}
          </p>
          <p className="text-gp-text-muted">reviews in scope</p>
          <div className="grid grid-cols-2 gap-2">
            <MetricTile
              label="Completed"
              value={summary.coachingStats.completed}
              icon={BadgeCheck}
            />
            <MetricTile
              label="Follow-ups"
              value={summary.coachingStats.followUps}
              icon={ClipboardList}
            />
          </div>
          <p className="text-gp-text-muted">
            {summary.coachingStats.lowRatingFollowUps} low-rating follow-ups
          </p>
          {summary.coachingStats.latest && (
            <p className="text-gp-text-muted">
              Latest coaching: {displayDate(summary.coachingStats.latest)}
            </p>
          )}
        </div>
      </Panel>
      <Panel title="HR Snapshot" subtitle="Employee records">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <MetricTile
            label="Employees"
            value={summary.hrSnapshot.totalEmployees}
            icon={UserRoundCheck}
          />
          <MetricTile
            label="Active"
            value={summary.hrSnapshot.activeEmployees}
            icon={BadgeCheck}
          />
        </div>
      </Panel>
      <Panel title="Requests" subtitle="Workflow status" href="/manager/requests">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Pending", summary.requestStats.pending],
            ["Approved", summary.requestStats.approved],
            ["Rejected", summary.requestStats.rejected],
            ["Total", summary.requestStats.total],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-gp-border-subtle rounded-[10px] border px-3 py-2"
            >
              <p className="text-gp-text-muted text-xs">{label}</p>
              <p className="text-gp-navy-900 mt-1 text-lg font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Data Quality" subtitle="Completeness checks" className="xl:col-span-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              label: `${summary.dataQuality.repsWithTerritory} / ${summary.dataQuality.totalReps} reps have territory coverage`,
              complete:
                summary.dataQuality.repsWithTerritory ===
                summary.dataQuality.totalReps,
            },
            {
              label: `${summary.dataQuality.doctorsMissingEmail} doctors missing email`,
              complete: summary.dataQuality.doctorsMissingEmail === 0,
            },
            {
              label: `${summary.dataQuality.doctorsMissingPhone} doctors missing phone`,
              complete: summary.dataQuality.doctorsMissingPhone === 0,
            },
            {
              label: `${summary.dataQuality.pharmaciesMissingCity} pharmacies missing city`,
              complete: summary.dataQuality.pharmaciesMissingCity === 0,
            },
            {
              label: `All active reps logged in during the last 7 days`,
              complete:
                summary.dataQuality.activeRepsRecentLogin ===
                summary.dataQuality.totalReps,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-gp-border-subtle flex items-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-medium"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  item.complete ? "bg-[#398567]" : "bg-[#C9A44C]",
                )}
              />
              {item.label}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function RecentActivityPanel({
  summary,
}: {
  summary: DashboardSummary;
}) {
  return (
    <Panel title="Recent Activity" subtitle="Derived from loaded operational records">
      {!summary.recentActivity.length ? (
        <EmptyState>No recent dated activity in this scope.</EmptyState>
      ) : (
        <ul className="divide-gp-border-subtle divide-y">
          {summary.recentActivity.map((item) => (
            <li key={item.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-gp-navy-900 text-sm font-semibold">
                {item.label}
              </p>
              <p className="text-gp-text-muted mt-0.5 text-xs">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
