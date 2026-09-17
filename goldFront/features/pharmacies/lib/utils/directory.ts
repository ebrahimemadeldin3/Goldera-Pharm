import {
  UNASSIGNED_DISTRICT,
  UNASSIGNED_REGION,
  getTerritoryLookup,
  normalizeRegionName,
  type TerritoryLookup,
} from "@/features/plan/lib/territory";
import type { PharmacyApiResponse } from "../types";

export type PharmacyDirectoryData = {
  id: string;
  name: string;
  displayName: string;
  code: string;
  city: string;
  country: string;
  sourceRegion: string;
  sourceTerritory: string;
  createdAt: string;
  updatedAt: string;
  territory: TerritoryLookup;
  district: string;
  region: string;
  territoryName: string;
};

export function normalizePharmacyFilterValue(value?: string | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

function normalizePharmacyText(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

  return normalized &&
    normalized.toLowerCase() !== "undefined" &&
    normalized.toLowerCase() !== "null"
    ? normalized
    : "";
}

function parsePharmacyName(value?: string | null) {
  const name = normalizePharmacyText(value) || "Unnamed Pharmacy";
  const match = name.match(/^([A-Za-z]\d{3,}|[A-Za-z0-9]{4,})\s*[-:]\s*(.+)$/);

  return match
    ? {
        code: match[1],
        displayName: normalizePharmacyText(match[2]) || name,
      }
    : {
        code: "No code",
        displayName: name,
      };
}

export function normalizePharmacyForDirectory(
  pharmacy: PharmacyApiResponse,
): PharmacyDirectoryData {
  const sourceTerritory = normalizePharmacyText(pharmacy.subRegion);
  const sourceRegion = normalizePharmacyText(pharmacy.region);
  const territory = getTerritoryLookup(sourceTerritory);
  const parsedName = parsePharmacyName(pharmacy.name);

  return {
    id: pharmacy.id,
    name: normalizePharmacyText(pharmacy.name),
    displayName: parsedName.displayName,
    code: parsedName.code,
    city: normalizePharmacyText(pharmacy.city),
    country: normalizePharmacyText(pharmacy.country),
    sourceRegion,
    sourceTerritory,
    createdAt: pharmacy.createdAt,
    updatedAt: pharmacy.updatedAt,
    territory,
    district: territory.isKnown ? territory.district : UNASSIGNED_DISTRICT,
    region: territory.isKnown
      ? territory.region
      : normalizeRegionName(sourceRegion || territory.region) ||
        UNASSIGNED_REGION,
    territoryName: territory.territory,
  };
}
