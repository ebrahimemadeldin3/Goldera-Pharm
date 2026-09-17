import "server-only";
import { fetchSales } from "@/features/sales/api";
import { extractSales, getSalesTotalCount } from "@/features/sales/lib/utils";
import { fetchAllVisits } from "@/features/visits/api";
import { getManagerTeam } from "@/features/team/api";
import { getAllCoachingReports } from "@/features/coaching/api";
import { getAppraisals } from "@/features/appraisal/api";
import { fetchDoctors } from "@/features/doctors/api";
import { fetchPharmacies } from "@/features/pharmacies/api";
import { fetchManagerTeamRequests } from "@/features/requests/api";
import type { Dataset, DashboardData } from "./dashboard-types";

type Page<T> = { data: T[]; results: number };

// Honor server page-size caps and reject incomplete snapshots before aggregating.
export async function collectPages<T extends { id: string }>(
  fetchPage: (page: number, limit: number) => Promise<Page<T>>,
): Promise<T[]> {
  const first = await fetchPage(1, 200);
  if (!Number.isInteger(first.results) || first.results < 0)
    throw new Error("Invalid count");
  const records = new Map(first.data.map((item) => [item.id, item]));
  if (records.size === first.results) return [...records.values()];
  if (!records.size || records.size !== first.data.length)
    throw new Error("Incomplete dataset");
  const limit = first.data.length;
  const pages = Math.ceil(first.results / limit);
  for (let page = 2; page <= pages; page++) {
    const next = await fetchPage(page, limit);
    if (next.results !== first.results || !next.data.length)
      throw new Error("Dataset changed");
    for (const item of next.data) {
      if (records.has(item.id)) throw new Error("Repeated page");
      records.set(item.id, item);
    }
  }
  if (records.size !== first.results) throw new Error("Incomplete dataset");
  return [...records.values()];
}

function settle<T>(result: PromiseSettledResult<T[]>): Dataset<T> {
  return result.status === "fulfilled"
    ? { data: result.value, error: false }
    : { data: [], error: true };
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [
    sales,
    visits,
    team,
    coaching,
    appraisals,
    doctors,
    pharmacies,
    requests,
  ] = await Promise.allSettled([
    collectPages(async (page, limit) => {
      const response = await fetchSales({ page, limit });
      const data = extractSales(response);
      return { data, results: getSalesTotalCount(response, data.length) };
    }),
    collectPages((page, limit) => fetchAllVisits(page, limit)),
    Promise.all([
      collectPages((page, limit) => getManagerTeam("MEDICAL_REP", page, limit)),
      collectPages((page, limit) => getManagerTeam("SUPERVISOR", page, limit)),
    ]).then((groups) => [
      ...new Map(groups.flat().map((member) => [member.id, member])).values(),
    ]),
    collectPages((page, limit) => getAllCoachingReports(page, limit)),
    collectPages((page, limit) => getAppraisals(page, limit)),
    collectPages((page, limit) => fetchDoctors(page, limit)),
    collectPages((page, limit) => fetchPharmacies(page, limit)),
    collectPages((page, limit) => fetchManagerTeamRequests(page, limit)),
  ]);
  return {
    sales: settle(sales),
    visits: settle(visits),
    team: settle(team),
    coaching: settle(coaching),
    appraisals: settle(appraisals),
    doctors: settle(doctors),
    pharmacies: settle(pharmacies),
    requests: settle(requests),
    asOf: new Date().toISOString(),
  };
}
