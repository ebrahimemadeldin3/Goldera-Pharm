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
import { money, PERIODS, summarizeDashboard } from "./dashboard-utils";
import type { DashboardData, Period } from "./dashboard-types";
import styles from "./manager-dashboard.module.css";

const shortcuts = [
  { label: "Schedule Visit", href: "/manager/visits", icon: CalendarPlus },
  {
    label: "New Coaching Review",
    href: "/manager/coaching",
    icon: ClipboardCheck,
  },
  { label: "Upload Sales", href: "/manager/sales", icon: Upload },
  { label: "Add Pharmacy", href: "/manager/pharmacies", icon: Plus },
  { label: "View Team", href: "/manager/team", icon: Users },
  { label: "Reports", href: "/manager/reports", icon: FileBarChart },
];

export default function ManagerDashboard({ data }: { data: DashboardData }) {
  const [period, setPeriod] = useState<Period>("month");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const summary = useMemo(
    () => summarizeDashboard(data, period),
    [data, period],
  );
  const label = PERIODS.find((option) => option.value === period)!.label;
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
            Monitor field activity, commercial performance and team progress.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <label
            htmlFor="manager-dashboard-period"
            className="text-xs font-medium text-[#667085]"
          >
            Reporting period
          </label>
          <select
            id="manager-dashboard-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="h-10 min-w-44 rounded-lg border border-[#DDE3EE] bg-white px-3 text-sm font-medium"
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-[#667085]">Saudi Arabia time</span>
        </div>
      </header>

      <section
        aria-label="Key performance indicators"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
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
          label="Active Team"
          value={summary.activeTeam.toLocaleString()}
          helper={`${summary.activeTeam} of ${data.team.data.length} team members`}
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
      </section>

      {period !== "all" && unavailableDates.length > 0 && (
        <p className="text-xs leading-5 text-[#667085]">
          Missing dates: {unavailableDates.join(", ")}. Included only in All
          Time totals.
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

      {((!data.visits.error && summary.pastScheduled > 0) ||
        summary.lowRatings > 0) && (
        <aside
          aria-label="Needs attention"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#E5E8EF] py-3 text-xs"
        >
          <h2 className="font-semibold">Needs attention</h2>
          {!data.visits.error && summary.pastScheduled > 0 && (
            <Link
              className="rounded-sm text-[#667085] underline decoration-[#DDE3EE] underline-offset-4"
              href="/manager/visits"
            >
              {summary.pastScheduled} past-date scheduled visits / Current
            </Link>
          )}
          {summary.lowRatings > 0 && (
            <Link
              className="rounded-sm text-[#667085] underline decoration-[#DDE3EE] underline-offset-4"
              href="/manager/coaching"
            >
              {summary.lowRatings} coaching ratings below 3 / {label}
            </Link>
          )}
        </aside>
      )}

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
      <DashboardTables
        data={data}
        summary={summary}
        periodLabel={label}
        retry={retry}
        pending={pending}
      />
    </div>
  );
}
