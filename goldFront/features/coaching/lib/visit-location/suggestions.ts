import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import { normalizeDoctorForDirectory } from "@/features/doctors/lib/utils/mappers";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import { normalizePharmacyForDirectory } from "@/features/pharmacies/lib/utils/directory";
import {
  getTeamMemberAssignment,
  type TeamMemberAssignment,
} from "@/features/team/lib/utils";
import type { User } from "@/features/team/lib/types";
import type { VisitLocationHistoryEntry } from "./history";

export type LocationSuggestionType =
  | "recent"
  | "pharmacy"
  | "facility"
  | "clinic"
  | "hospital"
  | "other";

export type LocationSuggestion = {
  id: string;
  name: string;
  type: LocationSuggestionType;
  city?: string;
  district?: string;
  region?: string;
  territory?: string;
  sourceId?: string;
  searchText: string;
};

type SuggestionContext = {
  selectedDoctorId?: string;
  selectedRep?: User;
};

const MAX_LOCATION_SUGGESTIONS = 8;

function cleanText(value?: string | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeSearch(value?: string | null) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_-]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ");
}

function suggestionKey(suggestion: Pick<LocationSuggestion, "name" | "city" | "territory">) {
  return [
    normalizeSearch(suggestion.name),
    normalizeSearch(suggestion.city),
    normalizeSearch(suggestion.territory),
  ].join("|");
}

function classifyFacility(name: string): LocationSuggestionType {
  const normalized = normalizeSearch(name);

  if (normalized.includes("pharmacy")) return "pharmacy";
  if (normalized.includes("hospital") || normalized.includes("medical city")) {
    return "hospital";
  }
  if (normalized.includes("clinic") || normalized.includes("polyclinic")) {
    return "clinic";
  }
  if (normalized.includes("center") || normalized.includes("centre")) {
    return "facility";
  }

  return "facility";
}

function buildSearchText(suggestion: Omit<LocationSuggestion, "searchText">) {
  return [
    suggestion.name,
    suggestion.city,
    suggestion.district,
    suggestion.region,
    suggestion.territory,
    suggestion.type,
  ]
    .map(normalizeSearch)
    .filter(Boolean)
    .join(" ");
}

function makeSuggestion(
  suggestion: Omit<LocationSuggestion, "searchText">,
): LocationSuggestion {
  return {
    ...suggestion,
    searchText: buildSearchText(suggestion),
  };
}

export function buildLocationSuggestions({
  doctors,
  pharmacies,
  recentLocations,
}: {
  doctors: DoctorApiResponse[];
  pharmacies: PharmacyApiResponse[];
  recentLocations: VisitLocationHistoryEntry[];
}) {
  const suggestions = new Map<string, LocationSuggestion>();

  recentLocations.forEach((entry) => {
    const name = cleanText(entry.value);
    if (!name) return;

    const suggestion = makeSuggestion({
      id: `recent-${normalizeSearch(name)}`,
      name,
      type: "recent",
    });
    suggestions.set(suggestionKey(suggestion), suggestion);
  });

  doctors.forEach((doctor) => {
    const normalized = normalizeDoctorForDirectory(doctor);
    const name = cleanText(normalized.accountName);
    if (!name) return;

    const suggestion = makeSuggestion({
      id: `facility-${doctor.id}`,
      name,
      type: classifyFacility(name),
      district: normalized.territory.district,
      region: normalized.territory.region,
      territory: normalized.territory.territory,
      sourceId: doctor.id,
    });
    const key = suggestionKey(suggestion);
    const existing = suggestions.get(key);
    if (!existing || existing.type === "recent") {
      suggestions.set(key, suggestion);
    }
  });

  pharmacies.forEach((pharmacy) => {
    const normalized = normalizePharmacyForDirectory(pharmacy);
    const name = cleanText(normalized.displayName || normalized.name);
    if (!name) return;

    const suggestion = makeSuggestion({
      id: `pharmacy-${pharmacy.id}`,
      name,
      type: "pharmacy",
      city: normalized.city,
      district: normalized.district,
      region: normalized.region,
      territory: normalized.territoryName,
      sourceId: pharmacy.id,
    });
    const key = suggestionKey(suggestion);
    const existing = suggestions.get(key);
    if (!existing || existing.type === "recent") {
      suggestions.set(key, suggestion);
    }
  });

  return Array.from(suggestions.values());
}

function rankMatch(
  suggestion: LocationSuggestion,
  query: string,
  context: SuggestionContext,
  repAssignment?: TeamMemberAssignment,
) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    let score = suggestion.type === "recent" ? 700 : 300;
    if (context.selectedDoctorId && suggestion.sourceId === context.selectedDoctorId) {
      score += 350;
    }
    if (repAssignment?.territories.includes(suggestion.territory ?? "")) {
      score += 120;
    }
    return score;
  }

  const name = normalizeSearch(suggestion.name);
  const city = normalizeSearch(suggestion.city);
  const territory = normalizeSearch(suggestion.territory);
  const region = normalizeSearch(suggestion.region);
  const district = normalizeSearch(suggestion.district);

  let score = 0;
  if (name === normalizedQuery) score = 1000;
  else if (name.startsWith(normalizedQuery)) score = 850;
  else if (name.includes(normalizedQuery)) score = 700;
  else if (city.includes(normalizedQuery)) score = 520;
  else if (territory.includes(normalizedQuery)) score = 430;
  else if (region.includes(normalizedQuery) || district.includes(normalizedQuery)) score = 320;
  else if (suggestion.searchText.includes(normalizedQuery)) score = 220;
  else return 0;

  if (context.selectedDoctorId && suggestion.sourceId === context.selectedDoctorId) {
    score += 220;
  }
  if (repAssignment?.territories.includes(suggestion.territory ?? "")) {
    score += 90;
  }
  if (suggestion.type === "pharmacy" || suggestion.type === "facility") {
    score += 25;
  }

  return score;
}

export function rankLocationSuggestions(
  suggestions: LocationSuggestion[],
  query: string,
  context: SuggestionContext = {},
) {
  const repAssignment = context.selectedRep
    ? getTeamMemberAssignment(context.selectedRep)
    : undefined;

  return suggestions
    .map((suggestion) => ({
      suggestion,
      score: rankMatch(suggestion, query, context, repAssignment),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.suggestion.name.localeCompare(b.suggestion.name),
    )
    .slice(0, MAX_LOCATION_SUGGESTIONS)
    .map((entry) => entry.suggestion);
}
