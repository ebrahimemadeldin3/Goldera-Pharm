"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronUp,
  CircleX,
  Clock3,
  FileText,
  Inbox,
  Package,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

type ForecastStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | ForecastStatus;

type ForecastApprovalCenterProps = {
  forecasts: ForecastManagement[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const statusMeta: Record<
  ForecastStatus,
  {
    label: string;
    badgeClassName: string;
    icon: LucideIcon;
  }
> = {
  pending: {
    label: "Pending Review",
    badgeClassName: "border-[#F5DFAC] bg-[#FFF8E5] text-[#8A6515]",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    badgeClassName: "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    badgeClassName: "border-[#F5C9C5] bg-[#FFF1F0] text-[#B42318]",
    icon: CircleX,
  },
};

function getForecastStatus(forecast: ForecastManagement): ForecastStatus {
  if (forecast.isApproved) {
    return "approved";
  }

  return forecast.supervisorFeedback?.trim() ? "rejected" : "pending";
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
          Forecast Management
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[30px] leading-tight font-semibold text-[#182033] md:text-[34px]">
            Forecast Requests
          </h1>
          <p className="mt-2 max-w-[720px] text-sm leading-6 font-medium text-[#667085] md:text-base">
            Review, evaluate and manage product forecast submissions from your
            medical representatives.
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
  tone,
  delay,
}: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: "navy" | "gold" | "green" | "red";
  delay: string;
}) {
  const toneClassName = {
    navy: "bg-[#EDF4FF] text-[#3972D5]",
    gold: "bg-[#FFF3D7] text-[#B18732]",
    green: "bg-[#E9F8F1] text-[#168557]",
    red: "bg-[#FFF1F0] text-[#B42318]",
  }[tone];

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
        tone="navy"
        delay="80ms"
      />
      <ForecastKpiCard
        label="Pending Review"
        value={counts.pending}
        helper="Awaiting your decision"
        icon={Clock3}
        tone="gold"
        delay="150ms"
      />
      <ForecastKpiCard
        label="Approved"
        value={counts.approved}
        helper="Approved forecasts"
        icon={CheckCircle2}
        tone="green"
        delay="220ms"
      />
      <ForecastKpiCard
        label="Rejected"
        value={counts.rejected}
        helper="Rejected forecasts"
        icon={CircleX}
        tone="red"
        delay="290ms"
      />
    </section>
  );
}

function ForecastStatusBadge({ status }: { status: ForecastStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.badgeClassName}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function ForecastToolbar({
  showingCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  periodFilter,
  onPeriodFilterChange,
  periodOptions,
  activeFilterCount,
  onClearFilters,
}: {
  showingCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  statusOptions: ForecastStatus[];
  periodFilter: string;
  onPeriodFilterChange: (value: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  activeFilterCount: number;
  onClearFilters: () => void;
}) {
  return (
    <div className="forecast-panel-toolbar flex flex-col gap-3 border-b border-[#E5E8EF] bg-[#FBFCFE] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-base font-semibold text-[#182033]">
          Forecast Requests
        </h2>
        <p className="mt-1 text-sm font-medium text-[#8A94A6]">
          Showing {numberFormatter.format(showingCount)} requests
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_170px] lg:w-[620px]">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8A94A6]"
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

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as StatusFilter)}
        >
          <SelectTrigger className="forecast-select-trigger h-11 rounded-[12px] border-[#E5E8EF] bg-white text-sm font-semibold text-[#4B5568]">
            <span className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#8A94A6]" />
              <SelectValue placeholder="Status" />
              {activeFilterCount > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9A44C] px-1.5 text-[11px] font-bold text-[#182033]">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </SelectTrigger>
          <SelectContent className="forecast-select-content rounded-[12px] border-[#E5E8EF] bg-white shadow-[0_16px_34px_rgba(16,24,40,0.14)]">
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {statusMeta[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={onPeriodFilterChange}>
          <SelectTrigger className="forecast-select-trigger h-11 rounded-[12px] border-[#E5E8EF] bg-white text-sm font-semibold text-[#4B5568]">
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="size-4 text-[#8A94A6]" />
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
      </div>
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-fit rounded-full px-2.5 py-1 text-xs font-bold text-[#9A7628] transition-[background-color,color] hover:bg-[#FFF8E5] hover:text-[#182033] lg:hidden"
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
        <span className="absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full border border-[#CBEFDD] bg-white text-[#168557] shadow-[0_8px_22px_rgba(16,24,40,0.12)]">
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
          className="mt-4 rounded-[10px] border border-[#C9A44C] bg-[#C9A44C] px-4 py-2 text-sm font-bold text-[#182033] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#D7B861]"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function ForecastRequestCard({
  forecast,
  isExpanded,
  onToggleExpanded,
  onOpenDialog,
}: {
  forecast: ForecastManagement;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenDialog: (
    forecastId: string,
    action: "approve" | "reject",
    repName: string,
  ) => void;
}) {
  const status = getForecastStatus(forecast);
  const periodLabel = formatForecastDate(forecast.periodDate, "MMMM yyyy");
  const submittedLabel = formatForecastDate(forecast.createdAt, "MMM d, yyyy");
  const submittedTime = formatForecastDate(forecast.createdAt, "h:mm a");
  const initials = getInitials(forecast.repName) || "MR";

  return (
    <article className="forecast-request-card rounded-[16px] border border-[#E5E8EF] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#E5E8EF] bg-[#F4F6FA] text-sm font-bold text-[#182033]">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-[#182033]">
                {forecast.repName}
              </h3>
              <ForecastStatusBadge status={status} />
            </div>
            <p className="mt-1 text-sm font-medium text-[#8A94A6]">
              Medical Representative
            </p>
            <p className="mt-1 truncate text-xs font-medium text-[#98A2B3]">
              {forecast.repEmail}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="forecast-review-button inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#E5E8EF] bg-white px-4 text-sm font-bold text-[#182033] transition-[background-color,border-color,color,transform] hover:border-[#C9A44C] hover:bg-[#FFF8E5] hover:text-[#8A6515] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 focus-visible:outline-none lg:ml-auto"
          aria-expanded={isExpanded}
        >
          Review Forecast
          {isExpanded ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ArrowRight
              className="forecast-review-arrow size-4"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.04em] text-[#8A94A6] uppercase">
            <CalendarDays className="size-4 text-[#B18732]" />
            Forecast Period
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#182033]">
            {periodLabel}
          </dd>
        </div>
        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.04em] text-[#8A94A6] uppercase">
            <Package className="size-4 text-[#3972D5]" />
            Products
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#182033]">
            {forecast.totalProducts}{" "}
            {forecast.totalProducts === 1 ? "Product" : "Products"}
          </dd>
        </div>
        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.04em] text-[#8A94A6] uppercase">
            <Users className="size-4 text-[#168557]" />
            Doctors Covered
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#182033]">
            {forecast.totalDoctors}{" "}
            {forecast.totalDoctors === 1 ? "Doctor" : "Doctors"}
          </dd>
        </div>
        <div className="rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3">
          <dt className="flex items-center gap-2 text-xs font-bold tracking-[0.04em] text-[#8A94A6] uppercase">
            <TrendingUp className="size-4 text-[#B18732]" />
            Total Units
          </dt>
          <dd className="mt-2 text-sm font-semibold text-[#182033]">
            {numberFormatter.format(forecast.totalUnits)} Units
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs font-medium text-[#8A94A6]">
        Submitted {submittedLabel} - {submittedTime}
      </p>

      {isExpanded && (
        <div className="forecast-card-details mt-5 border-t border-[#EEF1F5] pt-5">
          {forecast.notes && (
            <div className="mb-4 rounded-[12px] border border-[#F5DFAC] bg-[#FFF8E5] p-4">
              <p className="text-sm leading-5 font-semibold text-[#8A6515]">
                Rep Notes
              </p>
              <p className="mt-1 text-sm leading-6 font-medium text-[#6F5A20]">
                {forecast.notes}
              </p>
            </div>
          )}

          {forecast.supervisorFeedback && (
            <div className="mb-4 rounded-[12px] border border-[#CBEFDD] bg-[#E9F8F1] p-4">
              <p className="text-sm leading-5 font-semibold text-[#168557]">
                Supervisor Feedback
              </p>
              <p className="mt-1 text-sm leading-6 font-medium text-[#196744]">
                {forecast.supervisorFeedback}
              </p>
            </div>
          )}

          {forecast.productForecasts.length > 0 && (
            <>
              <p className="mb-3 text-sm font-semibold text-[#182033]">
                Product Distribution Details
              </p>
              <div className="grid gap-2">
                {forecast.productForecasts.map((pf, index) => (
                  <div
                    key={`${forecast.id}-${pf.productName}-${pf.doctorName}-${index}`}
                    className="grid gap-3 rounded-[12px] border border-[#EEF1F5] bg-[#FBFCFE] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#182033]">
                        {pf.productName}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-[#8A94A6]">
                        {pf.doctorName}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#182033]">
                      {numberFormatter.format(pf.productUnits)} units
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {!forecast.isApproved && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                onClick={() =>
                  onOpenDialog(forecast.id, "approve", forecast.repName)
                }
                className="h-11 cursor-pointer rounded-[10px] border border-[#168557] bg-[#168557] font-bold text-white transition-[background-color,color] hover:bg-white hover:text-[#168557]"
              >
                <CheckCircle2 className="mr-2 size-4" />
                Approve
              </Button>
              <Button
                onClick={() =>
                  onOpenDialog(forecast.id, "reject", forecast.repName)
                }
                variant="outline"
                className="h-11 cursor-pointer rounded-[10px] border-[#B42318] font-bold text-[#B42318] transition-[background-color,color] hover:bg-[#B42318] hover:text-white"
              >
                <CircleX className="mr-2 size-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
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
  const [expandedForecasts, setExpandedForecasts] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState("all");
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

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(forecasts.map(getForecastStatus))).sort((a, b) =>
        statusMeta[a].label.localeCompare(statusMeta[b].label),
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

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [forecasts, periodFilter, searchQuery, statusFilter]);

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (periodFilter !== "all" ? 1 : 0);
  const hasClientFilters = activeFilterCount > 0;
  const displayPage = hasClientFilters ? 1 : page;
  const displayTotalCount = hasClientFilters
    ? filteredForecasts.length
    : totalCount || forecasts.length;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setPeriodFilter("all");
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
            statusOptions={statusOptions}
            periodFilter={periodFilter}
            onPeriodFilterChange={setPeriodFilter}
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
          <div className="grid gap-3 p-4 sm:p-5">
            {filteredForecasts.map((forecast) => (
              <ForecastRequestCard
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
