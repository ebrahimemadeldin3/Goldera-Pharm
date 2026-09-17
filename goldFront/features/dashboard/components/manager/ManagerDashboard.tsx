"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  FileBarChart,
  Plus,
  Star,
  Stethoscope,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { ChartCard, LocalError, StatCard } from "./DashboardPrimitives";
import {
  QualityDistributionChart,
  RepPerformanceChart,
  SalesTrendChart,
  VisitStatusChart,
} from "./DashboardCharts";
import { DashboardTables } from "./DashboardTables";
import { DashboardFilters } from "./DashboardFilters";
import {
  FieldCoveragePanel,
  ManagementAttention,
  OperationsSnapshot,
  RecentActivityPanel,
  RegionalCoveragePanel,
  TeamPerformancePanel,
  TerritoryPerformancePanel,
} from "./DashboardInsights";
import {
  formatDateRangeLabel,
  getDefaultDashboardFilters,
  money,
  summarizeDashboard,
} from "./dashboard-utils";
import type { DashboardData } from "./dashboard-types";
import styles from "./manager-dashboard.module.css";

const shortcuts = [
  { label: "Schedule Visit", href: "/manager/visits", icon: CalendarPlus },
  { label: "Add Doctor", href: "/manager/doctors/add", icon: Stethoscope },
  { label: "Add Pharmacy", href: "/manager/pharmacies", icon: Plus },
  { label: "Create Appraisal", href: "/manager/appraisal", icon: Star },
  {
    label: "New Coaching Review",
    href: "/manager/coaching",
    icon: ClipboardCheck,
  },
  { label: "Upload Sales", href: "/manager/sales", icon: Upload },
  { label: "View Team", href: "/manager/team", icon: Users },
  { label: "Reports", href: "/manager/reports", icon: FileBarChart },
];

export default function ManagerDashboard({ data }: { data: DashboardData }) {
  const [filters, setFilters] = useState(() =>
    getDefaultDashboardFilters(data.asOf),
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const summary = useMemo(
    () => summarizeDashboard(data, filters),
    [data, filters],
  );
  const label = formatDateRangeLabel(filters, data.asOf);
  const retry = () => startTransition(() => router.refresh());
  const error = (name: string) => (
    <LocalError name={name} retry={retry} pending={pending} />
  );
  const quality = summary.quality;
  const qualityFailed =
    !quality && (data.coaching.error || data.appraisals.error);
  const qualityNotice = [
    data.coaching.error
      ? "Coaching unavailable; showing appraisal scores."
      : "",
    summary.invalidRatings
      ? `${summary.invalidRatings} unrated or invalid coaching reviews excluded.`
      : "",
    quality?.kind === "appraisals" && summary.invalidScores
      ? `${summary.invalidScores} incomplete appraisal scores excluded.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const unavailableDates = [
    summary.undatedSales ? `${summary.undatedSales} sales` : "",
    summary.undatedVisits ? `${summary.undatedVisits} visits` : "",
    summary.undatedCoaching
      ? `${summary.undatedCoaching} coaching reviews`
      : "",
    summary.undatedAppraisals ? `${summary.undatedAppraisals} appraisals` : "",
  ].filter(Boolean);

  return (
    <div className={`${styles.dashboard} space-y-6`} aria-busy={pending}>
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-[#A37C27]">
            GolderaPharm / Manager
          </p>
          <h1 className="text-[30px] leading-tight font-semibold sm:text-[34px]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Executive overview of commercial performance and field operations.
          </p>
        </div>
      </header>

      <DashboardFilters
        filters={filters}
        asOf={data.asOf}
        reps={data.team.data.filter((member) => member.role === "MEDICAL_REP")}
        onChange={setFilters}
        onReset={() => setFilters(getDefaultDashboardFilters(data.asOf))}
      />

      <section
        aria-label="Key performance indicators"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-6"
      >
        <StatCard
          label={summary.missingAmounts ? "Sales with Amounts" : "Total Sales"}
          value={
            summary.sales.length > 0 &&
            summary.missingAmounts === summary.sales.length ? (
              "Not available"
            ) : (
              <span title={money(summary.salesTotal)}>
                {Number.isFinite(summary.salesTotal) &&
                Math.abs(summary.salesTotal) >= 1000000
                  ? new Intl.NumberFormat("en-SA", {
                      style: "currency",
                      currency: "SAR",
                      notation: "compact",
                      maximumFractionDigits: 2,
                    }).format(summary.salesTotal)
                  : money(summary.salesTotal)}
              </span>
            )
          }
          helper={`${summary.sales.length.toLocaleString()} records / Excluding tax${summary.missingAmounts ? ` / ${summary.missingAmounts} amounts missing` : ""}`}
          icon={TrendingUp}
          href="/manager/sales"
          scope={label}
          error={data.sales.error ? error("sales") : undefined}
        />
        <StatCard
          label="Completed Visits"
          value={summary.completed.toLocaleString()}
          helper={`${summary.completed} of ${summary.visits.length} visits${summary.completionRate !== null ? ` / ${summary.completionRate.toFixed(1)}% completed` : ""}`}
          icon={CalendarCheck2}
          href="/manager/visits"
          scope={label}
          error={data.visits.error ? error("visits") : undefined}
        />
        <StatCard
          label="Visit Completion"
          value={
            summary.completionRate === null
              ? "Not available"
              : `${summary.completionRate.toFixed(1)}%`
          }
          helper={`${summary.completed} / ${summary.visits.length} eligible visits`}
          icon={CalendarClock}
          href="/manager/visits"
          scope={label}
          error={data.visits.error ? error("visits") : undefined}
        />
        <StatCard
          label="Active Team"
          value={summary.activeTeam.toLocaleString()}
          helper={`${summary.activeTeam} active employees in scope`}
          icon={Users}
          href="/manager/team"
          scope="Current"
          error={data.team.error ? error("team") : undefined}
        />
        <StatCard
          label={
            quality
              ? quality.kind === "coaching"
                ? "Avg Coaching Rating"
                : "Avg Appraisal Score"
              : qualityFailed
                ? "Team Quality"
                : "Scheduled Visits"
          }
          value={
            quality ? (
              <>
                {quality.average.toFixed(1)}
                <span className="ml-1 text-base font-medium text-[#667085]">
                  / {quality.kind === "coaching" ? "5" : "100"}
                </span>
              </>
            ) : (
              summary.scheduled.toLocaleString()
            )
          }
          helper={
            quality
              ? `${quality.count} scored reviews${quality.kind === "appraisals" ? " / Appraisal period" : ""}`
              : "Visits awaiting completion"
          }
          icon={quality ? Star : CalendarClock}
          href={
            quality
              ? `/manager/${quality.kind === "coaching" ? "coaching" : "appraisal"}`
              : "/manager/visits"
          }
          scope={label}
          error={
            qualityFailed
              ? error("team quality")
              : !quality && data.visits.error
                ? error("visits")
            : undefined
          }
        />
        <StatCard
          label="Doctor Coverage"
          value={summary.fieldCoverage.doctors.toLocaleString()}
          helper={`${summary.fieldCoverage.territories} territories represented`}
          icon={Stethoscope}
          href="/manager/doctors"
          scope="Directory"
          error={data.doctors.error ? error("doctors") : undefined}
        />
      </section>

      {(unavailableDates.length > 0 || summary.unsupportedFilters.sales) && (
        <p className="text-xs leading-5 text-[#667085]">
          {unavailableDates.length > 0 &&
            `Missing dates: ${unavailableDates.join(", ")}. `}
          {summary.unsupportedFilters.sales &&
            "Sales are date-scoped only because current sales records do not expose reliable representative or territory fields."}
        </p>
      )}

      <nav
        aria-label="Manager quick actions"
        className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6"
      >
        {shortcuts.map(({ label: title, href, icon: Icon }) => (
          <Link key={href} href={href} className={styles.shortcut}>
            <Icon
              aria-hidden="true"
              className="size-4 shrink-0 text-[#667085]"
            />
            <span className="min-w-0 break-words">{title}</span>
          </Link>
        ))}
      </nav>

      <ManagementAttention summary={summary} />

      <section
        aria-label="Performance analytics"
        className="grid gap-6 xl:grid-cols-2"
      >
        <ChartCard
          title="Sales Trend"
          subtitle={`${label} / SAR, excluding tax`}
          action={
            <Link
              href="/manager/sales"
              aria-label="View sales"
              className="rounded-sm p-1"
            >
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-[#667085]"
              />
            </Link>
          }
        >
          {data.sales.error ? (
            error("sales")
          ) : (
            <SalesTrendChart data={summary.trend} />
          )}
          {!data.sales.error &&
            (summary.undatedSales > 0 || summary.missingAmounts > 0) && (
              <p className="mt-3 text-xs leading-5 text-[#667085]">
                Only dated records with an amount are charted.
              </p>
            )}
        </ChartCard>
        <ChartCard
          title="Visit Status"
          subtitle={
            data.visits.error
              ? label
              : `${label} / ${summary.visits.length.toLocaleString()} visits`
          }
        >
          {data.visits.error ? (
            error("visits")
          ) : (
            <VisitStatusChart statuses={summary.statuses} />
          )}
        </ChartCard>
        <ChartCard
          title="Top Representatives by Completed Visits"
          subtitle={`${label} / Explicitly assigned visits`}
        >
          {data.visits.error || data.team.error ? (
            error(data.visits.error ? "visits" : "team")
          ) : (
            <RepPerformanceChart ranking={summary.ranking} />
          )}
          {!data.visits.error &&
            !data.team.error &&
            summary.unassignedCompleted > 0 && (
              <p className="mt-3 text-xs leading-5 text-[#667085]">
                {summary.unassignedCompleted} completed visits without a matched
                representative are excluded.
              </p>
            )}
        </ChartCard>
        {quality ? (
          <ChartCard
            title={
              quality.kind === "coaching"
                ? "Coaching Rating Distribution"
                : "Appraisal Score Overview"
            }
            subtitle={`${label} / ${quality.count} scored reviews${quality.kind === "appraisals" ? " / By appraisal period" : ""}`}
          >
            <QualityDistributionChart quality={quality} />
            {qualityNotice && (
              <p className="mt-3 text-xs leading-5 text-[#667085]">
                {qualityNotice}
              </p>
            )}
          </ChartCard>
        ) : qualityFailed ? (
          <ChartCard title="Team Quality" subtitle={label}>
            {error("team quality")}
          </ChartCard>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <TeamPerformancePanel summary={summary} />
        <TerritoryPerformancePanel summary={summary} />
        <RegionalCoveragePanel summary={summary} />
        <FieldCoveragePanel summary={summary} />
      </section>

      <OperationsSnapshot summary={summary} />

      <DashboardTables
        data={data}
        summary={summary}
        periodLabel={label}
        retry={retry}
        pending={pending}
      />

      <RecentActivityPanel summary={summary} />
    </div>
  );
}
