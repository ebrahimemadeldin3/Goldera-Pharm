"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleX,
  Clock,
  Copy,
  Eye,
  FileText,
  Package,
  Plus,
  Search,
  Stethoscope,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { formatSAR, formatSaudiDateTimeDisplay } from "@/lib/utils";
import type { Forecast } from "../lib/types";
import {
  formatForecastFrequency,
  formatForecastStatusLabel,
  getForecastTargetLabels,
  groupForecastAllocationsByProduct,
} from "../lib/utils/labels";
import { ForecastDetailsDialog } from "./ForecastDetailsDialog";

interface RepForecastHubProps {
  forecasts: Forecast[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function ForecastStatusPill({
  status,
  rawStatus,
}: {
  status: Forecast["status"];
  rawStatus?: string;
}) {
  const info = formatForecastStatusLabel(rawStatus || status);
  const styles =
    info.key === "APPROVED"
      ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
      : info.key === "REJECTED"
        ? "border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]"
        : info.key === "DRAFT"
          ? "border-[#D0D5DD] bg-[#F2F4F7] text-[#344054]"
          : "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]";
  const Icon =
    info.key === "APPROVED"
      ? CheckCircle2
      : info.key === "REJECTED"
        ? CircleX
        : info.key === "DRAFT"
          ? FileText
          : Clock;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${styles}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{info.label}</span>
    </span>
  );
}

function formatWaitingTime(createdAt: string): string | null {
  const createdMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdMs)) return null;
  const hours = Math.max(0, Math.floor((Date.now() - createdMs) / (1000 * 60 * 60)));
  if (hours < 1) return "Pending review for less than 1 hour";
  if (hours < 24) return `Pending review for ${hours} ${hours === 1 ? "hour" : "hours"}`;
  const days = Math.floor(hours / 24);
  return `Pending review for ${days} ${days === 1 ? "day" : "days"}`;
}

export function RepForecastHub({
  forecasts,
  page = 1,
  limit = 10,
  totalCount = 0,
}: RepForecastHubProps) {
  const [expandedForecasts, setExpandedForecasts] = useState<Set<string>>(
    new Set(),
  );
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const toggleExpanded = (id: string) => {
    setExpandedForecasts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const latestForecast = forecasts.length > 0 ? forecasts[0] : null;
  const latestLabels = getForecastTargetLabels(latestForecast?.targetType);
  const latestGrouped = useMemo(
    () =>
      groupForecastAllocationsByProduct(latestForecast?.productForecasts || []),
    [latestForecast?.productForecasts],
  );

  const filteredForecasts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return forecasts.filter((f) => {
      const statusInfo = formatForecastStatusLabel(f.rawStatus || f.status);
      const matchesType =
        targetTypeFilter === "all" ||
        (f.targetType || "DOCTOR") === targetTypeFilter;
      const matchesStatus =
        statusFilter === "all" || statusInfo.key === statusFilter;
      const matchesSearch =
        !query ||
        f.period.toLowerCase().includes(query) ||
        (f.notes || "").toLowerCase().includes(query) ||
        (f.productForecasts || []).some(
          (row) =>
            (row.productName || "").toLowerCase().includes(query) ||
            (row.doctorName || "").toLowerCase().includes(query) ||
            (row.pharmacyName || "").toLowerCase().includes(query),
        ) ||
        f.distributions.some((d) => d.doctorName.toLowerCase().includes(query));

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [forecasts, searchQuery, statusFilter, targetTypeFilter]);

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    targetTypeFilter !== "all" ||
    statusFilter !== "all";

  const visibleForecasts = hasFilters
    ? filteredForecasts
    : filteredForecasts.slice((page - 1) * limit, page * limit);
  const displayTotalCount = hasFilters
    ? filteredForecasts.length
    : totalCount || forecasts.length;

  const latestTopProducts = latestForecast?.summary?.topProducts?.length
    ? {
        items: latestForecast.summary.topProducts,
        extra: latestForecast.summary.extraProductsCount,
      }
    : {
        items: latestGrouped.groups.slice(0, 3).map((g) => ({
          productId: g.productId || null,
          productName: g.productName,
          units: g.totalUnits,
          accountCount: g.accounts.length,
        })),
        extra: Math.max(0, latestGrouped.groups.length - 3),
      };

  const latestStatus = latestForecast
    ? formatForecastStatusLabel(latestForecast.rawStatus || latestForecast.status)
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Compact Latest Forecast Submission */}
      <section className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold tracking-[0.06em] text-[#667085] uppercase">
            Latest Forecast Submission
          </h2>
          <Link href="/rep/forecast/new">
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 bg-[#168557] text-xs font-semibold text-white hover:bg-[#107349]"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              New Forecast
            </Button>
          </Link>
        </div>

        {!latestForecast ? (
          <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-6 text-center">
            <p className="text-sm font-semibold text-[#182033]">
              No forecasts submitted yet
            </p>
            <p className="mt-1 text-xs text-[#667085]">
              Create your first Doctor or Pharmacy Forecast to start planning.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Period + Type + Status + Frequency */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-[#182033]">
                    {latestForecast.period}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#DDE3EE] bg-[#F4F6FA] px-2.5 py-0.5 text-xs font-bold text-[#344054]">
                    {latestLabels.targetType === "PHARMACY" ? (
                      <Building2 className="size-3.5" aria-hidden="true" />
                    ) : (
                      <Stethoscope className="size-3.5" aria-hidden="true" />
                    )}
                    {latestLabels.forecastLabel}
                  </span>
                  <ForecastStatusPill
                    status={latestForecast.status}
                    rawStatus={latestForecast.rawStatus}
                  />
                  <span className="inline-flex items-center rounded-full border border-[#E5E8EF] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#475467]">
                    {formatForecastFrequency(latestForecast.periodType)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#667085]">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Submitted{" "}
                    {formatSaudiDateTimeDisplay(
                      new Date(latestForecast.createdAt),
                    )}
                  </span>
                  {latestStatus?.key === "PENDING" &&
                    formatWaitingTime(latestForecast.createdAt) && (
                      <span className="font-semibold text-[#B54708]">
                        {formatWaitingTime(latestForecast.createdAt)}
                      </span>
                    )}
                  {(latestStatus?.key === "APPROVED" ||
                    latestStatus?.key === "REJECTED") &&
                    latestForecast.updatedAt && (
                      <span>
                        Reviewed{" "}
                        {formatSaudiDateTimeDisplay(
                          new Date(latestForecast.updatedAt),
                        )}
                      </span>
                    )}
                </div>
              </div>

              {/* Contextual Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={() => setSelectedForecast(latestForecast)}
                  className="h-9 gap-1.5 bg-[#182033] text-xs font-bold text-white hover:bg-[#101D36]"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  View Forecast
                </Button>
                {latestStatus?.key === "DRAFT" && (
                  <Link
                    href={`/rep/forecast/new?duplicateFrom=${latestForecast.id}`}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 gap-1.5 text-xs font-semibold"
                    >
                      <FileText className="size-3.5" aria-hidden="true" />
                      Edit Draft
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/rep/forecast/new?duplicateFrom=${latestForecast.id}`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 gap-1.5 text-xs font-semibold"
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    Duplicate Forecast
                  </Button>
                </Link>
              </div>
            </div>

            {/* Primary Metrics Row */}
            <dl
              className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${
                latestForecast.summary?.estimatedValueSAR != null
                  ? "lg:grid-cols-4"
                  : ""
              }`}
            >
              <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
                  <Package
                    className="size-3.5 text-[#168557]"
                    aria-hidden="true"
                  />
                  Products Forecasted
                </dt>
                <dd className="mt-1 text-base font-bold text-[#182033] tabular-nums">
                  {numberFormatter.format(
                    latestForecast.summary?.productCount ??
                      (latestGrouped.uniqueProductCount ||
                        latestForecast.productsUsed),
                  )}{" "}
                  {(latestForecast.summary?.productCount ??
                    latestForecast.productsUsed) === 1
                    ? "product"
                    : "products"}
                </dd>
              </div>

              <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
                  {latestLabels.targetType === "PHARMACY" ? (
                    <Building2
                      className="size-3.5 text-[#168557]"
                      aria-hidden="true"
                    />
                  ) : (
                    <Stethoscope
                      className="size-3.5 text-[#168557]"
                      aria-hidden="true"
                    />
                  )}
                  {latestLabels.coveredLabel}
                </dt>
                <dd className="mt-1 text-base font-bold text-[#182033] tabular-nums">
                  {latestLabels.formatCount(
                    latestForecast.summary?.accountCount ??
                      (latestGrouped.uniqueAccountCount ||
                        latestForecast.doctorsCovered),
                  )}
                </dd>
              </div>

              <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
                <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#667085] uppercase">
                  <TrendingUp
                    className="size-3.5 text-[#168557]"
                    aria-hidden="true"
                  />
                  Total Units Forecasted
                </dt>
                <dd className="mt-1 text-base font-bold text-[#168557] tabular-nums">
                  {numberFormatter.format(
                    latestForecast.summary?.totalUnits ??
                      latestForecast.totalUnitsPlanned,
                  )}{" "}
                  units
                </dd>
              </div>

              {latestForecast.summary?.estimatedValueSAR != null && (
                <div className="rounded-[12px] border border-[#E5E8EF] bg-[#FBFCFE] p-3">
                  <dt className="text-[11px] font-bold text-[#667085] uppercase">
                    Estimated Value
                  </dt>
                  <dd className="mt-1 text-base font-bold text-[#182033] tabular-nums">
                    {formatSAR(latestForecast.summary.estimatedValueSAR)}
                  </dd>
                </div>
              )}
            </dl>

            {/* Top 3 Product Preview */}
            {latestTopProducts.items.length > 0 && (
              <div className="rounded-[12px] border border-[#EEF1F6] bg-[#F9FAFB] p-3.5">
                <p className="mb-2 text-[11px] font-bold tracking-[0.04em] text-[#667085] uppercase">
                  Top Forecasted Products
                </p>
                <ul className="space-y-1.5 text-xs">
                  {latestTopProducts.items.map((prod, idx) => (
                    <li
                      key={`latest-prod-${prod.productName}-${idx}`}
                      className="flex flex-wrap items-baseline justify-between gap-2"
                    >
                      <span
                        className="min-w-0 whitespace-normal break-words font-semibold text-[#182033]"
                        dir="auto"
                      >
                        {prod.productName}
                      </span>
                      <span className="shrink-0 font-semibold text-[#475467] tabular-nums">
                        {numberFormatter.format(prod.units)} units
                        {typeof prod.accountCount === "number" &&
                        prod.accountCount > 0
                          ? ` across ${latestLabels.formatCount(prod.accountCount)}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
                {latestTopProducts.extra > 0 && (
                  <p className="mt-2 text-xs font-semibold text-[#667085]">
                    + {latestTopProducts.extra} more{" "}
                    {latestTopProducts.extra === 1 ? "product" : "products"}
                  </p>
                )}
              </div>
            )}

            {/* Manager Feedback Preview */}
            {latestForecast.supervisorFeedback && (
              <div
                className={`flex flex-wrap items-center justify-between gap-2 rounded-[10px] border p-3 text-xs ${
                  latestStatus?.key === "REJECTED"
                    ? "border-[#FECDCA] bg-[#FEF3F2] text-[#7A271A]"
                    : "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold">Manager Feedback: </span>
                  <span className="whitespace-normal break-words" dir="auto">
                    {latestForecast.supervisorFeedback}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedForecast(latestForecast)}
                  className="h-7 px-2 text-xs font-bold underline"
                >
                  View Manager Feedback
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Forecast History */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#182033]">
              Forecast History
            </h2>
            <p className="text-xs text-[#667085]">
              Compare past Doctor and Pharmacy Forecasts, inspect allocations,
              or duplicate into a new period.
            </p>
          </div>
        </div>

        {/* History Filters */}
        {forecasts.length > 0 && (
          <div className="grid grid-cols-1 gap-2.5 rounded-[14px] border border-[#E5E8EF] bg-white p-3.5 sm:grid-cols-12">
            <div className="relative sm:col-span-6">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3]"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search period, product, doctor, or pharmacy..."
                aria-label="Search forecast history"
                className="h-9 pr-8 pl-9 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear forecast search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-[#98A2B3] hover:text-[#182033]"
                >
                  <XCircle className="size-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <Select
                value={targetTypeFilter}
                onValueChange={setTargetTypeFilter}
              >
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue placeholder="All Forecast Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forecast Types</SelectItem>
                  <SelectItem value="DOCTOR">Doctor Forecast</SelectItem>
                  <SelectItem value="PHARMACY">Pharmacy Forecast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {visibleForecasts.length === 0 ? (
          <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-8 text-center text-xs text-[#667085]">
            {hasFilters ? (
              <div className="space-y-2">
                <p className="font-semibold text-[#182033]">
                  No forecasts match your current filters.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setTargetTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              "No forecast history records found."
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visibleForecasts.map((forecast) => {
                const isExpanded = expandedForecasts.has(forecast.id);
                const labels = getForecastTargetLabels(forecast.targetType);
                const statusInfo = formatForecastStatusLabel(
                  forecast.rawStatus || forecast.status,
                );
                const grouped = groupForecastAllocationsByProduct(
                  forecast.productForecasts || [],
                );

                const productCount =
                  forecast.summary?.productCount ??
                  (grouped.uniqueProductCount || forecast.productsUsed);
                const accountCount =
                  forecast.summary?.accountCount ??
                  (grouped.uniqueAccountCount || forecast.doctorsCovered);
                const totalUnits =
                  forecast.summary?.totalUnits ?? forecast.totalUnitsPlanned;
                const estimatedSAR = forecast.summary?.estimatedValueSAR ?? null;

                const visibleProducts = isExpanded
                  ? grouped.groups
                  : grouped.groups.slice(0, 2);
                const hiddenAccountCount = Math.max(
                  0,
                  accountCount -
                    (isExpanded ? accountCount : Math.min(2, accountCount)),
                );

                return (
                  <article
                    key={forecast.id}
                    className="flex flex-col justify-between space-y-3.5 rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 shadow-xs transition-colors hover:border-[#CBEFDD]"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-[#182033]">
                              {forecast.period}
                            </h3>
                            <span className="inline-flex items-center rounded-full border border-[#DDE3EE] bg-[#F4F6FA] px-2.5 py-0.5 text-[11px] font-bold text-[#344054]">
                              {labels.forecastLabel}
                            </span>
                            <ForecastStatusPill
                              status={forecast.status}
                              rawStatus={forecast.rawStatus}
                            />
                            <span className="inline-flex items-center rounded-full border border-[#E5E8EF] bg-white px-2 py-0.5 text-[11px] font-semibold text-[#475467]">
                              {formatForecastFrequency(forecast.periodType)}
                            </span>
                          </div>
                          <p className="text-xs text-[#667085]">
                            Submitted{" "}
                            {formatSaudiDateTimeDisplay(
                              new Date(forecast.createdAt),
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Compact 3-Metric Strip */}
                      <div className="grid grid-cols-3 gap-2 rounded-[10px] border border-[#EEF1F6] bg-[#F9FAFB] p-2.5 text-xs">
                        <div>
                          <span className="block text-[11px] text-[#667085]">
                            Products
                          </span>
                          <span className="font-bold text-[#182033] tabular-nums">
                            {numberFormatter.format(productCount)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] text-[#667085]">
                            {labels.plural}
                          </span>
                          <span className="font-bold text-[#182033] tabular-nums">
                            {numberFormatter.format(accountCount)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[11px] text-[#667085]">
                            Total Units
                          </span>
                          <span className="font-bold text-[#168557] tabular-nums">
                            {numberFormatter.format(totalUnits)}
                          </span>
                        </div>
                      </div>

                      {estimatedSAR != null && (
                        <p className="text-xs font-semibold text-[#344054]">
                          Estimated Value:{" "}
                          <span className="font-bold text-[#182033]">
                            {formatSAR(estimatedSAR)}
                          </span>
                        </p>
                      )}

                      {/* Product-first Preview */}
                      {grouped.groups.length > 0 && (
                        <div className="space-y-1.5">
                          {visibleProducts.map((prod) => (
                            <div
                              key={`${forecast.id}-${prod.productKey}`}
                              className="flex items-start justify-between gap-2 rounded-[8px] border border-[#EEF1F6] bg-[#FBFCFE] px-3 py-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p
                                  className="whitespace-normal break-words font-semibold text-[#182033]"
                                  dir="auto"
                                >
                                  {prod.productName}
                                </p>
                                <p className="mt-0.5 text-[11px] text-[#667085]">
                                  {labels.formatCount(prod.accounts.length)}
                                </p>
                              </div>
                              <span className="shrink-0 font-bold text-[#168557] tabular-nums">
                                {numberFormatter.format(prod.totalUnits)} units
                              </span>
                            </div>
                          ))}

                          {(grouped.groups.length > 2 ||
                            hiddenAccountCount > 0) && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(forecast.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#168557] hover:underline"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="size-3.5" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="size-3.5" />
                                  {grouped.groups.length > 2
                                    ? `+ ${grouped.groups.length - 2} more ${
                                        grouped.groups.length - 2 === 1
                                          ? "product"
                                          : "products"
                                      }`
                                    : labels.formatShowMore(hiddenAccountCount)}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {forecast.supervisorFeedback && (
                        <p
                          className={`rounded-[8px] border px-2.5 py-2 text-xs whitespace-normal break-words ${
                            statusInfo.key === "REJECTED"
                              ? "border-[#FECDCA] bg-[#FEF3F2] text-[#7A271A]"
                              : "border-[#ABEFC6] bg-[#ECFDF3] text-[#067647]"
                          }`}
                          dir="auto"
                        >
                          <span className="font-bold">Feedback: </span>
                          {forecast.supervisorFeedback}
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F6] pt-3">
                      <Link
                        href={`/rep/forecast/new?duplicateFrom=${forecast.id}`}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-semibold"
                        >
                          <Copy className="size-3.5" aria-hidden="true" />
                          Duplicate Forecast
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedForecast(forecast)}
                        className="h-8 gap-1.5 bg-[#182033] text-xs font-bold text-white hover:bg-[#101D36]"
                      >
                        <Eye className="size-3.5" aria-hidden="true" />
                        View Details
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>

            <TablePaginationFooter
              page={hasFilters ? 1 : page}
              limit={limit}
              totalCount={displayTotalCount}
              itemLabel="forecasts"
            />
          </div>
        )}
      </section>

      <ForecastDetailsDialog
        forecast={selectedForecast}
        open={Boolean(selectedForecast)}
        onOpenChange={(open) => {
          if (!open) setSelectedForecast(null);
        }}
      />
    </div>
  );
}

export default RepForecastHub;
