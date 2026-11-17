"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock3,
  FileText,
  Inbox,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Pagination from "@/components/ui/Pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateForecastAction } from "../api/management";
import type { ForecastManagement } from "../lib/types/management";
import { ManagerForecastCard } from "./ManagerForecastCard";

type ForecastStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | ForecastStatus;

type ForecastApprovalCenterProps = {
  forecasts: ForecastManagement[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");

function getForecastStatus(forecast: ForecastManagement): ForecastStatus {
  const status = forecast.status?.toUpperCase();

  if (status === "APPROVED" || forecast.isApproved) {
    return "approved";
  }

  if (status === "REJECTED") {
    return "rejected";
  }

  return "pending";
}

function formatForecastDate(value: string, pattern = "MMM d, yyyy") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return format(date, pattern);
}

function getPeriodKey(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "unknown";
  }

  return format(date, "yyyy-MM");
}

function ForecastPageHeader() {
  return (
    <header className="forecast-approval-enter">
      <div className="flex items-center gap-2">
        <span
          className="h-px w-9 rounded-full bg-[#C9A44C]"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-none font-semibold tracking-[0.12em] text-[#C9A44C] uppercase">
          Commercial
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[30px] leading-tight font-semibold text-[#182033] md:text-[34px]">
            Forecast Management
          </h1>
          <p className="mt-2 max-w-[720px] text-sm leading-6 font-medium text-[#667085] md:text-base">
            Review forecast submissions, monitor projected performance and
            compare commercial expectations.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E9DDB8] bg-[#FFFBF1] px-3 py-1.5 text-xs font-semibold text-[#6F5A20]">
          <span
            className="size-1.5 rounded-full bg-[#C9A44C] shadow-[0_0_0_3px_rgba(201,164,76,0.12)]"
            aria-hidden="true"
          />
          Forecast Approval Center
        </span>
      </div>
    </header>
  );
}

function ForecastKpiCard({
  label,
  value,
  helper,
  icon: Icon,
  delay,
}: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  delay: string;
}) {
  const toneClassName = "border border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]";

  return (
    <article
      className="forecast-kpi-card forecast-approval-stagger flex min-h-[126px] items-center gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
      style={{ "--forecast-delay": delay } as CSSProperties}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-[14px] ${toneClassName}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.08em] text-[#8A94A6] uppercase">
          {label}
        </p>
        <p className="mt-1 text-[26px] leading-tight font-semibold text-[#182033]">
          {numberFormatter.format(value)}
        </p>
        <p className="mt-1 text-xs font-medium text-[#8A94A6]">{helper}</p>
      </div>
    </article>
  );
}

function ForecastStats({
  forecasts,
  totalCount,
}: {
  forecasts: ForecastManagement[];
  totalCount: number;
}) {
  const counts = forecasts.reduce(
    (acc, forecast) => {
      acc[getForecastStatus(forecast)] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 } as Record<ForecastStatus, number>,
  );

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ForecastKpiCard
        label="Total Requests"
        value={totalCount}
        helper="All forecast submissions"
        icon={Inbox}
        delay="80ms"
      />
      <ForecastKpiCard
        label="Pending Review"
        value={counts.pending}
        helper="Awaiting your decision"
        icon={Clock3}
        delay="150ms"
      />
      <ForecastKpiCard
        label="Approved"
        value={counts.approved}
        helper="Approved forecasts"
        icon={CheckCircle2}
        delay="220ms"
      />
      <ForecastKpiCard
        label="Rejected"
        value={counts.rejected}
        helper="Rejected forecasts"
        icon={CircleX}
        delay="290ms"
      />
    </section>
  );
}

function ForecastToolbar({
  showingCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
  periodFilter,
  onPeriodFilterChange,
  targetTypeFilter,
  onTargetTypeFilterChange,
  sortBy,
  onSortByChange,
  periodOptions,
  activeFilterCount,
  onClearFilters,
}: {
  showingCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  statusCounts: Record<ForecastStatus, number>;
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  targetTypeFilter: string;
  onTargetTypeFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  activeFilterCount: number;
  onClearFilters: () => void;
}) {
  const statusTabs: Array<{
    value: StatusFilter;
    label: string;
    count: number;
    icon: LucideIcon;
    countClassName: string;
  }> = [
    {
      value: "all",
      label: "All",
      count: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
      icon: Inbox,
      countClassName: "text-[#C9A44C]",
    },
    {
      value: "pending",
      label: "Pending",
      count: statusCounts.pending,
      icon: Clock3,
      countClassName: "text-[#B18732]",
    },
    {
      value: "approved",
      label: "Approved",
      count: statusCounts.approved,
      icon: CheckCircle2,
      countClassName: "text-[#168557]",
    },
    {
      value: "rejected",
      label: "Rejected",
      count: statusCounts.rejected,
      icon: CircleX,
      countClassName: "text-[#B42318]",
    },
  ];

  return (
    <div className="forecast-panel-toolbar flex flex-col gap-4 border-b border-[#E5E8EF] bg-[#FBFCFE] px-4 py-4 sm:px-5">
      <div>
        <h2 className="text-base font-semibold text-[#182033]">
          Forecast Requests
        </h2>
        <p className="mt-1 text-sm font-medium text-[#8A94A6]">
          Showing {numberFormatter.format(showingCount)} requests
        </p>
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] xl:items-center">
        <div className="forecast-status-tabs grid gap-1 rounded-[13px] border border-[#E7EAF0] bg-[#F5F7FA] p-1 sm:grid-cols-4">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;

            return (
              <button
                type="button"
                key={tab.value}
                aria-pressed={isActive}
                onClick={() => onStatusFilterChange(tab.value)}
                className={`forecast-status-tab inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[9px] px-3 text-xs font-semibold transition-[background-color,color,box-shadow,transform] duration-[180ms] ease-out focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none ${
                  isActive
                    ? "bg-[#101D36] text-white shadow-[0_6px_14px_rgba(16,29,54,0.18)]"
                    : "text-[#344054] hover:bg-[#101D36]/5 hover:text-[#101D36]"
                }`}
              >
                <Icon
                  className={`size-3.5 shrink-0 ${isActive ? "text-[#C9A44C]" : "text-[#667085]"}`}
                  aria-hidden="true"
                />
                <span className="truncate">{tab.label}</span>
                <span
                  className={`shrink-0 font-bold ${isActive ? "text-[#C9A44C]" : tab.countClassName}`}
                >
                  {numberFormatter.format(tab.count)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_170px]">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#344054]"
              aria-hidden="true"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search representative or forecast..."
              className="forecast-search-input h-11 w-full rounded-[12px] border border-[#E5E8EF] bg-white pr-10 pl-10 text-sm font-medium text-[#182033] outline-none placeholder:text-[#98A2B3]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8A94A6] transition-[background-color,color] hover:bg-[#F4F6FA] hover:text-[#182033]"
                aria-label="Clear forecast search"
              >
                <XCircle className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
            <SelectTrigger className="forecast-select-trigger h-11 rounded-[12px] border-[#E5E8EF] bg-white text-sm font-semibold text-[#4B5568]">
              <span className="flex min-w-0 items-center gap-2">
                <CalendarDays className="size-4 text-[#344054]" />
                <SelectValue placeholder="Period" />
              </span>
            </SelectTrigger>
            <SelectContent className="forecast-select-content rounded-[12px] border-[#E5E8EF] bg-white shadow-[0_16px_34px_rgba(16,24,40,0.14)]">
              <SelectItem value="all">All Periods</SelectItem>
              {periodOptions.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={targetTypeFilter}
            onValueChange={onTargetTypeFilterChange}
          >
            <SelectTrigger className="forecast-select-trigger h-11 rounded-[12px] border-[#E5E8EF] bg-white text-sm font-semibold text-[#4B5568]">
              <SelectValue placeholder="All Forecast Types" />
            </SelectTrigger>
            <SelectContent className="forecast-select-content rounded-[12px] border-[#E5E8EF] bg-white shadow-[0_16px_34px_rgba(16,24,40,0.14)]">
              <SelectItem value="all">All Forecast Types</SelectItem>
              <SelectItem value="DOCTOR">Doctor Forecast</SelectItem>
              <SelectItem value="PHARMACY">Pharmacy Forecast</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="forecast-select-trigger h-11 rounded-[12px] border-[#E5E8EF] bg-white text-sm font-semibold text-[#4B5568]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="forecast-select-content rounded-[12px] border-[#E5E8EF] bg-white shadow-[0_16px_34px_rgba(16,24,40,0.14)]">
              <SelectItem value="newest">Newest submitted</SelectItem>
              <SelectItem value="oldest_pending">Oldest pending</SelectItem>
              <SelectItem value="highest_units">Highest total quantity</SelectItem>
              <SelectItem value="rep_name">Representative name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-fit rounded-full px-2.5 py-1 text-xs font-bold text-[#9A7628] transition-[background-color,color] hover:bg-[#FFF8E5] hover:text-[#182033]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function ForecastEmptyState({
  isFiltered,
  onClearFilters,
}: {
  isFiltered: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="forecast-empty-state flex min-h-[390px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="forecast-empty-visual relative mx-auto flex size-28 items-center justify-center rounded-[28px] bg-[#FFFBF1]">
        <span className="forecast-empty-ring absolute inset-0 rounded-[28px] border border-[#E9DDB8]" />
        <FileText className="size-11 text-[#182033]" aria-hidden="true" />
        <span className="absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full border border-[#E9DDB8] bg-white text-[#B18732] shadow-[0_8px_22px_rgba(16,24,40,0.12)]">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <span className="absolute -top-3 -left-3 flex size-9 items-center justify-center rounded-full border border-[#E9DDB8] bg-white text-[#B18732] shadow-[0_8px_22px_rgba(16,24,40,0.1)]">
          <TrendingUp className="size-4" aria-hidden="true" />
        </span>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#182033]">
        {isFiltered
          ? "No matching forecast requests"
          : "No forecast requests yet"}
      </h3>
      <p className="mt-2 max-w-[480px] text-sm leading-6 font-medium text-[#667085]">
        {isFiltered
          ? "No submissions match your current search and filters."
          : "Forecast submissions from your medical representatives will appear here once they are submitted for approval."}
      </p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E9DDB8] bg-[#FFFBF1] px-3 py-1.5 text-xs font-bold text-[#6F5A20]">
        <span className="forecast-waiting-dot size-2 rounded-full bg-[#C9A44C]" />
        {isFiltered ? "Adjust filters" : "Waiting for submissions"}
      </div>
      {isFiltered && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 rounded-[10px] border border-[#101D36] bg-[#101D36] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#101D36]/95"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function ForecastFooter({ forecasts }: { forecasts: ForecastManagement[] }) {
  const latestTimestamp = forecasts
    .map((forecast) => new Date(forecast.updatedAt || forecast.createdAt))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const label = latestTimestamp
    ? `Last updated ${format(latestTimestamp, "MMM d, yyyy - h:mm a")}`
    : "Last updated after requests arrive";

  return (
    <footer className="forecast-footer-bar flex flex-col gap-2 rounded-[14px] border border-[#E5E8EF] bg-white/80 px-4 py-3 text-xs font-semibold text-[#8A94A6] sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-2">
        <RefreshCw className="size-3.5 text-[#B18732]" aria-hidden="true" />
        {label}
      </span>
      <span>(c) 2026 GolderaPharm CRM</span>
    </footer>
  );
}

export default function ForecastApprovalCenter({
  forecasts,
  page = 1,
  limit = 10,
  totalCount = 0,
}: ForecastApprovalCenterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedForecasts, setExpandedForecasts] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams?.get("search") || "",
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const val = searchParams?.get("status");
    return val === "pending" || val === "approved" || val === "rejected"
      ? val
      : "all";
  });
  const [periodFilter, setPeriodFilter] = useState(
    () => searchParams?.get("period") || "all",
  );
  const [targetTypeFilter, setTargetTypeFilter] = useState(
    () => searchParams?.get("targetType") || "all",
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams?.get("sort") || "newest",
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    else params.delete("search");
    if (statusFilter !== "all") params.set("status", statusFilter);
    else params.delete("status");
    if (periodFilter !== "all") params.set("period", periodFilter);
    else params.delete("period");
    if (targetTypeFilter !== "all") params.set("targetType", targetTypeFilter);
    else params.delete("targetType");
    if (sortBy !== "newest") params.set("sort", sortBy);
    else params.delete("sort");

    const nextQs = params.toString();
    const currentQs = searchParams?.toString() || "";
    if (nextQs !== currentQs) {
      router.replace(nextQs ? `${pathname}?${nextQs}` : pathname, {
        scroll: false,
      });
    }
  }, [
    pathname,
    periodFilter,
    router,
    searchParams,
    searchQuery,
    sortBy,
    statusFilter,
    targetTypeFilter,
  ]);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    forecastId: string | null;
    action: "approve" | "reject" | null;
    repName: string;
  }>({
    open: false,
    forecastId: null,
    action: null,
    repName: "",
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusCounts = useMemo(
    () =>
      forecasts.reduce(
        (acc, forecast) => {
          acc[getForecastStatus(forecast)] += 1;
          return acc;
        },
        {
          pending: 0,
          approved: 0,
          rejected: 0,
        } as Record<ForecastStatus, number>,
      ),
    [forecasts],
  );

  const periodOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const forecast of forecasts) {
      options.set(
        getPeriodKey(forecast.periodDate),
        formatForecastDate(forecast.periodDate, "MMMM yyyy"),
      );
    }

    return Array.from(options, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [forecasts]);

  const filteredForecasts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return forecasts.filter((forecast) => {
      const status = getForecastStatus(forecast);
      const periodKey = getPeriodKey(forecast.periodDate);
      const matchesSearch =
        !normalizedQuery ||
        forecast.repName.toLowerCase().includes(normalizedQuery) ||
        forecast.repEmail.toLowerCase().includes(normalizedQuery) ||
        formatForecastDate(forecast.periodDate, "MMMM yyyy")
          .toLowerCase()
          .includes(normalizedQuery) ||
        forecast.productForecasts.some(
          (item) =>
            item.productName.toLowerCase().includes(normalizedQuery) ||
            item.doctorName.toLowerCase().includes(normalizedQuery),
        ) ||
        Boolean(forecast.notes?.toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === "all" || statusFilter === status;
      const matchesPeriod =
        periodFilter === "all" || periodFilter === periodKey;
      const matchesTargetType =
        targetTypeFilter === "all" ||
        (forecast.targetType || "DOCTOR") === targetTypeFilter;

      return matchesSearch && matchesStatus && matchesPeriod && matchesTargetType;
    }).sort((a, b) => {
      if (sortBy === "oldest_pending") {
        const aPending = getForecastStatus(a) === "pending" ? 0 : 1;
        const bPending = getForecastStatus(b) === "pending" ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "highest_units") {
        return (
          (b.summary?.totalUnits ?? b.totalUnits) -
          (a.summary?.totalUnits ?? a.totalUnits)
        );
      }
      if (sortBy === "rep_name") {
        return a.repName.localeCompare(b.repName);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [forecasts, periodFilter, searchQuery, sortBy, statusFilter, targetTypeFilter]);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (periodFilter !== "all" ? 1 : 0) +
    (targetTypeFilter !== "all" ? 1 : 0);
  const hasClientFilters = activeFilterCount > 0 || sortBy !== "newest";
  const displayPage = hasClientFilters ? 1 : page;
  const displayTotalCount = hasClientFilters
    ? filteredForecasts.length
    : totalCount || forecasts.length;
  const visibleForecasts = hasClientFilters
    ? filteredForecasts
    : filteredForecasts.slice((displayPage - 1) * limit, displayPage * limit);

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setPeriodFilter("all");
    setTargetTypeFilter("all");
    setSortBy("newest");
  }

  function toggleExpanded(forecastId: string) {
    setExpandedForecasts((current) => {
      const next = new Set(current);

      if (next.has(forecastId)) {
        next.delete(forecastId);
      } else {
        next.add(forecastId);
      }

      return next;
    });
  }

  function openDialog(
    forecastId: string,
    action: "approve" | "reject",
    repName: string,
  ) {
    setDialogState({
      open: true,
      forecastId,
      action,
      repName,
    });
    setFeedback("");
  }

  function closeDialog() {
    setDialogState({
      open: false,
      forecastId: null,
      action: null,
      repName: "",
    });
    setFeedback("");
  }

  async function handleSubmit() {
    if (!dialogState.forecastId || !dialogState.action) {
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateForecastAction(
        dialogState.forecastId,
        dialogState.action === "approve",
        feedback,
      );

      if (result.success) {
        toast.success(
          `Forecast ${
            dialogState.action === "approve" ? "approved" : "rejected"
          } successfully`,
        );
        closeDialog();
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update forecast");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <ForecastPageHeader />
      <ForecastStats
        forecasts={forecasts}
        totalCount={totalCount || forecasts.length}
      />

      <section className="forecast-main-panel forecast-approval-panel-enter overflow-hidden rounded-[18px] border border-[#E5E8EF] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {forecasts.length > 0 && (
          <ForecastToolbar
            showingCount={filteredForecasts.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            statusCounts={statusCounts}
            periodFilter={periodFilter}
            onPeriodFilterChange={setPeriodFilter}
            targetTypeFilter={targetTypeFilter}
            onTargetTypeFilterChange={setTargetTypeFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            periodOptions={periodOptions}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          />
        )}

        {filteredForecasts.length === 0 ? (
          <ForecastEmptyState
            isFiltered={forecasts.length > 0 && hasClientFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <div className="grid gap-4 p-4 sm:p-5">
            {visibleForecasts.map((forecast) => (
              <ManagerForecastCard
                key={forecast.id}
                forecast={forecast}
                isExpanded={expandedForecasts.has(forecast.id)}
                onToggleExpanded={() => toggleExpanded(forecast.id)}
                onOpenDialog={openDialog}
              />
            ))}
          </div>
        )}

        {filteredForecasts.length > 0 && (
          <div className="border-t border-[#E5E8EF] bg-[#FBFCFE] px-4 py-3 sm:px-5">
            <Pagination
              page={displayPage}
              limit={limit}
              totalCount={displayTotalCount}
              itemLabel="forecast requests"
              ariaLabel="Forecast pagination"
              pageNavAriaLabel="Forecast request pages"
            />
          </div>
        )}
      </section>

      <ForecastFooter forecasts={forecasts} />

      <Dialog open={dialogState.open} onOpenChange={closeDialog}>
        <DialogContent className="rounded-[16px] border-0 bg-white shadow-[0_24px_70px_rgba(12,22,42,0.22)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold text-[#182033]">
              {dialogState.action === "approve" ? "Approve" : "Reject"} Forecast
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#667085]">
              Provide feedback for {dialogState.repName}&apos;s forecast
              request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <Label htmlFor="forecast-feedback" className="text-[#344054]">
              Feedback
            </Label>
            <Textarea
              id="forecast-feedback"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder={`Enter your feedback for ${
                dialogState.action === "approve" ? "approval" : "rejection"
              }...`}
              rows={4}
              className="resize-none rounded-[12px] border-[#E5E8EF] focus-visible:ring-[#C9A44C]/20"
            />
          </div>
          <DialogFooter>
            <Button
              className="h-10 cursor-pointer rounded-[10px] border-[#E5E8EF] font-semibold text-[#475467]"
              variant="outline"
              onClick={closeDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={
                dialogState.action === "approve"
                  ? "h-10 cursor-pointer rounded-[10px] border border-[#168557] bg-[#168557] font-semibold text-white hover:bg-white hover:text-[#168557]"
                  : "h-10 cursor-pointer rounded-[10px] border border-[#B42318] bg-[#B42318] font-semibold text-white hover:bg-white hover:text-[#B42318]"
              }
            >
              {isSubmitting
                ? "Processing..."
                : dialogState.action === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
