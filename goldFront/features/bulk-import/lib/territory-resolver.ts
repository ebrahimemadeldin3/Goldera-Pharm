import {
  KSA_TERRITORY_STRUCTURE,
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

function matchesName(left: string, right: string) {
  return normalizeKey(left) === normalizeKey(right);
}

function normalizeDistrictName(value?: string | null) {
  const trimmed = clean(value);
  if (!trimmed) return "";

  const key = normalizeKey(trimmed);
  return (
    districtAliases[key] ??
    KSA_TERRITORY_STRUCTURE.find((district) => matchesName(district.name, trimmed))
      ?.name ??
    trimmed
  );
}

function findDistrictMatches(districtName: string) {
  const canonical = normalizeDistrictName(districtName);
  return KSA_TERRITORY_STRUCTURE.filter(
    (district) =>
      district.name === canonical || matchesName(district.name, districtName),
  );
}

function findRegionMatches(regionName: string) {
  const canonical = normalizeRegionName(regionName);

  return KSA_TERRITORY_STRUCTURE.flatMap((district) =>
    district.regions
      .filter(
        (region) =>
          region.name === canonical || matchesName(region.name, regionName),
      )
      .map((region) => ({
        district: district.name,
        region,
      })),
  );
}

function findTerritoryMatches(territoryName: string) {
  const canonical = normalizeTerritoryName(territoryName);

  return KSA_TERRITORY_STRUCTURE.flatMap((district) =>
    district.regions.flatMap((region) =>
      region.territories
        .filter(
          (territory) =>
            territory.name === canonical ||
            matchesName(territory.name, territoryName),
        )
        .map((territory) => ({
          district: district.name,
          region: region.name,
          territory,
        })),
    ),
  );
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
  const rawDistrict = clean(district);
  const rawRegion = clean(region);
  const rawTerritory = clean(territory);

  if (!rawDistrict) {
    issues.push({
      field: "district",
      value: rawDistrict,
      severity: "error",
      message: "District is required.",
    });
  }

  if (!rawRegion) {
    issues.push({
      field: "region",
      value: rawRegion,
      severity: "error",
      message: "Region is required.",
    });
  }

  if (!rawTerritory) {
    issues.push({
      field: "territory",
      value: rawTerritory,
      severity: "error",
      message: "Territory is required.",
    });
  }

  if (issues.length > 0) {
    return { territory: null, issues };
  }

  const districtMatches = findDistrictMatches(rawDistrict);

  if (districtMatches.length === 0) {
    issues.push({
      field: "district",
      value: rawDistrict,
      severity: "error",
      message: `District '${rawDistrict}' was not found.`,
    });
    return { territory: null, issues };
  }

  if (districtMatches.length > 1) {
    issues.push({
      field: "district",
      value: rawDistrict,
      severity: "error",
      message: `District '${rawDistrict}' matches more than one official district.`,
    });
    return { territory: null, issues };
  }

  const districtNode = districtMatches[0];
  const regionMatchesInDistrict = districtNode.regions.filter(
    (item) =>
      item.name === normalizeRegionName(rawRegion) ||
      matchesName(item.name, rawRegion),
  );
  const regionMatchesAnywhere = findRegionMatches(rawRegion);

  if (regionMatchesInDistrict.length === 0) {
    issues.push({
      field: "region",
      value: rawRegion,
      severity: "error",
      message:
        regionMatchesAnywhere.length === 0
          ? `Region '${rawRegion}' was not found.`
          : `Region '${rawRegion}' does not belong to District '${districtNode.name}'.`,
    });
    return { territory: null, issues };
  }

  if (regionMatchesInDistrict.length > 1) {
    issues.push({
      field: "region",
      value: rawRegion,
      severity: "error",
      message: `Region '${rawRegion}' is ambiguous in District '${districtNode.name}'.`,
    });
    return { territory: null, issues };
  }

  const regionNode = regionMatchesInDistrict[0];
  const territoryMatchesInRegion = regionNode.territories.filter(
    (item) =>
      item.name === normalizeTerritoryName(rawTerritory) ||
      matchesName(item.name, rawTerritory),
  );
  const territoryMatchesAnywhere = findTerritoryMatches(rawTerritory);

  if (territoryMatchesInRegion.length === 0) {
    issues.push({
      field: "territory",
      value: rawTerritory,
      severity: "error",
      message:
        territoryMatchesAnywhere.length === 0
          ? `Territory '${rawTerritory}' was not found in Region '${regionNode.name}'.`
          : `Territory '${rawTerritory}' was not found in Region '${regionNode.name}'.`,
    });
    return { territory: null, issues };
  }

  if (territoryMatchesInRegion.length > 1) {
    issues.push({
      field: "territory",
      value: rawTerritory,
      severity: "error",
      message: `Territory '${rawTerritory}' is ambiguous in Region '${regionNode.name}'.`,
    });
    return { territory: null, issues };
  }

  return {
    territory: {
      district: districtNode.name,
      region: regionNode.name,
      territory: territoryMatchesInRegion[0].name,
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
