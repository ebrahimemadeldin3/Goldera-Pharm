import {
  KSA_TERRITORY_STRUCTURE,
  getTerritoryLookup,
  normalizeRegionName,
  normalizeTerritoryName,
} from "@/features/plan/lib/territory";
import type { BulkImportIssue, TerritoryResolution } from "./types";

type TerritoryResolveResult = {
  territory: TerritoryResolution | null;
  issues: BulkImportIssue[];
};

const districtAliases: Record<string, string> = {
  "central and eastern": "Central & Eastern District",
  "central and eastern district": "Central & Eastern District",
  "central eastern": "Central & Eastern District",
  "central eastern district": "Central & Eastern District",
  "western and southern": "Western & Southern District",
  "western and southern district": "Western & Southern District",
  "western southern": "Western & Southern District",
  "western southern district": "Western & Southern District",
};

function normalizeKey(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_-]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ");
}

function clean(value?: string | null) {
  return String(value ?? "").trim();
}

function normalizeDistrictName(value?: string | null) {
  const trimmed = clean(value);
  if (!trimmed) return "";

  const key = normalizeKey(trimmed);
  return (
    districtAliases[key] ??
    KSA_TERRITORY_STRUCTURE.find(
      (district) => normalizeKey(district.name) === key,
    )?.name ??
    trimmed
  );
}

function getRegionDistrict(regionName: string) {
  return KSA_TERRITORY_STRUCTURE.find((district) =>
    district.regions.some((region) => region.name === regionName),
  )?.name;
}

function findRegion(regionName: string) {
  return KSA_TERRITORY_STRUCTURE.flatMap((district) =>
    district.regions.map((region) => ({
      district: district.name,
      region: region.name,
    })),
  ).find((item) => item.region === regionName);
}

export function resolveBulkImportTerritory({
  district,
  region,
  territory,
}: {
  district?: string | null;
  region?: string | null;
  territory?: string | null;
}): TerritoryResolveResult {
  const issues: BulkImportIssue[] = [];
  const rawTerritory = clean(territory);
  const rawRegion = clean(region);
  const rawDistrict = clean(district);

  if (!rawTerritory) {
    issues.push({
      field: "territory",
      severity: "error",
      message: "Territory is required.",
    });
    return { territory: null, issues };
  }

  const territoryLookup = getTerritoryLookup(normalizeTerritoryName(rawTerritory));

  if (!territoryLookup.isKnown) {
    issues.push({
      field: "territory",
      severity: "error",
      message: `Unknown territory "${rawTerritory}". Use an official territory from the template.`,
    });
    return { territory: null, issues };
  }

  const normalizedRegion = rawRegion ? normalizeRegionName(rawRegion) : "";
  const normalizedDistrict = rawDistrict ? normalizeDistrictName(rawDistrict) : "";

  if (normalizedRegion) {
    const regionRecord = findRegion(normalizedRegion);

    if (!regionRecord) {
      issues.push({
        field: "region",
        severity: "error",
        message: `Unknown region "${rawRegion}".`,
      });
    } else if (regionRecord.region !== territoryLookup.region) {
      issues.push({
        field: "region",
        severity: "error",
        message: `Region "${normalizedRegion}" does not match territory "${territoryLookup.territory}".`,
      });
    }
  }

  if (normalizedDistrict) {
    const districtExists = KSA_TERRITORY_STRUCTURE.some(
      (item) => item.name === normalizedDistrict,
    );
    const regionDistrict = getRegionDistrict(territoryLookup.region);

    if (!districtExists) {
      issues.push({
        field: "district",
        severity: "error",
        message: `Unknown district "${rawDistrict}".`,
      });
    } else if (regionDistrict && normalizedDistrict !== regionDistrict) {
      issues.push({
        field: "district",
        severity: "error",
        message: `District "${normalizedDistrict}" does not match territory "${territoryLookup.territory}".`,
      });
    }
  }

  return {
    territory:
      issues.filter((issue) => issue.severity === "error").length > 0
        ? null
        : {
            district: territoryLookup.district,
            region: territoryLookup.region,
            territory: territoryLookup.territory,
          },
    issues,
  };
}

export function getBulkImportTerritoryTemplateRows() {
  return KSA_TERRITORY_STRUCTURE.flatMap((district) =>
    district.regions.flatMap((region) =>
      region.territories.map((territory) => ({
        district: district.name,
        region: region.name,
        territory: territory.name,
      })),
    ),
  );
}
