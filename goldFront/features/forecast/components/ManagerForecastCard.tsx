"use client";

import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronUp,
  CircleX,
  Clock,
  FileText,
  MapPin,
  Package,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatSAR, formatSaudiDateTimeDisplay, formatSaudiMonthYear } from "@/lib/utils";
import type { ForecastManagement } from "../lib/types/management";
import {
  formatForecastFrequency,
  getForecastTargetLabels,
} from "../lib/utils/labels";

const numberFormatter = new Intl.NumberFormat("en-US");

export type ForecastReviewStatus = "draft" | "pending" | "approved" | "rejected";

export function getManagerForecastStatus(
  forecast: Pick<ForecastManagement, "status" | "isApproved">,
): ForecastReviewStatus {
  const raw = String(forecast.status || "").toUpperCase();
  if (raw === "DRAFT") return "draft";
  if (raw === "REJECTED") return "rejected";
  if (raw === "APPROVED" || forecast.isApproved) return "approved";
  return "pending";
}

function getInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "MR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function formatWaitingDuration(createdAt: string, nowMs = Date.now()): string | null {
  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return null;
  const diffHours = Math.max(0, Math.floor((nowMs - createdMs) / (1000 * 60 * 60)));
  if (diffHours < 1) return "Pending review for less than 1 hour";
  if (diffHours < 24) {
    return `Pending review for ${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Pending review for ${diffDays} ${diffDays === 1 ? "day" : "days"}`;
}

function buildFallbackSummary(forecast: ForecastManagement) {
  const rows = forecast.productForecasts || [];
  const productMap = new Map<string, { productId: string | null; productName: string; units: number }>();
  const accountSet = new Set<string>();
  let totalUnits = 0;

  for (const row of rows) {
    const units = Math.max(0, Number(row.productUnits || 0));
    totalUnits += units;
    const pName = row.productName || "Unknown Product";
    const existing = productMap.get(pName) || {
      productId: null,
      productName: pName,
      units: 0,
    };
    existing.units += units;
    productMap.set(pName, existing);

    if (row.doctorName && !/^unassigned/i.test(row.doctorName)) {
      accountSet.add(row.doctorName);
    }
  }

  const sorted = Array.from(productMap.values()).sort(
    (a, b) => b.units - a.units || a.productName.localeCompare(b.productName),
  );
  const warnings = [];
  if (sorted.length === 0) {
    warnings.push({
      code: "NO_PRODUCTS",
      message: "No product allocations are included in this forecast.",
      count: 0,
    });
  }
  if (accountSet.size === 0) {
    warnings.push({
      code: "NO_TARGET_ACCOUNTS",
      message:
        forecast.targetType === "PHARMACY"
          ? "No pharmacy accounts are assigned to this forecast."
          : "No doctors are assigned to this forecast.",
      count: 0,
    });
  }

  return {
    repTerritory: null,
    repRegion: null,
    managerName: null,
    productCount: sorted.length,
    accountCount: accountSet.size,
    totalUnits,
    estimatedValueSAR: null,
    topProducts: sorted.slice(0, 3),
    extraProductsCount: Math.max(0, sorted.length - 3),
    comparison: null,
    warnings,
  };
}

function StatusBadge({ status }: { status: ForecastReviewStatus }) {
  const config: Record<
    ForecastReviewStatus,
    { label: string; className: string; Icon: typeof Clock }
  > = {
    draft: {
      label: "Draft",
      className: "border-[#D0D5DD] bg-[#F2F4F7] text-[#344054]",
      Icon: FileText,
    },
    pending: {
      label: "Pending Review",
      className: "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]",
      Icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]",
      Icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      className: "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]",
      Icon: CircleX,
    },
  };

  const { label, className, Icon } = config[status];
  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function ManagerForecastCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-[#EEF1F6]" />
          <div className="space-y-2">
            <div className="h-4 w-44 rounded bg-[#EEF1F6]" />
            <div className="h-3 w-32 rounded bg-[#F4F6FA]" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-28 rounded-full bg-[#EEF1F6]" />
          <div className="h-6 w-28 rounded-full bg-[#EEF1F6]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="h-14 rounded-[10px] bg-[#F4F6FA]" />
        <div className="h-14 rounded-[10px] bg-[#F4F6FA]" />
        <div className="h-14 rounded-[10px] bg-[#F4F6FA]" />
        <div className="h-14 rounded-[10px] bg-[#F4F6FA]" />
      </div>
      <div className="h-16 rounded-[10px] bg-[#F9FAFB]" />
      <div className="flex justify-end">
        <div className="h-10 w-36 rounded-[10px] bg-[#EEF1F6]" />
      </div>
    </div>
  );
}

interface ManagerForecastCardProps {
  forecast: ForecastManagement;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenDialog: (
    forecastId: string,
    action: "approve" | "reject",
    repName: string,
  ) => void;
}

export function ManagerForecastCard({
  forecast,
  isExpanded,
  onToggleExpanded,
  onOpenDialog,
}: ManagerForecastCardProps) {
  const status = getManagerForecastStatus(forecast);
  const targetLabels = getForecastTargetLabels(forecast.targetType);
  const isPharmacy = targetLabels.targetType === "PHARMACY";
  const summary = forecast.summary ?? buildFallbackSummary(forecast);

  const periodLabel =
    formatSaudiMonthYear(new Date(forecast.periodDate)) || forecast.periodType;
  const submittedLabel = formatSaudiDateTimeDisplay(new Date(forecast.createdAt));
  const updatedDifferent =
    forecast.updatedAt &&
    forecast.createdAt &&
    Math.abs(
      new Date(forecast.updatedAt).getTime() -
        new Date(forecast.createdAt).getTime(),
    ) >
      60 * 1000;
  const updatedLabel = updatedDifferent
    ? formatSaudiDateTimeDisplay(new Date(forecast.updatedAt))
    : null;
  const waitingLabel =
    status === "pending" ? formatWaitingDuration(forecast.createdAt) : null;

  const targetAccountLabel = targetLabels.plural;
  const TargetIcon = isPharmacy ? Building2 : Stethoscope;

  const comparison = summary.comparison;
  const comparisonText = (() => {
    if (!comparison) return null;
    const parts: string[] = [];
    if (typeof comparison.quantityChangePct === "number") {
      if (comparison.quantityChangePct === 0) {
        parts.push("Same unit total as previous period");
      } else {
        const dir = comparison.quantityChangePct > 0 ? "higher" : "lower";
        parts.push(
          `${Math.abs(comparison.quantityChangePct)}% ${dir} than previous period`,
        );
      }
    }
    if (comparison.accountCountDiff !== 0) {
      const noun = isPharmacy
        ? Math.abs(comparison.accountCountDiff) === 1
          ? "pharmacy"
          : "pharmacies"
        : Math.abs(comparison.accountCountDiff) === 1
          ? "doctor"
          : "doctors";
      parts.push(
        comparison.accountCountDiff > 0
          ? `${comparison.accountCountDiff} additional ${noun}`
          : `${Math.abs(comparison.accountCountDiff)} fewer ${noun}`,
      );
    }
    return parts.length > 0 ? parts.join(" • ") : null;
  })();

  return (
    <article className="forecast-request-card rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-[#D0D5DD]">
      {/* 1. Header: Rep identity + Forecast type + Status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#E5E8EF] bg-[#F4F6FA] text-sm font-bold text-[#101D36]"
          >
            {getInitials(forecast.repName)}
          </span>
          <div className="min-w-0 space-y-1">
            <h3
              className="whitespace-normal break-words text-base font-bold leading-snug text-[#101D36]"
              dir="auto"
            >
              {forecast.repName}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#667085]">
              {summary.repTerritory && (
                <span className="inline-flex items-center gap-1 whitespace-normal break-words">
                  <MapPin className="size-3.5 shrink-0 text-[#98A2B3]" aria-hidden="true" />
                  <span dir="auto">
                    {summary.repTerritory}
                    {summary.repRegion ? ` (${summary.repRegion})` : ""}
                  </span>
                </span>
              )}
              {summary.managerName && (
                <span className="inline-flex items-center gap-1 whitespace-normal break-words">
                  <Users className="size-3.5 shrink-0 text-[#98A2B3]" aria-hidden="true" />
                  <span dir="auto">Manager: {summary.managerName}</span>
                </span>
              )}
              {!summary.repTerritory && forecast.repEmail && (
                <span className="break-all text-[#8A94A6]">{forecast.repEmail}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE3EE] bg-[#F4F6FA] px-2.5 py-1 text-xs font-bold text-[#344054]">
            <TargetIcon className="size-3.5 shrink-0 text-[#101D36]" aria-hidden="true" />
            {targetLabels.forecastLabel}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* 2. Period and submission metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#EEF1F6] pt-3 text-xs text-[#475467]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#182033]">
          <CalendarDays className="size-3.5 text-[#B18732]" aria-hidden="true" />
          {periodLabel} ({formatForecastFrequency(forecast.periodType)})
        </span>
        <span>Submitted {submittedLabel}</span>
        {updatedLabel && <span>Updated {updatedLabel}</span>}
        {waitingLabel && (
          <span className="inline-flex items-center gap-1 font-semibold text-[#B54708]">
            <Clock className="size-3.5" aria-hidden="true" />
            {waitingLabel}
          </span>
        )}
      </div>

      {/* 3. Manager summary KPI row */}
      <dl
        className={cn(
          "mt-4 grid grid-cols-2 gap-3",
          summary.estimatedValueSAR !== null
            ? "lg:grid-cols-4"
            : "sm:grid-cols-3",
        )}
      >
        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
            <Package className="size-3.5 text-[#B18732]" aria-hidden="true" />
            Products
          </dt>
          <dd className="mt-1 text-sm font-bold text-[#101D36] tabular-nums">
            {numberFormatter.format(summary.productCount)}{" "}
            {summary.productCount === 1 ? "Product" : "Products"}
          </dd>
        </div>

        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
            <TargetIcon className="size-3.5 text-[#B18732]" aria-hidden="true" />
            {targetAccountLabel}
          </dt>
          <dd className="mt-1 text-sm font-bold text-[#101D36] tabular-nums">
            {numberFormatter.format(summary.accountCount)} {targetAccountLabel}
          </dd>
        </div>

        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
            <TrendingUp className="size-3.5 text-[#B18732]" aria-hidden="true" />
            Total Quantity
          </dt>
          <dd className="mt-1 text-sm font-bold text-[#101D36] tabular-nums">
            {numberFormatter.format(summary.totalUnits)} Units
          </dd>
        </div>

        {summary.estimatedValueSAR !== null && (
          <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
            <dt className="text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
              Estimated Value
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#101D36] tabular-nums">
              {formatSAR(summary.estimatedValueSAR)}
            </dd>
          </div>
        )}
      </dl>

      {/* 4. Top 3 Product highlights */}
      {summary.topProducts.length > 0 && (
        <div className="mt-4 rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-3.5">
          <p className="mb-2 text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
            Top Product Allocations
          </p>
          <ul className="space-y-1.5 text-xs">
            {summary.topProducts.map((item, idx) => (
              <li
                key={`${forecast.id}-top-${item.productName}-${idx}`}
                className="flex items-start justify-between gap-3"
              >
                <span
                  className="min-w-0 flex-1 whitespace-normal break-words font-semibold text-[#182033]"
                  dir="auto"
                >
                  {item.productName}
                </span>
                <span className="shrink-0 font-bold text-[#344054] tabular-nums">
                  {numberFormatter.format(item.units)} units
                </span>
              </li>
            ))}
          </ul>
          {summary.extraProductsCount > 0 && (
            <p className="mt-2 text-xs font-semibold text-[#667085]">
              + {summary.extraProductsCount} more{" "}
              {summary.extraProductsCount === 1 ? "product" : "products"}
            </p>
          )}
        </div>
      )}

      {/* 5. Warning or Comparison area (rendered only when relevant) */}
      {(summary.warnings.length > 0 || comparisonText) && (
        <div className="mt-3 space-y-2">
          {summary.warnings.map((w) => (
            <div
              key={w.code}
              role="note"
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#FEDF89] bg-[#FFFAEB] px-3 py-2 text-xs text-[#93370D]"
            >
              <span className="flex items-center gap-2 font-medium">
                <AlertTriangle className="size-4 shrink-0 text-[#B54708]" aria-hidden="true" />
                <span>Attention: {w.message}</span>
              </span>
              <button
                type="button"
                onClick={onToggleExpanded}
                className="font-bold underline hover:text-[#101D36]"
              >
                Inspect details
              </button>
            </div>
          ))}

          {comparisonText && (
            <p className="text-xs font-medium text-[#475467]">
              Comparison: {comparisonText}
            </p>
          )}
        </div>
      )}

      {/* Approved / Rejected context */}
      {status === "approved" && (
        <div className="mt-3 rounded-[10px] border border-[#ABEFC6] bg-[#ECFDF3]/70 px-3 py-2 text-xs text-[#067647]">
          <span className="font-semibold">Approved</span>
          {forecast.updatedAt
            ? ` on ${formatSaudiDateTimeDisplay(new Date(forecast.updatedAt))}`
            : ""}
          {forecast.supervisorFeedback && (
            <span className="mt-1 block whitespace-normal break-words text-[#067647]/90" dir="auto">
              Note: {forecast.supervisorFeedback}
            </span>
          )}
        </div>
      )}

      {status === "rejected" && (
        <div className="mt-3 rounded-[10px] border border-[#FECDCA] bg-[#FEF3F2]/80 px-3 py-2.5 text-xs text-[#B42318]">
          <span className="font-semibold">Rejected</span>
          {forecast.updatedAt
            ? ` on ${formatSaudiDateTimeDisplay(new Date(forecast.updatedAt))}`
            : ""}
          {forecast.supervisorFeedback && (
            <p className="mt-1 whitespace-normal break-words font-medium text-[#7A271A]" dir="auto">
              Reason: {forecast.supervisorFeedback}
            </p>
          )}
        </div>
      )}

      {/* 6. Card Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[#EEF1F6] pt-3.5">
        <Button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={isExpanded}
          className="h-10 min-h-[40px] cursor-pointer rounded-[10px] bg-[#101D36] px-4 text-xs font-bold text-white hover:bg-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]"
        >
          {status === "pending" ? "Review Forecast" : "View Details"}
          {isExpanded ? (
            <ChevronUp className="ml-1.5 size-4 text-[#C9A44C]" aria-hidden="true" />
          ) : (
            <ArrowRight className="ml-1.5 size-4 text-[#C9A44C]" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Expanded Detail Surface (full allocations + Approve/Reject for pending) */}
      {isExpanded && (
        <div className="mt-4 border-t border-[#EEF1F5] pt-4">
          {forecast.notes && (
            <div className="mb-4 rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
              <p className="text-xs font-bold tracking-[0.04em] text-[#8A94A6] uppercase">
                Rep Notes
              </p>
              <p
                className="mt-1.5 whitespace-normal break-words text-sm text-[#4B5568]"
                dir="auto"
              >
                {forecast.notes}
              </p>
            </div>
          )}

          {forecast.productForecasts.length > 0 && (
            <div>
              <p className="mb-2.5 text-sm font-semibold text-[#182033]">
                Full Allocation Details ({forecast.productForecasts.length})
              </p>
              <div className="grid gap-2">
                {forecast.productForecasts.map((pf, index) => (
                  <div
                    key={`${forecast.id}-${pf.productName}-${pf.doctorName}-${index}`}
                    className="grid gap-2 rounded-[10px] border border-[#EEF1F5] bg-[#FBFCFE] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p
                        className="whitespace-normal break-words text-sm font-semibold text-[#182033]"
                        dir="auto"
                      >
                        {pf.productName}
                      </p>
                      <p
                        className="mt-0.5 whitespace-normal break-words text-xs font-medium text-[#667085]"
                        dir="auto"
                      >
                        {pf.doctorName}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-[#182033] tabular-nums">
                      {numberFormatter.format(pf.productUnits)} units
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() =>
                  onOpenDialog(forecast.id, "approve", forecast.repName)
                }
                className="h-11 cursor-pointer rounded-[10px] border border-[#168557] bg-[#168557] font-bold text-white transition-colors hover:bg-[#107349]"
              >
                <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
                Approve Forecast
              </Button>
              <Button
                type="button"
                onClick={() =>
                  onOpenDialog(forecast.id, "reject", forecast.repName)
                }
                variant="outline"
                className="h-11 cursor-pointer rounded-[10px] border-[#B42318] font-bold text-[#B42318] transition-colors hover:bg-[#B42318] hover:text-white"
              >
                <CircleX className="mr-2 size-4" aria-hidden="true" />
                Reject Forecast
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
