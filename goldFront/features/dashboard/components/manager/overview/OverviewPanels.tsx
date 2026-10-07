"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import type { ManagerOverview } from "./types";
import { displayDay, money, number, percentage } from "./format";
import {
  OverviewBoundary,
  OverviewEmpty,
  OverviewPanel,
  OverviewStatus,
} from "./OverviewPrimitives";
import styles from "./overview.module.css";

export function OverviewPeople({ data }: { data: ManagerOverview }) {
  const [sort, setSort] = useState("completed");
  const [expanded, setExpanded] = useState(false);
  const { team, visits, coaching, workflow } = data.sections;
  const rows = useMemo(
    () =>
      (team.data?.performanceMembers ?? team.data?.members ?? [])
        .filter((member) => member.role === "MEDICAL_REP")
        .map((member) => {
          const activity =
            visits.data?.byRep.filter((row) => row.id === member.id) ?? [];
          const total = activity.reduce((sum, row) => sum + row.count, 0);
          const completed =
            activity.find((row) => row.status === "COMPLETED")?.count ?? 0;
          const scheduled =
            activity.find((row) => row.status === "SCHEDULED")?.count ?? 0;
          const plan = workflow.data?.byRep.find((row) => row.id === member.id);
          const rating =
            coaching.data?.byRep.find((row) => row.id === member.id)?.average ??
            null;
          return {
            ...member,
            total,
            completed,
            scheduled,
            completion: total ? (completed / total) * 100 : null,
            plan,
            rating,
          };
        })
        .filter(
          (row) =>
            row.inCurrentScope !== false ||
            row.total > 0 ||
            data.filters.repId === row.id,
        )
        .sort((a, b) =>
          sort === "name"
            ? a.name.localeCompare(b.name)
            : sort === "rate"
              ? (b.completion ?? -1) - (a.completion ?? -1) ||
                a.name.localeCompare(b.name)
              : b.completed - a.completed || a.name.localeCompare(b.name),
        ),
    [
      team.data,
      visits.data,
      coaching.data,
      workflow.data,
      data.filters.repId,
      sort,
    ],
  );
  return (
    <OverviewPanel
      title="Medical rep performance"
      subtitle="Visit activity in the selected period · plans starting in that period"
      href="/manager/team"
      className={styles.widePanel}
      action={
        <label className={styles.sortControl}>
          <ArrowDownWideNarrow size={15} aria-hidden="true" />
          <select
            aria-label="Sort representative performance"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="completed">Completed visits</option>
            <option value="rate">Completion rate</option>
            <option value="name">Name</option>
          </select>
        </label>
      }
    >
      <OverviewBoundary section={team} label="Team performance">
        {() =>
          !rows.length ? (
            <OverviewEmpty title="No representatives in this scope">
              Try another representative or territory filter.
            </OverviewEmpty>
          ) : (
            <>
              <div
                className={styles.tableScroll}
                role="region"
                aria-label="Medical representative performance table"
                tabIndex={0}
              >
                <table className={styles.peopleTable}>
                  <caption className="sr-only">
                    Representative activity and complete execution of approved
                    plans starting in the reporting period
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Representative</th>
                      <th scope="col">Territory</th>
                      <th scope="col">Completed</th>
                      <th scope="col">Scheduled</th>
                      <th scope="col">Completion</th>
                      <th scope="col">Plan progress</th>
                      <th scope="col">Coaching</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expanded ? rows : rows.slice(0, 12)).map((rep, i) => (
                      <tr key={rep.id}>
                        <td>
                          <Link
                            href={`/manager/team/${rep.id}`}
                            className={styles.person}
                          >
                            <span
                              className={styles.personAvatar}
                              aria-hidden="true"
                            >
                              {rep.name.trim().slice(0, 1).toUpperCase()}
                            </span>
                            <span>
                              <strong>{rep.name}</strong>
                              <small>
                                {rep.supervisor || "No supervisor assigned"}
                              </small>
                            </span>
                            {sort === "completed" &&
                              i === 0 &&
                              rep.completed > 0 &&
                              visits.status === "ready" && (
                                <Star
                                  size={13}
                                  className={styles.gold}
                                  aria-label="Most completed visits"
                                />
                              )}
                          </Link>
                        </td>
                        <td>{rep.territories.join(" / ") || "Not assigned"}</td>
                        <td className={styles.numeric}>
                          {visits.data ? number(rep.completed) : "—"}
                        </td>
                        <td className={styles.numeric}>
                          {visits.data ? number(rep.scheduled) : "—"}
                        </td>
                        <td>
                          {visits.data ? (
                            <div className={styles.rateCell}>
                              <strong>{percentage(rep.completion)}</strong>
                              <span className={styles.miniTrack}>
                                <i
                                  style={{ width: `${rep.completion ?? 0}%` }}
                                />
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className={styles.numeric}>
                          {workflow.data
                            ? `${number(rep.plan?.completed ?? 0)} / ${number(rep.plan?.target ?? 0)}`
                            : "—"}
                        </td>
                        <td className={styles.numeric}>
                          {coaching.data && rep.rating !== null
                            ? `${rep.rating.toFixed(1)} / 5`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className={styles.panelFooter}>
                <span>
                  {number(rows.length)} representatives · plan progress covers
                  each approved plan’s full duration
                </span>
                <div>
                  {rows.length > 12 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((value) => !value)}
                    >
                      {expanded ? "Show fewer" : "Show all"}
                    </button>
                  )}
                  <Link href="/manager/team">
                    View team <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </footer>
            </>
          )
        }
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewWorkflow({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Approvals & plans"
      subtitle="Your team’s approval queue and plan execution"
      href="/manager/requests"
    >
      <OverviewBoundary
        section={data.sections.workflow}
        label="Approval and plan data"
      >
        {(workflow) => (
          <>
            <div className={styles.queueGrid}>
              <Link href="/manager/requests">
                <ClipboardCheck size={18} aria-hidden="true" />
                <strong>{number(workflow.pendingRequests)}</strong>
                <span>Requests to review</span>
              </Link>
              <Link href="/manager/plan">
                <CalendarDays size={18} aria-hidden="true" />
                <strong>{number(workflow.pendingPlans)}</strong>
                <span>Plans to review</span>
              </Link>
            </div>
            <p className={styles.helper}>
              Awaiting review now · independent of the date filter
            </p>
            <div className={styles.planProgress}>
              <div>
                <span>Approved plan achievement</span>
                <strong>{percentage(workflow.achievement)}</strong>
              </div>
              <span className={styles.progressTrack}>
                <i
                  style={{
                    width: `${Math.min(workflow.achievement ?? 0, 100)}%`,
                  }}
                />
              </span>
              <p>
                {number(workflow.completed)} completed /{" "}
                {number(workflow.target)} target visits
              </p>
              <small>
                Plans starting in this period, measured across their full
                duration.
              </small>
            </div>
            <div className={styles.statusSummary}>
              {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                <div key={status}>
                  <OverviewStatus status={status} />
                  <strong>
                    {number(
                      workflow.requests.find((row) => row.status === status)
                        ?.count ?? 0,
                    )}
                  </strong>
                </div>
              ))}
            </div>
            <p className={styles.helper}>Request history · selected period</p>
          </>
        )}
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewQuality({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Coaching & appraisals"
      subtitle="Recorded feedback in the selected period"
      href="/manager/coaching"
    >
      <OverviewBoundary section={data.sections.coaching} label="Coaching">
        {(coaching) => (
          <div className={styles.qualityBlock}>
            <div className={styles.qualityHeading}>
              <span>
                <Star size={16} aria-hidden="true" />
                Average coaching rating
              </span>
              <strong>
                {coaching.average === null ? "—" : coaching.average.toFixed(1)}
                <small> / 5</small>
              </strong>
            </div>
            {!coaching.scored ? (
              <p className={styles.helper}>
                No scored coaching reviews in this period.
              </p>
            ) : (
              <div
                className={styles.ratingBars}
                aria-label="Coaching rating distribution"
              >
                {[1, 2, 3, 4, 5].map((rating) => {
                  const count =
                    coaching.distribution.find((row) => row.rating === rating)
                      ?.count ?? 0;
                  return (
                    <div key={rating}>
                      <span>
                        {rating}
                        <Star size={10} aria-hidden="true" />
                      </span>
                      <i>
                        <b
                          style={{
                            width: `${(count / coaching.scored) * 100}%`,
                          }}
                        />
                      </i>
                      <strong>{number(count)}</strong>
                    </div>
                  );
                })}
              </div>
            )}
            <div className={styles.qualityMeta}>
              <span>{number(coaching.scored)} scored reviews</span>
              <span>{number(coaching.followUps)} awaiting acknowledgement</span>
            </div>
            {coaching.excluded > 0 && (
              <p className={styles.helper}>
                {number(coaching.excluded)} invalid or unrated reviews excluded.
              </p>
            )}
          </div>
        )}
      </OverviewBoundary>
      <OverviewBoundary section={data.sections.appraisals} label="Appraisals">
        {(appraisals) => (
          <div className={styles.appraisalBlock}>
            <div>
              <span>Average appraisal score</span>
              <strong>
                {appraisals.average === null
                  ? "—"
                  : appraisals.average.toFixed(1)}
                <small> / 100</small>
              </strong>
            </div>
            <p className={styles.helper}>
              {number(appraisals.scored)} complete appraisals · 18 criteria
            </p>
            {appraisals.excluded > 0 && (
              <p className={styles.helper}>
                {number(appraisals.excluded)} incomplete appraisals excluded.
              </p>
            )}
            {!!appraisals.distribution.length && (
              <ul className={styles.scoreBands}>
                {appraisals.distribution.map((band) => (
                  <li key={band.label}>
                    <span>{band.label}</span>
                    <strong>{number(band.count)}</strong>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/manager/appraisal" className={styles.textLink}>
              View appraisals <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewDirectory({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Account coverage"
      subtitle="Current doctor and pharmacy directory"
      href="/manager/doctors"
    >
      <OverviewBoundary
        section={data.sections.directory}
        label="Account coverage"
      >
        {(directory) => (
          <>
            <div className={styles.directoryNumbers}>
              <Link href="/manager/doctors">
                <strong>{number(directory.doctors)}</strong>
                <span>Doctors</span>
              </Link>
              <Link href="/manager/pharmacies">
                <strong>{number(directory.pharmacies)}</strong>
                <span>Pharmacies</span>
              </Link>
              <div>
                <strong>{number(directory.facilities)}</strong>
                <span>Facilities</span>
              </div>
            </div>
            <p className={styles.helper}>{directory.scope}</p>
            <div className={styles.coverageFigure}>
              <span>Doctors visited in this period</span>
              <strong>
                {data.sections.visits.data
                  ? `${number(data.sections.visits.data.coveredDoctors)} / ${number(directory.doctors)}`
                  : "Visit data unavailable"}
              </strong>
            </div>
            <div className={styles.qualityChecklist}>
              <Link href="/manager/doctors">
                <span>Missing doctor email</span>
                <strong>{number(directory.missingEmail)}</strong>
              </Link>
              <Link href="/manager/doctors">
                <span>Missing doctor phone</span>
                <strong>{number(directory.missingPhone)}</strong>
              </Link>
              <Link href="/manager/pharmacies">
                <span>Missing pharmacy city</span>
                <strong>{number(directory.missingCity)}</strong>
              </Link>
            </div>
          </>
        )}
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewGeography({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Territory coverage"
      subtitle="Current assignments · visit activity in the selected period"
      href="/manager/team"
    >
      <OverviewBoundary
        section={data.sections.directory}
        label="Territory coverage"
      >
        {(directory) =>
          !directory.coverage.length ? (
            <OverviewEmpty title="No configured territories in this scope">
              Manage territory assignments from the team page.
            </OverviewEmpty>
          ) : (
            <ul className={styles.territories}>
              {directory.coverage.map((territory) => (
                <li key={territory.id}>
                  <span className={styles.territoryIcon}>
                    <MapPin size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{territory.name}</strong>
                    <span>{territory.region}</span>
                  </div>
                  <div className={styles.territoryRep}>
                    {territory.reps.length ? (
                      territory.reps.map((rep) => (
                        <Link href={`/manager/team/${rep.id}`} key={rep.id}>
                          {rep.name}
                        </Link>
                      ))
                    ) : (
                      <span className={styles.unassigned}>No assigned rep</span>
                    )}
                    <small>
                      {data.sections.visits.data?.byTerritory
                        ? `${number(data.sections.visits.data.byTerritory.filter((row) => row.id === territory.id).reduce((sum, row) => sum + row.completed, 0))} / ${number(data.sections.visits.data.byTerritory.filter((row) => row.id === territory.id).reduce((sum, row) => sum + row.total, 0))} visits completed`
                        : "Visit data unavailable"}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewProducts({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Leading products"
      subtitle="Ranked by recorded sales value · selected period"
      href="/manager/products"
    >
      <OverviewBoundary section={data.sections.sales} label="Product sales">
        {(sales) =>
          !sales.products.length ? (
            <OverviewEmpty title="No product sales in this period" />
          ) : (
            <ol className={styles.products}>
              {sales.products.map((product, index) => (
                <li key={product.id}>
                  <span className={styles.rank}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{number(product.quantity)} units</span>
                  </div>
                  <strong>{money(product.amount)}</strong>
                </li>
              ))}
            </ol>
          )
        }
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewUpcoming({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Upcoming visits"
      subtitle="Today onward · follows rep and territory filters"
      href="/manager/visits"
    >
      <OverviewBoundary section={data.sections.visits} label="Upcoming visits">
        {(visits) =>
          !visits.upcoming.length ? (
            <OverviewEmpty title="No upcoming visits scheduled">
              <Link href="/manager/visits/add" className={styles.textLink}>
                Schedule a visit <ArrowRight size={14} />
              </Link>
            </OverviewEmpty>
          ) : (
            <ul className={styles.upcoming}>
              {visits.upcoming.map((visit) => (
                <li key={visit.id}>
                  <span className={styles.dateTile}>
                    <strong>
                      {new Intl.DateTimeFormat("en-GB", {
                        day: "numeric",
                        timeZone: "Asia/Riyadh",
                      }).format(new Date(visit.date))}
                    </strong>
                    <small>
                      {new Intl.DateTimeFormat("en-GB", {
                        month: "short",
                        timeZone: "Asia/Riyadh",
                      }).format(new Date(visit.date))}
                    </small>
                  </span>
                  <div>
                    <Link href={`/manager/doctors/${visit.doctorId}`}>
                      {visit.doctor}
                    </Link>
                    <span>
                      {visit.rep} ·{" "}
                      {visit.territory || "Territory not recorded"}
                    </span>
                  </div>
                  <time>{visit.time || "Time not set"}</time>
                </li>
              ))}
            </ul>
          )
        }
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewRecentSales({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Recent sales"
      subtitle="Latest transactions in the selected period · excluding tax"
      href="/manager/sales"
    >
      <OverviewBoundary section={data.sections.sales} label="Recent sales">
        {(sales) =>
          !sales.recent.length ? (
            <OverviewEmpty title="No sales records in this period" />
          ) : (
            <div
              className={styles.tableScroll}
              role="region"
              aria-label="Recent sales table"
              tabIndex={0}
            >
              <table className={styles.salesTable}>
                <caption className="sr-only">
                  Recent recorded sales transactions
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Customer</th>
                    <th scope="col">Product</th>
                    <th scope="col">Date</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.recent.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.customer}</td>
                      <td>{sale.product}</td>
                      <td>{displayDay(sale.date, true)}</td>
                      <td className={styles.numeric}>{money(sale.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </OverviewBoundary>
    </OverviewPanel>
  );
}

export function OverviewActivity({ data }: { data: ManagerOverview }) {
  const records = [
    ...(data.sections.visits.data?.recent ?? []).map((row) => ({
      id: `visit-${row.id}`,
      date: row.date,
      title: `${row.status.toLowerCase()} visit`,
      detail: `${row.doctor} · ${row.rep}`,
      href: `/manager/doctors/${row.doctorId}`,
    })),
    ...(data.sections.workflow.data?.recentRequests ?? []).map((row) => ({
      id: `request-${row.id}`,
      date: row.date,
      title: row.title,
      detail: `${row.employee} · ${row.status.toLowerCase()} request`,
      href: "/manager/requests",
    })),
    ...(data.sections.coaching.data?.recent ?? []).map((row) => ({
      id: `coaching-${row.id}`,
      date: row.date,
      title: "Coaching review",
      detail: `${row.employee} · ${row.rating} / 5`,
      href: "/manager/coaching",
    })),
    ...(data.sections.appraisals.data?.recent ?? []).map((row) => ({
      id: `appraisal-${row.id}`,
      date: row.date,
      title: "Appraisal review",
      detail: `${row.employee} · ${row.acknowledged ? "acknowledged" : "awaiting acknowledgement"}`,
      href: "/manager/appraisal",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        a.id.localeCompare(b.id),
    )
    .slice(0, 6);
  const partial = [
    data.sections.visits,
    data.sections.workflow,
    data.sections.coaching,
    data.sections.appraisals,
  ].some((section) => section.status === "error");
  return (
    <OverviewPanel
      title="Latest records"
      subtitle="Operational records in the selected period"
    >
      {partial && (
        <p className={styles.helper}>
          Some sources are unavailable. Showing records from the sources that
          loaded.
        </p>
      )}
      {!records.length ? (
        <OverviewEmpty
          title={
            partial
              ? "Record sources are unavailable"
              : "No operational records in this period"
          }
        />
      ) : (
        <ul className={styles.activity}>
          {records.map((record) => (
            <li key={record.id}>
              <span className={styles.activityDot} aria-hidden="true" />
              <div>
                <Link href={record.href}>{record.title}</Link>
                <p>{record.detail}</p>
              </div>
              <time>{displayDay(record.date, true)}</time>
            </li>
          ))}
        </ul>
      )}
    </OverviewPanel>
  );
}

export function OverviewAttention({ data }: { data: ManagerOverview }) {
  const attention = [
    data.sections.directory.data?.unassignedTerritories
      ? {
          key: "territories",
          count: data.sections.directory.data.unassignedTerritories,
          label: "configured territories have no assigned rep",
          href: "/manager/team",
          icon: MapPin,
        }
      : null,
    data.sections.visits.data?.overdue
      ? {
          key: "overdue",
          count: data.sections.visits.data.overdue,
          label: "scheduled visits are past their planned date",
          href: "/manager/visits",
          icon: CalendarDays,
        }
      : null,
    data.sections.team.data?.missingTerritory
      ? {
          key: "assignments",
          count: data.sections.team.data.missingTerritory,
          label: "medical reps need a territory assignment",
          href: "/manager/team",
          icon: Users,
        }
      : null,
    data.sections.coaching.data?.lowRatings
      ? {
          key: "coaching",
          count: data.sections.coaching.data.lowRatings,
          label: "coaching reviews scored 2 or below",
          href: "/manager/coaching",
          icon: ClipboardCheck,
        }
      : null,
  ].filter((item) => item !== null);
  if (!attention.length) return null;
  return (
    <aside
      className={styles.attention}
      aria-label="Items requiring management attention"
    >
      {attention.map(({ key, count, label, href, icon: Icon }) => (
        <Link key={key} href={href}>
          <Icon size={16} aria-hidden="true" />
          <span>
            <strong>{number(count)}</strong> {label}
          </span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      ))}
    </aside>
  );
}

export function OverviewHR({ data }: { data: ManagerOverview }) {
  return (
    <OverviewPanel
      title="Team snapshot"
      subtitle="Current employee records in the selected assignment"
      href="/manager/hr"
    >
      <OverviewBoundary section={data.sections.team} label="Employee records">
        {(team) => (
          <div className={styles.teamSnapshot}>
            <div>
              <span>Employees</span>
              <strong>{number(team.total)}</strong>
              <small>{number(team.active)} active accounts</small>
            </div>
            <div>
              <span>Medical reps</span>
              <strong>{number(team.reps)}</strong>
              <small>
                {number(team.supervisors)}{" "}
                {team.supervisors === 1 ? "supervisor" : "supervisors"}
              </small>
            </div>
            <div>
              <span>Reps missing territory</span>
              <strong>{number(team.missingTerritory)}</strong>
              <small>Current assignments</small>
            </div>
            <div>
              <span>Recent rep logins</span>
              <strong>{number(team.recentLogins)}</strong>
              <small>Active reps · last 7 days</small>
            </div>
            <div>
              <span>Approved leave days</span>
              <strong>
                {team.leaveDays === null ? "—" : number(team.leaveDays)}
              </strong>
              <small>
                {team.leaveDays === null
                  ? "Some employee totals are not recorded"
                  : "Employee totals to date"}
              </small>
            </div>
          </div>
        )}
      </OverviewBoundary>
    </OverviewPanel>
  );
}
