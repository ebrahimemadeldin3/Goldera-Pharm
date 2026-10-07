"use client";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarCheck2,
  CalendarPlus,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileBarChart,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getManagerOverview } from "./api";
import type { ManagerOverview, OverviewQuery, OverviewResult } from "./types";
import {
  defaultQuery,
  displayDay,
  EMPTY_OPTIONS,
  money,
  number,
  percentage,
} from "./format";
import { OverviewFilters } from "./OverviewFilters";
import {
  OverviewKPI,
  OverviewPanel,
  OverviewBoundary,
  OverviewProblem,
} from "./OverviewPrimitives";
import { OverviewSalesChart, OverviewVisitsChart } from "./OverviewCharts";
import {
  OverviewActivity,
  OverviewAttention,
  OverviewDirectory,
  OverviewGeography,
  OverviewHR,
  OverviewPeople,
  OverviewProducts,
  OverviewQuality,
  OverviewRecentSales,
  OverviewUpcoming,
  OverviewWorkflow,
} from "./OverviewPanels";
import styles from "./overview.module.css";

const shortcuts = [
  { title: "Add doctor", href: "/manager/doctors/add", icon: Stethoscope },
  { title: "Pharmacies", href: "/manager/pharmacies", icon: Building2 },
  { title: "Team", href: "/manager/team", icon: Users },
  { title: "Coaching", href: "/manager/coaching", icon: ClipboardCheck },
  { title: "Sales & uploads", href: "/manager/sales", icon: TrendingUp },
  { title: "Reports", href: "/manager/reports", icon: FileBarChart },
];
function queryFor(data: ManagerOverview): OverviewQuery {
  return { from: data.range.from, to: data.range.to, ...data.filters };
}

export default function ManagerOverviewDashboard({
  initial,
  now,
}: {
  initial: OverviewResult;
  now: string;
}) {
  const [result, setResult] = useState(initial);
  const [lastData, setLastData] = useState(
    initial.success ? initial.data : null,
  );
  const [query, setQuery] = useState<OverviewQuery>(() =>
    initial.success ? queryFor(initial.data) : defaultQuery(now),
  );
  const [pending, startTransition] = useTransition();
  const sequence = useRef(0);
  function refresh(next: OverviewQuery = query) {
    const request = ++sequence.current;
    setQuery(next);
    startTransition(async () => {
      const response = await getManagerOverview(next);
      if (request !== sequence.current) return;
      setResult(response);
      if (response.success) setLastData(response.data);
    });
  }
  const data = result.success ? result.data : null;
  const failed = data
    ? Object.entries(data.sections)
        .filter(([, section]) => section.status === "error")
        .map(([source]) => source)
    : [];
  const retry = () => refresh();
  const sections = data?.sections;
  const rangeLabel = data
    ? `${displayDay(data.range.from)} – ${displayDay(data.range.to)}`
    : `${displayDay(query.from)} – ${displayDay(query.to)}`;
  const refreshed = data
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.generatedAt))
    : null;
  return (
    <div className={styles.overview} aria-busy={pending}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            <span />
            Manager workspace
          </p>
          <h2>Performance overview</h2>
          <p className={styles.description}>
            A clear view of your team, field activity and commercial results.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            onClick={retry}
            disabled={pending}
            className="border-gp-border-control text-gp-navy-900 h-10 rounded-[10px] bg-white px-4"
          >
            <RefreshCw size={15} className={pending ? styles.spinning : ""} />
            {pending ? "Refreshing…" : "Refresh"}
          </Button>
          <Button
            asChild
            className="bg-gp-navy-900 hover:bg-gp-navy-850 h-10 rounded-[10px] px-4 text-white"
          >
            <Link href="/manager/visits/add">
              <CalendarPlus size={15} className="text-gp-gold-500" />
              Schedule visit
            </Link>
          </Button>
        </div>
      </header>
      <OverviewFilters
        applied={query}
        options={lastData?.options ?? EMPTY_OPTIONS}
        now={now}
        pending={pending}
        onApply={refresh}
        onReset={() => refresh(defaultQuery(now))}
      />
      <div className={styles.scopeLine}>
        <p>
          <CalendarCheck2 size={14} aria-hidden="true" />
          {rangeLabel}
        </p>
        <span aria-live="polite">
          {pending
            ? "Updating dashboard…"
            : refreshed
              ? `Updated ${refreshed} · Saudi time`
              : "Dashboard unavailable"}
        </span>
      </div>
      {!result.success && (
        <OverviewProblem
          title="The dashboard could not be loaded"
          message={
            result.error.statusCode === 401
              ? "Your session expired. Sign in again to continue."
              : result.error.message
          }
          retry={retry}
          pending={pending}
        />
      )}
      {!result.success && result.error.statusCode === 401 && (
        <Link href="/" className={styles.textLink}>
          Sign in again <ArrowUpRight size={14} />
        </Link>
      )}
      {data && sections && (
        <>
          {!!failed.length && (
            <div className={styles.recovery} role="alert">
              <div>
                <strong>Some dashboard data is unavailable</strong>
                <p>
                  {failed.join(", ")} · the other sections are still up to date.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={retry}
                className="rounded-[8px]"
              >
                <RefreshCw size={14} />
                Retry unavailable data
              </Button>
            </div>
          )}
          <section
            className={styles.kpis}
            aria-label="Key performance indicators"
          >
            <OverviewKPI
              title="Sales revenue"
              value={
                sections.sales.data
                  ? money(sections.sales.data.total, true)
                  : "—"
              }
              helper={
                sections.sales.data
                  ? `${number(sections.sales.data.records)} ledger records · excluding tax`
                  : ""
              }
              error={sections.sales.status === "error"}
              icon={TrendingUp}
              href="/manager/sales"
              scope={
                query.regionId !== "all" ||
                query.territoryId !== "all" ||
                query.district !== "all"
                  ? "Selected pharmacy territories"
                  : "Selected period · company sales"
              }
            />
            <OverviewKPI
              title="Completed visits"
              value={
                sections.visits.data
                  ? number(sections.visits.data.completed)
                  : "—"
              }
              helper={
                sections.visits.data
                  ? `${number(sections.visits.data.completed)} of ${number(sections.visits.data.total)} recorded visits`
                  : ""
              }
              error={sections.visits.status === "error"}
              icon={CalendarCheck2}
              href="/manager/visits"
              scope="Selected visit dates"
            />
            <OverviewKPI
              title="Visit completion"
              value={
                sections.visits.data
                  ? percentage(sections.visits.data.completionRate)
                  : "—"
              }
              helper="Completed / all visits, including cancelled"
              error={sections.visits.status === "error"}
              icon={ChartNoAxesCombined}
              href="/manager/visits"
              scope="Selected visit dates"
            />
            <OverviewKPI
              title="Active team"
              value={
                sections.team.data ? number(sections.team.data.active) : "—"
              }
              helper={
                sections.team.data
                  ? `${number(sections.team.data.reps)} reps · ${number(sections.team.data.supervisors)} supervisors`
                  : ""
              }
              error={sections.team.status === "error"}
              icon={Users}
              href="/manager/team"
              scope="Current account status"
            />
            <OverviewKPI
              title="Awaiting approval"
              value={
                sections.workflow.data
                  ? number(
                      sections.workflow.data.pendingRequests +
                        sections.workflow.data.pendingPlans,
                    )
                  : "—"
              }
              helper={
                sections.workflow.data
                  ? `${number(sections.workflow.data.pendingRequests)} requests · ${number(sections.workflow.data.pendingPlans)} plans`
                  : ""
              }
              error={sections.workflow.status === "error"}
              icon={ClipboardCheck}
              href="/manager/requests"
              scope="Current team approval queue"
            />
            <OverviewKPI
              title="Doctor directory"
              value={
                sections.directory.data
                  ? number(sections.directory.data.doctors)
                  : "—"
              }
              helper={
                sections.directory.data
                  ? `${number(sections.directory.data.activeDoctors)} active · ${number(sections.directory.data.pharmacies)} pharmacies`
                  : ""
              }
              error={sections.directory.status === "error"}
              icon={Stethoscope}
              href="/manager/doctors"
              scope="Current directory"
            />
          </section>
          <OverviewAttention data={data} />
          <section
            className={styles.analytics}
            aria-label="Sales and field analytics"
          >
            <OverviewPanel
              title="Sales trend"
              subtitle={`${data.range.bucket === "month" ? "Monthly" : "Daily"} recorded revenue · SAR, excluding tax`}
              href="/manager/sales"
            >
              <OverviewBoundary section={sections.sales} label="Sales trend">
                {(sales) => (
                  <>
                    <div className={styles.chartSummary}>
                      <strong>{money(sales.total)}</strong>
                      <span>{number(sales.quantity)} units recorded</span>
                    </div>
                    <OverviewSalesChart
                      data={sales}
                      bucket={data.range.bucket}
                    />
                    <p className={styles.helper}>
                      {sales.scope}. Representative filters do not apply to
                      sales because the ledger has no sales owner.
                    </p>
                    {sales.ambiguousAccounts > 0 && (
                      <p className={styles.helper}>
                        {number(sales.ambiguousAccounts)} pharmacy accounts have
                        ambiguous names and cannot be used for territory
                        attribution.
                      </p>
                    )}
                    {sales.unmatchedRecords > 0 && (
                      <p className={styles.helper}>
                        {number(sales.unmatchedRecords)} company ledger records
                        in this period have no unique pharmacy match and are
                        excluded from geographic filters.
                      </p>
                    )}
                  </>
                )}
              </OverviewBoundary>
            </OverviewPanel>
            <OverviewPanel
              title="Visit outcomes"
              subtitle="Recorded visits in the selected period"
              href="/manager/visits"
            >
              <OverviewBoundary
                section={sections.visits}
                label="Visit outcomes"
              >
                {(visits) => <OverviewVisitsChart data={visits} />}
              </OverviewBoundary>
            </OverviewPanel>
          </section>
          <OverviewPeople data={data} />
          <section
            className={styles.operations}
            aria-label="Approval, quality and account summaries"
          >
            <OverviewWorkflow data={data} />
            <OverviewQuality data={data} />
            <OverviewDirectory data={data} />
          </section>
          <section
            className={styles.detailGrid}
            aria-label="Territories, products and scheduled activity"
          >
            <OverviewGeography data={data} />
            <OverviewProducts data={data} />
            <OverviewUpcoming data={data} />
          </section>
          <section
            className={styles.bottomGrid}
            aria-label="Recent commercial and operational records"
          >
            <OverviewRecentSales data={data} />
            <OverviewActivity data={data} />
          </section>
          <OverviewHR data={data} />
        </>
      )}
      <nav className={styles.shortcuts} aria-label="Manager quick actions">
        {shortcuts.map(({ title, href, icon: Icon }) => (
          <Link href={href} key={href}>
            <Icon size={16} aria-hidden="true" />
            <span>{title}</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
