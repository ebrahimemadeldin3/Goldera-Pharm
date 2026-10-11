/**
 * Authoritative Plan Coverage calculation utility.
 *
 * Rules:
 * - If selectedDoctorsCount <= 0: returns 0 (zero selected doctors is NEVER 100%).
 * - If target visits/doctors <= 0: returns 0 (safe zero-denominator handling).
 * - Partial coverage: returns rounded percentage.
 * - Exact 100%: returns 100.
 * - Values exceeding 100%: capped at 100.
 */
export function calculatePlanCoverage(
  selectedDoctorsCount: number,
  target: number | null | undefined,
): number {
  if (!selectedDoctorsCount || selectedDoctorsCount <= 0) {
    return 0;
  }
  const safeTarget = Number(target) || 0;
  if (safeTarget <= 0) {
    return 0;
  }
  const percentage = (selectedDoctorsCount / safeTarget) * 100;
  return Math.min(100, Math.round(percentage));
}

export function formatPlanCoverage(coverage: number | null | undefined): string {
  if (coverage === null || coverage === undefined) return "0%";
  return `${coverage}%`;
}
