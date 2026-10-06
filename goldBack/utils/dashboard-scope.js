import { ApiError } from "./apiError.js";

export const DASHBOARD_TIME_ZONE = "Asia/Riyadh";
const dayMs = 86400000;
export function dashboardDay(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
export function dashboardRange(query, now = new Date()) {
  const today = dashboardDay(now);
  const defaultFrom = `${today.slice(0, 7)}-01`;
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const defaultTo = `${today.slice(0, 7)}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
  const from = query.from ?? defaultFrom;
  const to = query.to ?? defaultTo;
  for (const key of [from, to]) {
    if (
      typeof key !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(key) ||
      !Number.isFinite(Date.parse(`${key}T00:00:00Z`)) ||
      new Date(`${key}T00:00:00Z`).toISOString().slice(0, 10) !== key
    )
      throw new ApiError("Select a valid dashboard date range", 400);
  }
  const days = Math.round((Date.parse(to) - Date.parse(from)) / dayMs) + 1;
  if (days < 1 || days > 1827)
    throw new ApiError(
      "Select a date range of up to five years, with the start before the end",
      400,
    );
  return {
    from,
    to,
    start: new Date(`${from}T00:00:00+03:00`),
    end: new Date(new Date(`${to}T00:00:00+03:00`).getTime() + dayMs),
    today,
    todayStart: new Date(`${today}T00:00:00+03:00`),
    bucket: days > 90 ? "month" : "day",
  };
}
export function geographyKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\-/\s]+/g, "")
    .replace(/ـ/g, "");
}
const regionDistricts = new Map([
  ["central", "Central & Eastern District"],
  ["centralregion", "Central & Eastern District"],
  ["eastern", "Central & Eastern District"],
  ["easternregion", "Central & Eastern District"],
  ["western", "Western & Southern District"],
  ["westernregion", "Western & Southern District"],
  ["southern", "Western & Southern District"],
  ["southernregion", "Western & Southern District"],
]);
export function districtForRegion(name) {
  return regionDistricts.get(geographyKey(name)) ?? "Other Regions";
}
function selected(value, label) {
  if (value === undefined || value === "all") return null;
  if (typeof value !== "string" || !value.trim() || value.length > 150)
    throw new ApiError(`Invalid ${label} filter`, 400);
  return value;
}

export async function buildDashboardScope(db, actor, query, now) {
  const allowed = new Set([
    "from",
    "to",
    "repId",
    "district",
    "regionId",
    "territoryId",
  ]);
  if (Object.keys(query).some((key) => !allowed.has(key)))
    throw new ApiError("Unsupported dashboard filter", 400);
  const range = dashboardRange(query, now);
  const repId = selected(query.repId, "representative");
  const district = selected(query.district, "district");
  const regionId = selected(query.regionId, "region");
  const territoryId = selected(query.territoryId, "territory");
  const [members, rawRegions, doctorTerritories, pharmacies] =
    await Promise.all([
      db.user.findMany({
        where: {
          managerId: actor.id,
          role: { in: ["MEDICAL_REP", "SUPERVISOR"] },
        },
        select: {
          id: true,
          name: true,
          role: true,
          isActive: true,
          supervisorId: true,
          subRegionId: true,
          lastLogin: true,
          leaveDaysCountTotal: true,
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      db.region.findMany({
        select: {
          id: true,
          name: true,
          supervisorId: true,
          subRegions: { select: { id: true, name: true } },
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      db.doctor.findMany({
        select: { subRegion: true },
        distinct: ["subRegion"],
      }),
      db.pharmacy.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          region: true,
          subRegion: true,
        },
        orderBy: { id: "asc" },
      }),
    ]);
  const regions = rawRegions.map((region) => ({
    ...region,
    district: districtForRegion(region.name),
  }));
  const reps = members.filter((member) => member.role === "MEDICAL_REP");
  if (repId && !reps.some((rep) => rep.id === repId))
    throw new ApiError("Select a representative from your own team", 403);
  if (district && !regions.some((region) => region.district === district))
    throw new ApiError("Unknown dashboard district", 400);
  if (
    regionId &&
    !regions.some(
      (region) =>
        region.id === regionId && (!district || region.district === district),
    )
  )
    throw new ApiError("Select a region within the selected district", 400);
  if (
    territoryId &&
    !regions.some(
      (region) =>
        (!regionId || region.id === regionId) &&
        (!district || region.district === district) &&
        region.subRegions.some((territory) => territory.id === territoryId),
    )
  )
    throw new ApiError("Select a territory within the selected region", 400);
  const allTerritories = regions.flatMap((region) =>
    region.subRegions.map((territory) => ({
      ...territory,
      regionId: region.id,
      regionName: region.name,
      district: region.district,
    })),
  );
  const memberTerritories = (member) =>
    member.role === "SUPERVISOR"
      ? allTerritories.filter(
          (territory) =>
            regions.find((region) => region.id === territory.regionId)
              ?.supervisorId === member.id,
        )
      : allTerritories.filter(
          (territory) => territory.id === member.subRegionId,
        );
  const geographicFilter = Boolean(district || regionId || territoryId);
  const selectedTerritories = allTerritories.filter(
    (territory) =>
      (!district || territory.district === district) &&
      (!regionId || territory.regionId === regionId) &&
      (!territoryId || territory.id === territoryId),
  );
  const selectedIds = new Set(
    selectedTerritories.map((territory) => territory.id),
  );
  const scopedMembers = members.filter(
    (member) =>
      (!repId || member.id === repId) &&
      (!geographicFilter ||
        memberTerritories(member).some((territory) =>
          selectedIds.has(territory.id),
        )),
  );
  const directoryTerritories = repId
    ? selectedTerritories.filter(
        (territory) =>
          territory.id === reps.find((rep) => rep.id === repId).subRegionId,
      )
    : selectedTerritories;
  const directoryFiltered = Boolean(geographicFilter || repId);
  const directoryKeys = new Set(
    directoryTerritories.map((territory) => geographyKey(territory.name)),
  );
  const doctorNames = doctorTerritories
    .filter((row) => directoryKeys.has(geographyKey(row.subRegion)))
    .map((row) => row.subRegion)
    .filter(Boolean);
  const geographicKeys = new Set(
    selectedTerritories.map((territory) => geographyKey(territory.name)),
  );
  const visitDoctorNames = doctorTerritories
    .filter((row) => geographicKeys.has(geographyKey(row.subRegion)))
    .map((row) => row.subRegion)
    .filter(Boolean);
  const actorIds = repId
    ? [repId]
    : [actor.id, ...members.map((member) => member.id)];
  const directoryPharmacies = directoryFiltered
    ? pharmacies.filter((pharmacy) =>
        directoryKeys.has(geographyKey(pharmacy.subRegion)),
      )
    : pharmacies;
  const salesPharmacies = geographicFilter
    ? pharmacies.filter((pharmacy) =>
        geographicKeys.has(geographyKey(pharmacy.subRegion)),
      )
    : pharmacies;
  const nameCounts = new Map();
  for (const pharmacy of pharmacies)
    nameCounts.set(pharmacy.name, (nameCounts.get(pharmacy.name) ?? 0) + 1);
  const salesCustomers = salesPharmacies
    .filter((pharmacy) => nameCounts.get(pharmacy.name) === 1)
    .map((pharmacy) => pharmacy.name);
  const directoryWhere = directoryFiltered
    ? { subRegion: { in: doctorNames } }
    : {};
  const visitBaseWhere = {
    userId: { in: actorIds },
    ...(geographicFilter
      ? { doctor: { subRegion: { in: visitDoctorNames } } }
      : {}),
  };
  const scopedIds = scopedMembers.map((member) => member.id);
  const workflowIds = repId
    ? scopedIds
    : geographicFilter
      ? scopedIds
      : [actor.id, ...scopedIds];
  return {
    range,
    repId,
    geographicFilter,
    directoryFiltered,
    directoryWhere,
    doctorNames,
    visitDoctorNames,
    visitBaseWhere,
    actorIds,
    members: scopedMembers,
    allMembers: members,
    regions,
    selectedTerritories,
    allTerritories,
    directoryPharmacies,
    salesCustomers,
    allUniqueSalesCustomers: pharmacies
      .filter((pharmacy) => nameCounts.get(pharmacy.name) === 1)
      .map((pharmacy) => pharmacy.name),
    salesPharmacies,
    workflowIds,
    scopedIds,
    memberTerritories,
    salesWhere: {
      orderDate: { gte: range.start, lt: range.end },
      ...(geographicFilter ? { customer: { in: salesCustomers } } : {}),
    },
    options: {
      districts: [...new Set(regions.map((region) => region.district))].sort(),
      regions: regions.map(({ id, name, district, subRegions }) => ({
        id,
        name,
        district,
        territories: subRegions,
      })),
      reps: reps.map((rep) => ({
        id: rep.id,
        name: rep.name,
        territoryId: rep.subRegionId,
      })),
    },
  };
}
