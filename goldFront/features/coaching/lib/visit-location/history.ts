export type VisitLocationHistoryEntry = {
  value: string;
  normalizedValue: string;
  count: number;
  lastUsedAt: number;
};

export const VISIT_LOCATION_HISTORY_LIMIT = 8;
export const VISIT_LOCATION_SUGGESTION_LIMIT = 4;

const MIN_LOCATION_LENGTH = 3;
const GENERIC_LOCATION_VALUES = new Set([
  "hospital",
  "clinic",
  "pharmacy",
  "riyadh",
  "jeddah",
]);

export function normalizeLocation(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getVisitLocationStorageKey(userId: string): string {
  return `gp_recent_locations_${userId}`;
}

export function isUsableLocation(value: string): boolean {
  return normalizeLocation(value).length >= MIN_LOCATION_LENGTH;
}

export function isGenericLocation(value: string): boolean {
  return GENERIC_LOCATION_VALUES.has(normalizeLocation(value));
}

export function needsLocationSpecificityHint(value: string): boolean {
  const normalized = normalizeLocation(value);
  if (!normalized) return false;
  return normalized.length < MIN_LOCATION_LENGTH || isGenericLocation(value);
}

function sanitizeEntry(value: unknown): VisitLocationHistoryEntry | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<VisitLocationHistoryEntry>;
  if (typeof record.value !== "string") return null;

  const normalizedValue =
    typeof record.normalizedValue === "string"
      ? record.normalizedValue
      : normalizeLocation(record.value);

  if (!normalizedValue) return null;

  const count = Number(record.count);
  const lastUsedAt = Number(record.lastUsedAt);

  return {
    value: record.value.trim(),
    normalizedValue,
    count: Number.isFinite(count) && count > 0 ? count : 1,
    lastUsedAt: Number.isFinite(lastUsedAt) ? lastUsedAt : 0,
  };
}

export function parseLocationHistory(
  raw: string | null,
): VisitLocationHistoryEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(sanitizeEntry)
      .filter((entry): entry is VisitLocationHistoryEntry => Boolean(entry));
  } catch {
    return [];
  }
}

export function rankLocations(
  entries: VisitLocationHistoryEntry[],
  now = Date.now(),
): VisitLocationHistoryEntry[] {
  const newestFirst = [...entries].sort((a, b) => {
    const aAgeHours = Math.max(0, (now - a.lastUsedAt) / 3_600_000);
    const bAgeHours = Math.max(0, (now - b.lastUsedAt) / 3_600_000);
    const aRecency = 1 / (1 + aAgeHours / 24);
    const bRecency = 1 / (1 + bAgeHours / 24);
    const aFrequency = Math.log1p(a.count) * 0.18;
    const bFrequency = Math.log1p(b.count) * 0.18;
    const scoreDifference = bRecency + bFrequency - (aRecency + aFrequency);

    if (Math.abs(scoreDifference) > 0.0001) return scoreDifference;
    return b.lastUsedAt - a.lastUsedAt;
  });

  return newestFirst;
}

export function recordLocation(
  entries: VisitLocationHistoryEntry[],
  value: string,
  now = Date.now(),
): VisitLocationHistoryEntry[] {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const normalizedValue = normalizeLocation(trimmed);

  if (!isUsableLocation(trimmed)) return rankLocations(entries, now);

  const existingIndex = entries.findIndex(
    (entry) => entry.normalizedValue === normalizedValue,
  );

  const nextEntries = [...entries];

  if (existingIndex >= 0) {
    const existing = nextEntries[existingIndex];
    nextEntries[existingIndex] = {
      ...existing,
      value: trimmed,
      count: existing.count + 1,
      lastUsedAt: now,
    };
  } else {
    nextEntries.push({
      value: trimmed,
      normalizedValue,
      count: 1,
      lastUsedAt: now,
    });
  }

  return rankLocations(nextEntries, now).slice(0, VISIT_LOCATION_HISTORY_LIMIT);
}

export function removeLocation(
  entries: VisitLocationHistoryEntry[],
  value: string,
): VisitLocationHistoryEntry[] {
  const normalizedValue = normalizeLocation(value);
  if (!normalizedValue) return rankLocations(entries);

  return rankLocations(
    entries.filter((entry) => entry.normalizedValue !== normalizedValue),
  );
}

export function getLocationSuggestions(
  entries: VisitLocationHistoryEntry[],
  currentValue = "",
  limit = VISIT_LOCATION_SUGGESTION_LIMIT,
): VisitLocationHistoryEntry[] {
  const normalizedCurrentValue = normalizeLocation(currentValue);

  return rankLocations(entries)
    .filter((entry) => entry.normalizedValue !== normalizedCurrentValue)
    .slice(0, limit);
}
