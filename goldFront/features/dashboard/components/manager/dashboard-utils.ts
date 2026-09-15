import {
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiWeekdayIndex,
  parseDateValue,
} from "@/lib/utils";
import { getSaleDateValue } from "@/features/sales/lib/utils";
import type { SaleApiResponse } from "@/features/sales/lib/types";
import type { AppraisalApiResponse } from "@/features/appraisal/lib/types";
import type { DashboardData, Period } from "./dashboard-types";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];
export const STATUSES = [
  { value: "COMPLETED", label: "Completed", color: "#398567" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#527CA5" },
  { value: "SCHEDULED", label: "Scheduled", color: "#C9A44C" },
  { value: "CANCELLED", label: "Cancelled", color: "#BD6666" },
];

export function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number =
    typeof value === "number" ? value : Number(value.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

export function dateKey(value?: string | null): string | null {
  if (!value) return null;
  const date = parseDateValue(value);
  if (!Number.isFinite(date.getTime())) return null;
  const key = formatDateOnly(date);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) && value !== key) return null;
  return key;
}

export function saleDate(sale: SaleApiResponse): string | undefined {
  // Upload/update timestamps cannot stand in for the date of a sale.
  return getSaleDateValue({
    ...sale,
    createdAt: undefined,
    updatedAt: undefined,
  });
}

export function displayDate(value?: string | null): string {
  return dateKey(value)
    ? formatSaudiDateDisplay(parseDateValue(value!))
    : "Date unavailable";
}

export function money(value: number): string {
  if (!Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function periodBounds(
  period: Period,
  now: string,
): [string, string] | null {
  if (period === "all") return null;
  const today = dateKey(now)!;
  if (period === "today") return [today, today];
  if (period === "year")
    return [`${today.slice(0, 4)}-01-01`, `${today.slice(0, 4)}-12-31`];
  if (period === "month") {
    const [year, month] = today.split("-").map(Number);
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return [`${today.slice(0, 7)}-01`, `${today.slice(0, 7)}-${last}`];
  }
  const first =
    parseDateValue(today).getTime() -
    getSaudiWeekdayIndex(parseDateValue(now)) * 86400000;
  return [
    formatDateOnly(new Date(first)),
    formatDateOnly(new Date(first + 6 * 86400000)),
  ];
}

function within(
  value: string | null | undefined,
  bounds: [string, string] | null,
): boolean {
  if (!bounds) return true;
  const key = dateKey(value);
  return !!key && key >= bounds[0] && key <= bounds[1];
}

const APPRAISAL_CRITERIA = [
  "presentationSkills",
  "sellingSkills",
  "reporting",
  "productInformation",
  "competitorsInformation",
  "organizationalValueAwareness",
  "properUtilizationOfResources",
  "reliabilityAndCredibility",
  "independenceAndJudgment",
  "teamSpirit",
  "personalDrive",
  "creativityAndInitiative",
  "broadProspective",
  "communicationSkills",
  "planningAndOrganizing",
  "appearance",
  "attitude",
  "timing",
] as const satisfies readonly (keyof AppraisalApiResponse)[];

export function appraisalScore(review: AppraisalApiResponse): number | null {
  const scores = APPRAISAL_CRITERIA.map((key) => finiteNumber(review[key]));
  if (scores.some((score) => score === null || score < 0 || score > 100))
    return null;
  return (
    (scores as number[]).reduce((sum, score) => sum + score, 0) / scores.length
  );
}

export function summarizeDashboard(data: DashboardData, period: Period) {
  const bounds = periodBounds(period, data.asOf);
  const sales = data.sales.data.filter((sale) =>
    within(saleDate(sale), bounds),
  );
  const visits = data.visits.data.filter((visit) => within(visit.date, bounds));
  const coaching = data.coaching.data.filter((report) =>
    within(report.visitDate, bounds),
  );
  const ratings = coaching
    .map((report) => finiteNumber(report.performanceRating))
    .filter(
      (rating): rating is number =>
        rating !== null &&
        Number.isInteger(rating) &&
        rating >= 1 &&
        rating <= 5,
    );
  const appraisals = data.appraisals.data.filter((review) =>
    within(review.period, bounds),
  );
  const scores = appraisals
    .map(appraisalScore)
    .filter((score): score is number => score !== null);
  const valuedSales = sales.flatMap((sale) => {
    const amount = finiteNumber(sale.untaxedTotal);
    return amount === null
      ? []
      : [{ sale, amount, key: dateKey(saleDate(sale)) }];
  });
  const datedSales = valuedSales.filter((entry) => entry.key !== null);
  const keys = datedSales.map((entry) => entry.key!).sort();
  const annual =
    period === "all" &&
    keys.length > 0 &&
    Number(keys.at(-1)!.slice(0, 4)) - Number(keys[0].slice(0, 4)) > 3;
  const bucketLength =
    period === "year" || period === "all" ? (annual ? 4 : 7) : 10;
  const groups = new Map<string, number>();
  for (const entry of datedSales) {
    const key = entry.key!.slice(0, bucketLength);
    groups.set(key, (groups.get(key) ?? 0) + entry.amount);
  }
  // A complete dated dataset permits zero-valued gaps, not synthetic trend points.
  if (keys.length) {
    const from = bounds?.[0] ?? keys[0];
    const to = bounds?.[1] ?? keys.at(-1)!;
    if (bucketLength === 10) {
      for (
        let ms = parseDateValue(from).getTime();
        ms <= parseDateValue(to).getTime();
        ms += 86400000
      ) {
        const key = formatDateOnly(new Date(ms));
        if (!groups.has(key)) groups.set(key, 0);
      }
    } else {
      let year = Number(from.slice(0, 4));
      let month = annual ? 1 : Number(from.slice(5, 7));
      while (`${year}-${String(month).padStart(2, "0")}-01` <= to) {
        const key = annual
          ? String(year)
          : `${year}-${String(month).padStart(2, "0")}`;
        if (!groups.has(key)) groups.set(key, 0);
        if (annual || month === 12) {
          year++;
          month = 1;
        } else month++;
      }
    }
  }
  const trend = [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => ({
      key,
      amount,
      label:
        key.length === 4
          ? key
          : new Intl.DateTimeFormat("en-US", {
              timeZone: "Asia/Riyadh",
              month: "short",
              ...(key.length === 10
                ? { day: "numeric" as const }
                : { year: "2-digit" as const }),
            }).format(parseDateValue(key.length === 7 ? `${key}-01` : key)),
    }));
  const knownStatuses = new Set(STATUSES.map((status) => status.value));
  const statuses = STATUSES.map((status) => ({
    ...status,
    count: visits.filter((visit) => visit.status === status.value).length,
  }));
  const other = visits.filter(
    (visit) => !knownStatuses.has(visit.status),
  ).length;
  if (other)
    statuses.push({
      value: "OTHER",
      label: "Other",
      color: "#8A94A6",
      count: other,
    });
  const completed = visits.filter((visit) => visit.status === "COMPLETED");
  const reps = new Map(
    data.team.data
      .filter((member) => member.role === "MEDICAL_REP")
      .map((member) => [member.id, member]),
  );
  const repCounts = new Map<string, number>();
  let unassignedCompleted = 0;
  for (const visit of completed) {
    const repId = visit.medicalRepId || visit.userId;
    if (!reps.has(repId)) {
      unassignedCompleted++;
      continue;
    }
    repCounts.set(repId, (repCounts.get(repId) ?? 0) + 1);
  }
  const ranking = [...repCounts]
    .map(([id, count]) => ({ id, name: reps.get(id)!.name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 6);
  const quality = ratings.length
    ? {
        kind: "coaching" as const,
        average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: ratings.length,
        distribution: ["Poor", "Fair", "Good", "Very Good", "Excellent"].map(
          (label, index) => ({
            label: `${index + 1} ${label}`,
            count: ratings.filter((rating) => rating === index + 1).length,
          }),
        ),
      }
    : scores.length
      ? {
          kind: "appraisals" as const,
          average: scores.reduce((a, b) => a + b, 0) / scores.length,
          count: scores.length,
          distribution: [
            {
              label: "Below 70",
              count: scores.filter((score) => score < 70).length,
            },
            {
              label: "70 to <90",
              count: scores.filter((score) => score >= 70 && score < 90).length,
            },
            {
              label: "90 to 100",
              count: scores.filter((score) => score >= 90).length,
            },
          ],
        }
      : null;
  const today = dateKey(data.asOf)!;
  const upcoming = data.visits.data
    .filter((visit) => {
      const key = dateKey(visit.date);
      return (
        key &&
        key >= today &&
        (visit.status === "SCHEDULED" || visit.status === "IN_PROGRESS")
      );
    })
    .sort(
      (a, b) =>
        dateKey(a.date)!.localeCompare(dateKey(b.date)!) ||
        (a.time || "").localeCompare(b.time || ""),
    )
    .slice(0, 6);
  const recentSales = [...sales]
    .sort((a, b) => {
      const aTime = dateKey(saleDate(a))
        ? parseDateValue(saleDate(a)!).getTime()
        : -Infinity;
      const bTime = dateKey(saleDate(b))
        ? parseDateValue(saleDate(b)!).getTime()
        : -Infinity;
      return aTime === bTime
        ? a.id.localeCompare(b.id)
        : aTime > bTime
          ? -1
          : 1;
    })
    .slice(0, 6);
  return {
    sales,
    visits,
    trend,
    statuses,
    ranking,
    quality,
    upcoming,
    recentSales,
    unassignedCompleted,
    completed: completed.length,
    completionRate: visits.length
      ? (completed.length / visits.length) * 100
      : null,
    salesTotal: valuedSales.reduce((sum, entry) => sum + entry.amount, 0),
    missingAmounts: sales.length - valuedSales.length,
    undatedSales: data.sales.data.filter((sale) => !dateKey(saleDate(sale)))
      .length,
    undatedVisits: data.visits.data.filter((visit) => !dateKey(visit.date))
      .length,
    undatedCoaching: data.coaching.data.filter(
      (report) => !dateKey(report.visitDate),
    ).length,
    undatedAppraisals: data.appraisals.data.filter(
      (review) => !dateKey(review.period),
    ).length,
    invalidRatings: coaching.length - ratings.length,
    invalidScores: appraisals.length - scores.length,
    activeTeam: data.team.data.filter((member) => member.isActive === true)
      .length,
    scheduled: visits.filter((visit) => visit.status === "SCHEDULED").length,
    pastScheduled: data.visits.data.filter((visit) => {
      const key = dateKey(visit.date);
      return key && key < today && visit.status === "SCHEDULED";
    }).length,
    lowRatings: ratings.filter((rating) => rating <= 2).length,
  };
}

export type DashboardSummary = ReturnType<typeof summarizeDashboard>;
