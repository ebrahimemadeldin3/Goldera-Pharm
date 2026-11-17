import type { Doctor, Forecast, ForecastTargetType, Product } from "../types";

export interface DuplicateForecastDraftResult {
  targetType: ForecastTargetType;
  periodType: "MONTHLY" | "QUARTERLY";
  selectedProductIds: string[];
  allocations: Record<string, Record<string, number>>;
  notes: string;
  skippedProducts: string[];
  skippedAccounts: string[];
}

/**
 * Copies type, frequency, active products, eligible accounts, and quantities
 * from an existing Forecast into a clean new draft payload.
 * Explicitly excludes id, status, feedback, approval history, and timestamps.
 */
export function buildDuplicateForecastDraft(
  source: Pick<
    Forecast,
    "targetType" | "periodType" | "notes" | "productForecasts"
  >,
  availableProducts: Product[],
  availableTargets: Doctor[],
): DuplicateForecastDraftResult {
  const targetType: ForecastTargetType =
    source.targetType === "PHARMACY" ? "PHARMACY" : "DOCTOR";
  const periodType =
    source.periodType === "QUARTERLY" ? "QUARTERLY" : "MONTHLY";

  const productById = new Map(availableProducts.map((p) => [p.id, p]));
  const productByName = new Map(
    availableProducts.map((p) => [p.name.trim().toLowerCase(), p]),
  );

  const targetById = new Map(availableTargets.map((t) => [t.id, t]));
  const targetByName = new Map(
    availableTargets.map((t) => [t.name.trim().toLowerCase(), t]),
  );

  const selectedProductIdSet = new Set<string>();
  const allocations: Record<string, Record<string, number>> = {};
  const skippedProductSet = new Set<string>();
  const skippedAccountSet = new Set<string>();

  for (const row of source.productForecasts || []) {
    const units = Number(row.productUnits ?? 0);
    if (!Number.isFinite(units) || units <= 0) continue;

    const matchedProduct =
      (row.productId ? productById.get(row.productId) : undefined) ||
      (row.productName
        ? productByName.get(row.productName.trim().toLowerCase())
        : undefined);

    if (!matchedProduct) {
      if (row.productName) skippedProductSet.add(row.productName);
      continue;
    }

    const accountId = row.pharmacyId || row.doctorId || row.targetId;
    const accountName = (
      row.pharmacyName ||
      row.targetName ||
      row.doctorName ||
      ""
    ).trim();

    const matchedTarget =
      (accountId ? targetById.get(accountId) : undefined) ||
      (accountName ? targetByName.get(accountName.toLowerCase()) : undefined);

    if (!matchedTarget) {
      if (accountName) skippedAccountSet.add(accountName);
      continue;
    }

    selectedProductIdSet.add(matchedProduct.id);
    if (!allocations[matchedTarget.id]) {
      allocations[matchedTarget.id] = {};
    }
    allocations[matchedTarget.id][matchedProduct.id] =
      (allocations[matchedTarget.id][matchedProduct.id] || 0) + units;
  }

  return {
    targetType,
    periodType,
    selectedProductIds: Array.from(selectedProductIdSet),
    allocations,
    notes: source.notes || "",
    skippedProducts: Array.from(skippedProductSet),
    skippedAccounts: Array.from(skippedAccountSet),
  };
}
