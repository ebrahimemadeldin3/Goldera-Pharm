import { User, UserApiDocument, UserApiResponse, RegionData } from "../types";
import {
  KSA_TERRITORY_STRUCTURE,
  UNASSIGNED_TERRITORY,
  getTerritoryLookup,
  normalizeTerritoryName,
} from "@/features/plan/lib/territory";

function documentDisplayValue(document: UserApiDocument) {
  if (typeof document === "string") return document.trim();
  if (!document) return "";

  return (
    document.url?.trim() ||
    document.secure_url?.trim() ||
    document.name?.trim() ||
    document.originalname?.trim() ||
    document.public_id?.trim() ||
    ""
  );
}

export type TeamMemberAssignment = {
  district: string;
  region: string;
  territory: string;
  reportsTo: string;
  hasTerritory: boolean;
  hasReporting: boolean;
  isComplete: boolean;
};

function cleanText(value?: string | null) {
  const trimmed = String(value ?? "").trim();

  if (
    !trimmed ||
    trimmed.toLowerCase() === "undefined" ||
    trimmed.toLowerCase() === "null"
  ) {
    return "";
  }

  return trimmed;
}

function normalizeComparisonKey(value?: string | null) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_-]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ");
}

function getOfficialRegion(value?: string | null) {
  const key = normalizeComparisonKey(value);
  if (!key) return null;

  for (const district of KSA_TERRITORY_STRUCTURE) {
    if (normalizeComparisonKey(district.name) === key) {
      return { district: district.name, region: "" };
    }

    for (const region of district.regions) {
      if (normalizeComparisonKey(region.name) === key) {
        return { district: district.name, region: region.name };
      }
    }
  }

  return null;
}

function isStructuralAreaName(value: string) {
  const key = normalizeComparisonKey(value);
  return [
    "eastern area",
    "western area",
    "southern area",
    "central area",
    "central and eastern district",
    "western and southern district",
    "central region",
    "eastern region",
    "western region",
    "southern region",
  ].includes(key);
}

export function getTeamMemberAssignment(member: User): TeamMemberAssignment {
  const subRegionName = cleanText(member.region?.subRegion?.name);
  const locationName = cleanText(member.location);
  const regionName = cleanText(member.region?.name);
  const territorySource = subRegionName || locationName;
  const lookup = getTerritoryLookup(territorySource);
  const officialRegion = getOfficialRegion(regionName || territorySource);
  const unknownTerritory = normalizeTerritoryName(territorySource);
  const hasUnknownTerritory =
    Boolean(territorySource) &&
    unknownTerritory !== UNASSIGNED_TERRITORY &&
    !isStructuralAreaName(unknownTerritory);
  const district = lookup.isKnown
    ? lookup.district
    : officialRegion?.district || "";
  const region = lookup.isKnown ? lookup.region : officialRegion?.region || "";
  const territory = lookup.isKnown
    ? lookup.territory
    : hasUnknownTerritory
      ? unknownTerritory
      : "";
  const reportsTo =
    cleanText(member.supervisor?.name) ||
    cleanText(member.manager?.name) ||
    cleanText(member.reportsTo);
  const hasTerritory = Boolean(territory);

  return {
    district,
    region,
    territory,
    reportsTo,
    hasTerritory,
    hasReporting: Boolean(reportsTo),
    isComplete: hasTerritory && Boolean(reportsTo),
  };
}

/**
 * Transform user API response to User format
 * Preserves all data from the backend response
 */
export function transformUserApiResponse(member: UserApiResponse): User {
  // Map region data from API response
  const resolvedRegion =
    member.region || member.subRegion?.region || member.regions?.[0];
  const resolvedSubRegion = member.region?.subRegion || member.subRegion;
  const region: RegionData = resolvedRegion
    ? {
        name: resolvedRegion.name,
        id: resolvedRegion.id,
        subRegion: resolvedSubRegion
          ? {
              name: resolvedSubRegion.name,
              id: resolvedSubRegion.id,
            }
          : {
              name: "",
              id: "",
            },
      }
    : {
        name: "",
        id: member.regionId || "",
        subRegion: {
          name: resolvedSubRegion?.name || "",
          id: resolvedSubRegion?.id || member.subRegionId || "",
        },
      };

  return {
    // Core Identity
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone || "",
    role: member.role,
    isActive: member.isActive,
    inHR: member.inHR,

    // Location & Organization
    region,
    department: member.department || undefined,
    location: member.location || undefined,

    // Relationships
    supervisorId: member.supervisorId || member.supervisor?.id || undefined,
    managerId: member.managerId || member.manager?.id || undefined,
    supervisor: member.supervisor
      ? {
          id: member.supervisor.id,
          name: member.supervisor.name,
          email: member.supervisor.email,
          phone: member.supervisor.phone || undefined,
        }
      : undefined,
    manager: member.manager
      ? {
          id: member.manager.id,
          name: member.manager.name,
          email: member.manager.email,
          phone: member.manager.phone || undefined,
        }
      : undefined,
    reportsTo: member.supervisor?.name || member.manager?.name || undefined,

    // Personal Information
    dateOfBirth: member.dateOfBirth || undefined,
    bio: member.bio || undefined,
    education: member.educationBackground || undefined,
    iqama: member.iqamaNumber || undefined,
    passport: member.passportNumber || undefined,
    avatar: member.profileImage?.url || undefined,

    // Employment Details
    joinedDate: member.dateOfRecruitment,
    dateOfRecruitment: member.dateOfRecruitment,
    employeeId: cleanText(member.employeeId) || cleanText(member.employee_id) || undefined,

    // Documents
    resume: documentDisplayValue(member.resume) || undefined,
    certificates: Array.isArray(member.certificates)
      ? member.certificates
          .map(documentDisplayValue)
          .filter(Boolean)
          .join(", ") || undefined
      : undefined,

    // Account & System Info
    lastLogin: member.lastLogin || undefined,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}
