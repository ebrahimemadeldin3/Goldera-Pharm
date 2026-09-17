import {
  formatDateOnly,
  formatSaudiDateDisplay,
  getSaudiWeekdayIndex,
  parseDateValue,
} from "@/lib/utils";
import { getSaleDateValue } from "@/features/sales/lib/utils";
import type { SaleApiResponse } from "@/features/sales/lib/types";
import type { AppraisalApiResponse } from "@/features/appraisal/lib/types";
import type { RequestApiResponse } from "@/features/requests/lib/types";
import { normalizeDoctorForDirectory } from "@/features/doctors/lib/utils/mappers";
import { normalizePharmacyForDirectory } from "@/features/pharmacies/lib/utils/directory";
import {
  KSA_TERRITORY_STRUCTURE,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";
import {
  getTeamMemberAssignment,
  transformUserApiResponse,
} from "@/features/team/lib/utils";
import type { DashboardData, DashboardFilters, Period } from "./dashboard-types";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];
export const ALL_FILTER = "all";
export const STATUSES = [
  { value: "COMPLETED", label: "Completed", color: "#398567" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#527CA5" },
  { value: "SCHEDULED", label: "Scheduled", color: "#C9A44C" },
  { value: "CANCELLED", label: "Cancelled", color: "#BD6666" },
];

export function getDefaultDashboardFilters(asOf: string): DashboardFilters {
  const bounds = periodBounds("month", asOf);

  return {
    period: "month",
    customFrom: bounds?.[0] ?? "",
    customTo: bounds?.[1] ?? "",
    district: ALL_FILTER,
    region: ALL_FILTER,
    territory: ALL_FILTER,
    repId: ALL_FILTER,
  };
}

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
  const today = dateKey(now)!;
  if (period === "today") return [today, today];
  if (period === "custom") return null;
  if (period === "year")
    return [`${today.slice(0, 4)}-01-01`, `${today.slice(0, 4)}-12-31`];
  if (period === "quarter") {
    const [year, month] = today.split("-").map(Number);
    const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
    const quarterEndMonth = quarterStartMonth + 2;
    const last = new Date(Date.UTC(year, quarterEndMonth, 0)).getUTCDate();

    return [
      `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`,
      `${year}-${String(quarterEndMonth).padStart(2, "0")}-${last}`,
    ];
  }
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

function filterBounds(filters: DashboardFilters, now: string) {
  if (filters.period !== "custom") return periodBounds(filters.period, now);
  const from = dateKey(filters.customFrom);
  const to = dateKey(filters.customTo);

  if (from && to) return from <= to ? [from, to] : [to, from];
  if (from) return [from, from];
  if (to) return [to, to];
  return null;
}

export function formatDateRangeLabel(filters: DashboardFilters, now: string) {
  const bounds = filterBounds(filters, now);
  if (!bounds) return "Date range unavailable";
  const [from, to] = bounds;
  if (from === to) return formatSaudiDateDisplay(parseDateValue(from));

  return `${formatSaudiDateDisplay(parseDateValue(from))} - ${formatSaudiDateDisplay(parseDateValue(to))}`;
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

function repIdFromVisit(visit: { medicalRepId?: string; userId?: string }) {
  return visit.medicalRepId || visit.userId || "";
}

function requestDate(request: RequestApiResponse) {
  return request.createdAt || request.updatedAt;
}

function repIdFromRequest(request: RequestApiResponse) {
  return request.userId || request.user?.id || "";
}

function matchesAssignmentLocation(
  assignment: ReturnType<typeof getTeamMemberAssignment> | undefined,
  filters: DashboardFilters,
) {
  const hasLocationFilter =
    filters.district !== ALL_FILTER ||
    filters.region !== ALL_FILTER ||
    filters.territory !== ALL_FILTER;
  if (!hasLocationFilter) return true;
  if (!assignment?.hasTerritory) return false;
  if (filters.district !== ALL_FILTER && assignment.district !== filters.district) {
    return false;
  }
  if (filters.region !== ALL_FILTER && assignment.region !== filters.region) {
    return false;
  }
  if (
    filters.territory !== ALL_FILTER &&
    !assignment.territories.includes(filters.territory)
  ) {
    return false;
  }

  return true;
}

function matchesRep(repId: string, filters: DashboardFilters) {
  return filters.repId === ALL_FILTER || repId === filters.repId;
}

function filterByRepScope<T>(
  records: T[],
  getRepId: (record: T) => string,
  assignments: Map<string, ReturnType<typeof getTeamMemberAssignment>>,
  filters: DashboardFilters,
) {
  return records.filter((record) => {
    const repId = getRepId(record);
    if (!matchesRep(repId, filters)) return false;
    return matchesAssignmentLocation(assignments.get(repId), filters);
  });
}

function scoreDistribution(scores: number[]) {
  return [
    {
      label: "Below 70",
      count: scores.filter((score) => score < 70).length,
    },
    {
      label: "70 to 79",
      count: scores.filter((score) => score >= 70 && score < 80).length,
    },
    {
      label: "80 to 89",
      count: scores.filter((score) => score >= 80 && score < 90).length,
    },
    {
      label: "90 to 100",
      count: scores.filter((score) => score >= 90).length,
    },
  ];
}

export function summarizeDashboard(
  data: DashboardData,
  filters: DashboardFilters,
) {
  const bounds = filterBounds(filters, data.asOf);
  const members = data.team.data.map(transformUserApiResponse);
  const memberAssignments = new Map(
    members.map((member) => [member.id, getTeamMemberAssignment(member)]),
  );
  const medicalReps = members.filter((member) => member.role === "MEDICAL_REP");
  const supervisors = members.filter((member) => member.role === "SUPERVISOR");
  const scopedTeam = members.filter((member) => {
    if (!matchesRep(member.id, filters) && member.role === "MEDICAL_REP") {
      return false;
    }
    return matchesAssignmentLocation(memberAssignments.get(member.id), filters);
  });
  const scopedReps = medicalReps.filter((member) => {
    if (!matchesRep(member.id, filters)) return false;
    return matchesAssignmentLocation(memberAssignments.get(member.id), filters);
  });
  const sales = data.sales.data.filter((sale) =>
    within(saleDate(sale), bounds),
  );
  const visits = filterByRepScope(
    data.visits.data.filter((visit) => within(visit.date, bounds)),
    repIdFromVisit,
    memberAssignments,
    filters,
  );
  const doctors = data.doctors.data
    .map(normalizeDoctorForDirectory)
    .filter((doctor) => {
      if (filters.district !== ALL_FILTER && doctor.territory.district !== filters.district) {
        return false;
      }
      if (filters.region !== ALL_FILTER && doctor.territory.region !== filters.region) {
        return false;
      }
      if (
        filters.territory !== ALL_FILTER &&
        doctor.territory.territory !== filters.territory
      ) {
        return false;
      }
      return true;
    });
  const pharmacies = data.pharmacies.data
    .map(normalizePharmacyForDirectory)
    .filter((pharmacy) => {
      if (filters.district !== ALL_FILTER && pharmacy.district !== filters.district) {
        return false;
      }
      if (filters.region !== ALL_FILTER && pharmacy.region !== filters.region) {
        return false;
      }
      if (
        filters.territory !== ALL_FILTER &&
        pharmacy.territoryName !== filters.territory
      ) {
        return false;
      }
      return true;
    });
  const coaching = filterByRepScope(
    data.coaching.data.filter((report) => within(report.visitDate, bounds)),
    (report) => report.rep?.id || "",
    memberAssignments,
    filters,
  );
  const appraisals = filterByRepScope(
    data.appraisals.data.filter((review) => within(review.period, bounds)),
    (review) => review.repId,
    memberAssignments,
    filters,
  );
  const requests = filterByRepScope(
    data.requests.data.filter((request) => within(requestDate(request), bounds)),
    repIdFromRequest,
    memberAssignments,
    filters,
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
    keys.length > 0 &&
    Number(keys.at(-1)!.slice(0, 4)) - Number(keys[0].slice(0, 4)) > 3;
  const bucketLength = filters.period === "year" ? 7 : annual ? 4 : 10;
  const groups = new Map<string, number>();
  for (const entry of datedSales) {
    const key = entry.key!.slice(0, bucketLength);
    groups.set(key, (groups.get(key) ?? 0) + entry.amount);
  }
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
  if (other) {
    statuses.push({
      value: "OTHER",
      label: "Other",
      color: "#8A94A6",
      count: other,
    });
  }
  const completed = visits.filter((visit) => visit.status === "COMPLETED");
  const completedByRep = new Map<string, number>();
  let unassignedCompleted = 0;
  for (const visit of completed) {
    const repId = repIdFromVisit(visit);
    if (!memberAssignments.has(repId)) {
      unassignedCompleted++;
      continue;
    }
    completedByRep.set(repId, (completedByRep.get(repId) ?? 0) + 1);
  }
  const valuedSalesTotal = valuedSales.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );
  const scoredByRep = new Map(
    appraisals
      .map((review) => [review.repId, appraisalScore(review)] as const)
      .filter((entry): entry is readonly [string, number] => entry[1] !== null),
  );
  const ranking = [...completedByRep]
    .map(([id, count]) => ({
      id,
      name: members.find((member) => member.id === id)?.name ?? "Unknown rep",
      count,
    }))
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
          distribution: scoreDistribution(scores),
        }
      : null;
  const today = dateKey(data.asOf)!;
  const upcoming = filterByRepScope(
    data.visits.data.filter((visit) => {
      const key = dateKey(visit.date);
      return (
        key &&
        key >= today &&
        (visit.status === "SCHEDULED" || visit.status === "IN_PROGRESS")
      );
    }),
    repIdFromVisit,
    memberAssignments,
    filters,
  )
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
  const teamPerformance = scopedReps
    .map((rep) => {
      const assignment = memberAssignments.get(rep.id)!;
      const repVisits = visits.filter((visit) => repIdFromVisit(visit) === rep.id);
      const repCompleted = repVisits.filter(
        (visit) => visit.status === "COMPLETED",
      ).length;
      return {
        id: rep.id,
        name: rep.name,
        territories: assignment.territories,
        completedVisits: repCompleted,
        completionRate: repVisits.length ? (repCompleted / repVisits.length) * 100 : null,
        sales: null as number | null,
        appraisal: scoredByRep.get(rep.id) ?? null,
      };
    })
    .sort((a, b) => b.completedVisits - a.completedVisits || a.name.localeCompare(b.name));
  const territoryPerformance = scopedReps.flatMap((rep) => {
    const assignment = memberAssignments.get(rep.id)!;
    return assignment.territories.map((territory) => ({
      territory,
      region: assignment.region,
      repId: rep.id,
      repName: rep.name,
      visits: visits.filter((visit) => repIdFromVisit(visit) === rep.id).length,
      completedVisits: completed.filter((visit) => repIdFromVisit(visit) === rep.id).length,
      sales: null as number | null,
    }));
  });
  const regionalCoverage = KSA_TERRITORY_STRUCTURE.flatMap((district) =>
    district.regions.map((region) => ({
      district: district.name,
      region: region.name,
      territories: region.territories.map((territory) => {
        const assignedReps = medicalReps.filter((rep) =>
          memberAssignments.get(rep.id)?.territories.includes(territory.name),
        );
        return {
          name: territory.name,
          assigned: assignedReps.map((rep) => rep.name),
        };
      }),
    })),
  );
  const doctorFacilities = new Set(
    doctors.map((doctor) => doctor.accountName).filter(Boolean),
  ).size;
  const pharmacyCities = new Set(
    pharmacies.map((pharmacy) => pharmacy.city).filter(Boolean),
  ).size;
  const territoryNames = new Set([
    ...doctors.map((doctor) => doctor.territory.territory),
    ...pharmacies.map((pharmacy) => pharmacy.territoryName),
  ]);
  const requestStats = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "PENDING").length,
    approved: requests.filter((request) => request.status === "APPROVED").length,
    rejected: requests.filter((request) => request.status === "REJECTED").length,
  };
  const hrSnapshot = {
    totalEmployees: scopedTeam.length,
    activeEmployees: scopedTeam.filter((member) => member.isActive === true).length,
    reps: scopedReps.length,
    supervisors: supervisors.filter((member) =>
      matchesAssignmentLocation(memberAssignments.get(member.id), filters),
    ).length,
    approvedLeaveDays: data.team.data.reduce(
      (sum, member) => sum + (finiteNumber(member.leaveDaysCountTotal) ?? 0),
      0,
    ),
  };
  const dataQuality = {
    repsWithTerritory: medicalReps.filter(
      (rep) => memberAssignments.get(rep.id)?.hasTerritory,
    ).length,
    totalReps: medicalReps.length,
    doctorsMissingEmail: doctors.filter((doctor) => !doctor.email).length,
    doctorsMissingPhone: doctors.filter((doctor) => !doctor.phone).length,
    pharmaciesMissingCity: pharmacies.filter((pharmacy) => !pharmacy.city).length,
    teamMissingTerritory: medicalReps.filter(
      (rep) => !memberAssignments.get(rep.id)?.hasTerritory,
    ).length,
  };
  const recentActivity = [
    ...completed.slice(0, 8).map((visit) => ({
      id: `visit-${visit.id}`,
      date: visit.date,
      label: "Visit completed",
      detail: `${members.find((member) => member.id === repIdFromVisit(visit))?.name ?? "Rep unavailable"} / ${
        memberAssignments.get(repIdFromVisit(visit))?.territory || "Territory unavailable"
      }`,
    })),
    ...requests.slice(0, 8).map((request) => ({
      id: `request-${request.id}`,
      date: requestDate(request),
      label: `${request.status.toLowerCase()} request`,
      detail: request.user?.name || "Employee unavailable",
    })),
    ...coaching.slice(0, 8).map((report) => ({
      id: `coaching-${report.id}`,
      date: report.visitDate,
      label: "Coaching review",
      detail: report.rep?.name || "Rep unavailable",
    })),
  ]
    .filter((item) => dateKey(item.date))
    .sort((a, b) => dateKey(b.date)!.localeCompare(dateKey(a.date)!))
    .slice(0, 6);

  return {
    bounds,
    sales,
    visits,
    doctors,
    pharmacies,
    requests,
    coaching,
    appraisals,
    trend,
    statuses,
    ranking,
    quality,
    upcoming,
    recentSales,
    teamPerformance,
    territoryPerformance,
    regionalCoverage,
    requestStats,
    hrSnapshot,
    dataQuality,
    recentActivity,
    fieldCoverage: {
      doctors: doctors.length,
      pharmacies: pharmacies.length,
      facilities: doctorFacilities,
      pharmacyCities,
      territories: territoryNames.size,
      specialties: new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean)).size,
    },
    unsupportedFilters: {
      sales:
        filters.repId !== ALL_FILTER ||
        filters.district !== ALL_FILTER ||
        filters.region !== ALL_FILTER ||
        filters.territory !== ALL_FILTER,
    },
    unassignedCompleted,
    completed: completed.length,
    completionRate: visits.length
      ? (completed.length / visits.length) * 100
      : null,
    salesTotal: valuedSalesTotal,
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
    activeTeam: scopedTeam.filter((member) => member.isActive === true).length,
    scheduled: visits.filter((visit) => visit.status === "SCHEDULED").length,
    pastScheduled: filterByRepScope(
      data.visits.data.filter((visit) => {
        const key = dateKey(visit.date);
        return key && key < today && visit.status === "SCHEDULED";
      }),
      repIdFromVisit,
      memberAssignments,
      filters,
    ).length,
    lowRatings: ratings.filter((rating) => rating <= 2).length,
  };
}

export type DashboardSummary = ReturnType<typeof summarizeDashboard>;
