import {
  formatSaudiDateDisplay,
  formatSaudiDateTimeDisplay,
  getSaudiDateParts,
  parseDateValue,
} from "@/lib/utils";
import type { HRDocumentValue, HRMember } from "../types";

export function formatHRDate(
  value: string | null | undefined,
  includeTime = false,
) {
  if (!value) return "";

  try {
    const date = parseDateValue(value);
    if (Number.isNaN(date.getTime())) return "";

    const formatted = includeTime
      ? formatSaudiDateTimeDisplay(date)
      : formatSaudiDateDisplay(date);

    return includeTime
      ? formatted.replace(/, (?=\d{1,2}:)/, " • ")
      : formatted;
  } catch {
    return "";
  }
}

export function formatServiceDuration(value: string | null | undefined) {
  if (!value) return "";

  try {
    const joinedDate = parseDateValue(value);
    if (Number.isNaN(joinedDate.getTime())) return "";

    const start = getSaudiDateParts(joinedDate);
    const today = getSaudiDateParts(new Date());
    const startYear = Number(start.year);
    const startMonth = Number(start.month);
    const startDay = Number(start.day);
    const currentYear = Number(today.year);
    const currentMonth = Number(today.month);
    const currentDay = Number(today.day);

    let totalMonths =
      (currentYear - startYear) * 12 + (currentMonth - startMonth);
    if (currentDay < startDay) totalMonths -= 1;
    if (totalMonths < 0) return "";
    if (totalMonths === 0) return "Less than a month";

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const yearLabel = `${years} ${years === 1 ? "year" : "years"}`;
    const monthLabel = `${months} ${months === 1 ? "month" : "months"}`;

    if (years === 0) return monthLabel;
    if (months === 0) return yearLabel;
    return `${yearLabel} ${monthLabel}`;
  } catch {
    return "";
  }
}

export function getDocumentUrl(value: HRDocumentValue) {
  const candidate =
    typeof value === "string"
      ? value
      : value?.secure_url || value?.url || undefined;

  if (!candidate) return "";
  if (candidate.startsWith("/")) return candidate;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:"
      ? candidate
      : "";
  } catch {
    return "";
  }
}

export function getApprovedLeaveDays(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : 0;
}

export function getReportsTo(member: HRMember) {
  if (member.role === "MEDICAL_REP") {
    return (
      member.supervisor?.name?.trim() || member.manager?.name?.trim() || ""
    );
  }

  return member.manager?.name?.trim() || "";
}

export function getTerritory(member: HRMember) {
  const regionName =
    member.subRegion?.region?.name?.trim() ||
    member.regions?.[0]?.name?.trim() ||
    "";
  const subRegionName = member.subRegion?.name?.trim() || "";

  if (regionName && subRegionName) return `${regionName} • ${subRegionName}`;
  return subRegionName || regionName || member.location?.trim() || "";
}
