"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock,
  Copy,
  FileText,
  Package,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatSAR, formatSaudiDateTimeDisplay } from "@/lib/utils";
import type { Forecast } from "../lib/types";
import {
  formatForecastFrequency,
  formatForecastStatusLabel,
  getForecastTargetLabels,
  groupForecastAllocationsByProduct,
} from "../lib/utils/labels";

interface ForecastDetailsDialogProps {
  forecast: Forecast | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export function ForecastDetailsDialog({
  forecast,
  open,
  onOpenChange,
}: ForecastDetailsDialogProps) {
  const targetLabels = useMemo(
    () => getForecastTargetLabels(forecast?.targetType),
    [forecast?.targetType],
  );

  const grouped = useMemo(
    () => groupForecastAllocationsByProduct(forecast?.productForecasts || []),
    [forecast?.productForecasts],
  );

  if (!forecast) return null;

  const statusInfo = formatForecastStatusLabel(
    forecast.rawStatus || forecast.status,
  );
  const frequencyLabel = formatForecastFrequency(forecast.periodType);
  const TargetIcon =
    targetLabels.targetType === "PHARMACY" ? Building2 : Stethoscope;

  const StatusIcon =
    statusInfo.key === "APPROVED"
      ? CheckCircle2
      : statusInfo.key === "REJECTED"
        ? CircleX
        : statusInfo.key === "DRAFT"
          ? FileText
          : Clock;

  const statusClassName =
    statusInfo.key === "APPROVED"
      ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
      : statusInfo.key === "REJECTED"
        ? "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]"
        : statusInfo.key === "DRAFT"
          ? "border-[#D0D5DD] bg-[#F2F4F7] text-[#344054]"
          : "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]";

  const productCount = grouped.uniqueProductCount || forecast.productsUsed;
  const accountCount = grouped.uniqueAccountCount || forecast.doctorsCovered;
  const totalUnits = grouped.totalUnits || forecast.totalUnitsPlanned;
  const estimatedValueSAR = forecast.summary?.estimatedValueSAR ?? null;

  const updatedDifferent =
    forecast.updatedAt &&
    forecast.createdAt &&
    Math.abs(
      new Date(forecast.updatedAt).getTime() -
        new Date(forecast.createdAt).getTime(),
    ) >
      60 * 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-lg font-bold text-[#182033]">
              {forecast.period}
            </DialogTitle>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#DDE3EE] bg-[#F4F6FA] px-2.5 py-0.5 text-xs font-bold text-[#344054]">
              <TargetIcon className="size-3.5" aria-hidden="true" />
              {targetLabels.forecastLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-[#E5E8EF] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#475467]">
              {frequencyLabel}
            </span>
            <span
              role="status"
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusClassName}`}
            >
              <StatusIcon className="size-3.5" aria-hidden="true" />
              {statusInfo.label}
            </span>
          </div>
          <DialogDescription className="text-xs text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Submitted {formatSaudiDateTimeDisplay(new Date(forecast.createdAt))}
              {updatedDifferent && forecast.updatedAt
                ? ` • Updated ${formatSaudiDateTimeDisplay(new Date(forecast.updatedAt))}`
                : ""}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Summary KPI Strip */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
              <Package className="size-3.5 text-[#168557]" aria-hidden="true" />
              Products
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#182033] tabular-nums">
              {numberFormatter.format(productCount)}
            </dd>
          </div>

          <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
              <TargetIcon className="size-3.5 text-[#168557]" aria-hidden="true" />
              {targetLabels.coveredLabel}
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#182033] tabular-nums">
              {targetLabels.formatCount(accountCount)}
            </dd>
          </div>

          <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
            <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
              <TrendingUp className="size-3.5 text-[#168557]" aria-hidden="true" />
              Total Units
            </dt>
            <dd className="mt-1 text-sm font-bold text-[#182033] tabular-nums">
              {numberFormatter.format(totalUnits)} units
            </dd>
          </div>

          {estimatedValueSAR !== null && (
            <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
              <dt className="text-[11px] font-bold text-[#667085] uppercase">
                Estimated Value
              </dt>
              <dd className="mt-1 text-sm font-bold text-[#168557] tabular-nums">
                {formatSAR(estimatedValueSAR)}
              </dd>
            </div>
          )}
        </dl>

        {/* Manager Feedback & Rep Notes */}
        {forecast.supervisorFeedback && (
          <div
            className={`rounded-[12px] border p-3.5 text-xs ${
              statusInfo.key === "REJECTED"
                ? "border-[#FECDCA] bg-[#FEF3F2] text-[#7A271A]"
                : "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
            }`}
          >
            <p className="font-bold uppercase tracking-wide text-[11px]">
              Manager Feedback
            </p>
            <p className="mt-1 whitespace-normal break-words" dir="auto">
              {forecast.supervisorFeedback}
            </p>
          </div>
        )}

        {forecast.notes && (
          <div className="rounded-[12px] border border-[#E5E8EF] bg-[#F9FAFB] p-3.5 text-xs text-[#344054]">
            <p className="font-bold uppercase tracking-wide text-[11px] text-[#667085]">
              Notes
            </p>
            <p className="mt-1 whitespace-normal break-words" dir="auto">
              {forecast.notes}
            </p>
          </div>
        )}

        {/* Product-First Allocation Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#182033]">
            {targetLabels.allocationsLabel} (by Product)
          </h3>

          {grouped.groups.length === 0 ? (
            <p className="rounded-[12px] border border-[#E5E8EF] bg-[#F9FAFB] p-4 text-xs text-[#667085]">
              No product allocations recorded for this forecast.
            </p>
          ) : (
            <div className="space-y-3">
              {grouped.groups.map((productGroup) => (
                <div
                  key={productGroup.productKey}
                  className="rounded-[12px] border border-[#E5E8EF] bg-white p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#EEF1F6] pb-2.5">
                    <div className="min-w-0 flex-1">
                      <p
                        className="whitespace-normal break-words text-sm font-bold text-[#182033]"
                        dir="auto"
                      >
                        {productGroup.productName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#667085]">
                        {targetLabels.formatCount(productGroup.accounts.length)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#E9F8F1] px-2.5 py-1 text-xs font-bold text-[#168557] tabular-nums">
                      {numberFormatter.format(productGroup.totalUnits)} units
                    </span>
                  </div>

                  <ul className="mt-2.5 divide-y divide-[#F2F4F7]">
                    {productGroup.accounts.map((acc, idx) => (
                      <li
                        key={`${productGroup.productKey}-${acc.accountName}-${idx}`}
                        className="flex items-start justify-between gap-3 py-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className="block whitespace-normal break-words font-medium text-[#182033]"
                            dir="auto"
                          >
                            {acc.accountName}
                          </span>
                          {acc.secondaryInfo && (
                            <span
                              className="block whitespace-normal break-words text-[11px] text-[#667085]"
                              dir="auto"
                            >
                              {acc.secondaryInfo}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 font-bold text-[#344054] tabular-nums">
                          {numberFormatter.format(acc.units)} units
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-[#EEF1F6] pt-4 sm:justify-between">
          <Link href={`/rep/forecast/new?duplicateFrom=${forecast.id}`}>
            <Button type="button" variant="outline" className="gap-1.5">
              <Copy className="size-3.5" aria-hidden="true" />
              Duplicate Forecast
            </Button>
          </Link>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#182033] text-white hover:bg-[#101D36]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
