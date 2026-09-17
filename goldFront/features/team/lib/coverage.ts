import type { UserRole } from "@/lib/types";
import {
  normalizeRegionName,
  normalizeTerritoryName,
} from "@/features/plan/lib/territory";

export type MedicalRepCoverage = {
  region: string;
  territories: string[];
  source: "api" | "frontend-config";
};

type CoverageSubject = {
  id?: string | null;
  name?: string | null;
  role?: UserRole | string | null;
};

type ExistingCoverage = {
  region?: string | null;
  territories?: Array<string | null | undefined>;
};

const MEDICAL_REP_COVERAGE_BY_NAME: Record<
  string,
  Omit<MedicalRepCoverage, "source">
> = {
  [normalizeCoverageName("Nagham Tamer Mohamed Elhosiny")]: {
    region: "Eastern Region",
    territories: ["Eastern 2"],
  },
  [normalizeCoverageName("Hend Mohamed Ahmed Elsayed Elshaikh")]: {
    region: "Western Region",
    territories: ["Makkah / Taif"],
  },
  [normalizeCoverageName("Ahmed Ali Abdullah Ali")]: {
    region: "Western Region",
    territories: ["Jeddah 1", "Jeddah 2"],
  },
  [normalizeCoverageName("Moustafa Ahmed Elrefaei Awadalla Hassan")]: {
    region: "Eastern Region",
    territories: ["Eastern 1"],
  },
};

function cleanCoverageText(value?: string | null) {
  const trimmed = String(value ?? "").trim().replace(/\s+/g, " ");

  return trimmed &&
    trimmed.toLowerCase() !== "undefined" &&
    trimmed.toLowerCase() !== "null"
    ? trimmed
    : "";
}

export function normalizeCoverageName(value?: string | null) {
  return cleanCoverageText(value).toLocaleLowerCase();
}

function uniqueTerritories(values: Array<string | null | undefined>) {
  const labelsByKey = new Map<string, string>();

  values.forEach((value) => {
    const label = normalizeTerritoryName(cleanCoverageText(value));
    if (!label) return;
    labelsByKey.set(label.toLocaleLowerCase(), label);
  });

  return Array.from(labelsByKey.values());
}

/**
 * Frontend-only display fallback for named medical representatives whose
 * persisted territory assignments are not exposed by the current API.
 */
export function getMedicalRepCoverage(
  subject: CoverageSubject,
  existing?: ExistingCoverage,
): MedicalRepCoverage | null {
  if (subject.role !== "MEDICAL_REP") return null;

  const existingTerritories = uniqueTerritories(existing?.territories ?? []);
  const existingRegion = normalizeRegionName(
    cleanCoverageText(existing?.region),
  );

  if (existingRegion && existingTerritories.length > 0) {
    return {
      region: existingRegion,
      territories: existingTerritories,
      source: "api",
    };
  }

  const fallback = MEDICAL_REP_COVERAGE_BY_NAME[
    normalizeCoverageName(subject.name)
  ];

  if (!fallback) return null;

  return {
    ...fallback,
    source: "frontend-config",
  };
}
