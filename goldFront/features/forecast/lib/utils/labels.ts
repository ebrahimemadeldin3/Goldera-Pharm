import type { ForecastTargetType } from "../types";

export interface ForecastTargetLabels {
  targetType: ForecastTargetType;
  singular: string;
  plural: string;
  singularLower: string;
  pluralLower: string;
  coveredLabel: string;
  allocationsLabel: string;
  forecastLabel: string;
  formatCount: (count: number) => string;
  formatShowMore: (count: number) => string;
}

export function getForecastTargetLabels(
  targetType?: ForecastTargetType | string | null,
): ForecastTargetLabels {
  const normalized: ForecastTargetType =
    String(targetType || "").toUpperCase() === "PHARMACY"
      ? "PHARMACY"
      : "DOCTOR";

  if (normalized === "PHARMACY") {
    return {
      targetType: "PHARMACY",
      singular: "Pharmacy",
      plural: "Pharmacies",
      singularLower: "pharmacy",
      pluralLower: "pharmacies",
      coveredLabel: "Pharmacies Covered",
      allocationsLabel: "Pharmacy Allocations",
      forecastLabel: "Pharmacy Forecast",
      formatCount: (count: number) =>
        `${count} ${count === 1 ? "pharmacy" : "pharmacies"}`,
      formatShowMore: (count: number) =>
        `Show ${count} more ${count === 1 ? "pharmacy" : "pharmacies"}`,
    };
  }

  return {
    targetType: "DOCTOR",
    singular: "Doctor",
    plural: "Doctors",
    singularLower: "doctor",
    pluralLower: "doctors",
    coveredLabel: "Doctors Covered",
    allocationsLabel: "Doctor Allocations",
    forecastLabel: "Doctor Forecast",
    formatCount: (count: number) =>
      `${count} ${count === 1 ? "doctor" : "doctors"}`,
    formatShowMore: (count: number) =>
      `Show ${count} more ${count === 1 ? "doctor" : "doctors"}`,
  };
}

export function formatForecastFrequency(periodType?: string | null): string {
  const raw = String(periodType || "").trim().toUpperCase();
  if (raw === "QUARTERLY") return "Quarterly";
  if (raw === "MONTHLY") return "Monthly";
  if (!raw) return "Monthly";
  return raw.charAt(0) + raw.slice(1).toLowerCase();
}

export function formatForecastStatusLabel(
  status?: string | null,
  isApproved?: boolean,
): { key: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"; label: string } {
  const raw = String(status || "").trim().toUpperCase();
  if (raw === "DRAFT") return { key: "DRAFT", label: "Draft" };
  if (raw === "REJECTED") return { key: "REJECTED", label: "Rejected" };
  if (raw === "APPROVED" || isApproved) {
    return { key: "APPROVED", label: "Approved" };
  }
  return { key: "PENDING", label: "Pending Review" };
}

export interface ProductAllocationGroup {
  productKey: string;
  productId?: string;
  productName: string;
  totalUnits: number;
  accounts: Array<{
    accountId?: string;
    accountName: string;
    units: number;
    secondaryInfo?: string;
  }>;
}

export function groupForecastAllocationsByProduct(
  rows: Array<{
    productId?: string;
    productName?: string;
    productUnits?: number;
    doctorId?: string;
    doctorName?: string;
    pharmacyId?: string;
    pharmacyName?: string;
    targetId?: string;
    targetName?: string;
    city?: string;
    subRegion?: string;
  }> = [],
): {
  groups: ProductAllocationGroup[];
  uniqueProductCount: number;
  uniqueAccountCount: number;
  totalUnits: number;
} {
  const productMap = new Map<string, ProductAllocationGroup>();
  const uniqueAccounts = new Set<string>();
  let totalUnits = 0;

  for (const row of rows) {
    const units = Math.max(0, Number(row.productUnits ?? 0));
    const productName = (row.productName || "Unknown Product").trim();
    const productKey = (row.productId || productName).trim();
    const accountId = row.pharmacyId || row.doctorId || row.targetId;
    const accountName = (
      row.pharmacyName ||
      row.targetName ||
      row.doctorName ||
      "Unassigned Account"
    ).trim();
    const accountKey = (accountId || accountName).trim();

    if (
      accountKey &&
      !/^unassigned (doctor|pharmacy|account)$/i.test(accountName)
    ) {
      uniqueAccounts.add(accountKey);
    }

    totalUnits += units;

    const group = productMap.get(productKey) || {
      productKey,
      productId: row.productId,
      productName,
      totalUnits: 0,
      accounts: [],
    };
    group.totalUnits += units;

    const secondaryInfo = [row.city, row.subRegion].filter(Boolean).join(" • ") || undefined;
    const existingAccount = group.accounts.find(
      (a) => (a.accountId && accountId ? a.accountId === accountId : a.accountName === accountName),
    );
    if (existingAccount) {
      existingAccount.units += units;
    } else {
      group.accounts.push({
        accountId,
        accountName,
        units,
        secondaryInfo,
      });
    }

    productMap.set(productKey, group);
  }

  const groups = Array.from(productMap.values())
    .map((g) => ({
      ...g,
      accounts: [...g.accounts].sort(
        (a, b) => b.units - a.units || a.accountName.localeCompare(b.accountName),
      ),
    }))
    .sort((a, b) => b.totalUnits - a.totalUnits || a.productName.localeCompare(b.productName));

  return {
    groups,
    uniqueProductCount: groups.length,
    uniqueAccountCount: uniqueAccounts.size,
    totalUnits,
  };
}
