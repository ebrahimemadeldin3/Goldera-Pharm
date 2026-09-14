"use client";

import { useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { BadgeCheck, Filter, RotateCcw, Search, Shapes, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUS_TABS, type StatusTabId } from "./requests-workflow-utils";

type ToolbarCounts = {
  all: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
};

type RequestsToolbarProps = {
  status: StatusTabId;
  onStatusChange: (value: StatusTabId) => void;
  counts: ToolbarCounts;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  visibleCount: number;
  onResetFilters: () => void;
};

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "EXPENSE", label: "Expense" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SAMPLE", label: "Sample" },
  { value: "LEAVE", label: "Leave" },
  { value: "PERSONAL_EXPENSE", label: "Personal Expense" },
];

const statusOptions: { value: StatusTabId; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function RequestsToolbar({
  status,
  onStatusChange,
  counts,
  typeFilter,
  onTypeChange,
  searchQuery,
  onSearchChange,
  visibleCount,
  onResetFilters,
}: RequestsToolbarProps) {
  const tabRefs = useRef<Record<StatusTabId, HTMLButtonElement | null>>({
    all: null,
    PENDING: null,
    APPROVED: null,
    REJECTED: null,
  });

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: StatusTabId,
  ) {
    let nextIndex = STATUS_TABS.findIndex((tab) => tab.id === current);
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = STATUS_TABS.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (nextIndex + 1) % STATUS_TABS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (nextIndex - 1 + STATUS_TABS.length) % STATUS_TABS.length;
    } else {
      return;
    }
    event.preventDefault();
    const next = STATUS_TABS[nextIndex].id;
    onStatusChange(next);
    tabRefs.current[next]?.focus();
  }

  const inactiveCountTone: Record<StatusTabId, string> = {
    all: "text-gp-gold-700 border-gp-gold-300 bg-gp-gold-50",
    PENDING: "text-gp-warning border-gp-warning-border bg-gp-warning-soft",
    APPROVED: "text-gp-success border-gp-success-border bg-gp-success-soft",
    REJECTED: "text-gp-danger border-gp-danger-border bg-gp-danger-soft",
  };
  const hasActiveFilters =
    status !== "all" || typeFilter !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <h2 className="text-gp-navy-900 text-lg font-semibold">
            All Requests
          </h2>
          <p
            key={`${status}-${visibleCount}-${searchQuery}`}
            className="requests-count-refresh text-gp-text-muted mt-0.5 text-sm font-medium"
            aria-live="polite"
          >
            {visibleCount === 0
              ? "No requests on this page"
              : `${visibleCount} ${
                  visibleCount === 1 ? "request" : "requests"
                } shown on this page`}
          </p>
        </div>

        <div className="requests-tabs-scroll max-w-full overflow-x-auto overscroll-x-contain pb-0.5 lg:self-center">
          <div
            role="tablist"
            aria-label="Filter requests by status"
            className="requests-tablist border-gp-border-control bg-gp-surface-control grid h-auto min-w-[560px] grid-cols-4 rounded-[12px] border p-1 sm:min-w-[580px] lg:min-w-[520px]"
          >
            {STATUS_TABS.map((tabOption) => {
              const TabIcon = tabOption.icon;
              const isSelected = status === tabOption.id;
              const label = tabOption.id === "all" ? "All" : tabOption.label;

              return (
                <button
                  key={tabOption.id}
                  ref={(element) => {
                    tabRefs.current[tabOption.id] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`requests-status-tab-${tabOption.id}`}
                  aria-selected={isSelected}
                  aria-controls="requests-results-panel"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => onStatusChange(tabOption.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, tabOption.id)}
                  className={cn(
                    "requests-tab focus-visible:ring-gp-gold-500/25 relative flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm",
                    isSelected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                      : "text-gp-text-muted hover:text-gp-navy-900 hover:bg-gp-navy-900/5 border border-transparent",
                  )}
                >
                  <TabIcon
                    className={cn(
                      "hidden size-3.5 shrink-0 sm:block",
                      isSelected && "text-gp-gold-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{label}</span>
                  <span
                    className={cn(
                      "requests-tab-count inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[190ms]",
                      isSelected
                        ? "text-gp-gold-500 bg-white/10"
                        : inactiveCountTone[tabOption.id],
                    )}
                  >
                    {counts[tabOption.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="requests-search-field relative w-full max-w-full lg:ml-auto lg:max-w-md">
          <Search
            className="requests-search-icon text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="requests-search-input border-gp-border-control bg-gp-surface-card text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 w-full rounded-[10px] pr-10 pl-10 text-sm font-medium shadow-none lg:h-10"
            placeholder="Search requests..."
            aria-label="Search requests"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear request search"
              title="Clear search"
              className="requests-search-clear text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="requests-select-trigger data-placeholder:text-gp-text-placeholder border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:border-gp-gold-500 h-11 w-full cursor-pointer px-3 text-sm font-semibold shadow-none transition-[border-color,box-shadow,background-color] duration-[170ms] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 sm:w-44 lg:h-10">
            <Shapes className="text-gp-gold-600 size-4" aria-hidden="true" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="requests-select-content border-gp-border-control bg-white p-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)] [&>div:not([data-slot])]:p-1">
            {typeOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gp-text-secondary focus:text-gp-gold-700 data-[state=checked]:text-gp-gold-700 h-8 cursor-pointer rounded-md py-0 pr-2 pl-7 text-sm font-medium focus:bg-[#FBF7EA]"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) => onStatusChange(value as StatusTabId)}
        >
          <SelectTrigger className="requests-select-trigger data-placeholder:text-gp-text-placeholder border-gp-border-control bg-gp-surface-card text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover focus-visible:border-gp-gold-500 h-11 w-full cursor-pointer px-3 text-sm font-semibold shadow-none transition-[border-color,box-shadow,background-color] duration-[170ms] focus-visible:ring-3 focus-visible:ring-[#C9A44C]/15 sm:w-44 lg:h-10">
            <BadgeCheck
              className="text-gp-gold-600 size-4"
              aria-hidden="true"
            />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="requests-select-content border-gp-border-control bg-white p-0 shadow-[0_10px_24px_rgba(15,23,42,0.12)] [&>div:not([data-slot])]:p-1">
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gp-text-secondary focus:text-gp-gold-700 data-[state=checked]:text-gp-gold-700 h-8 cursor-pointer rounded-md py-0 pr-2 pl-7 text-sm font-medium focus:bg-[#FBF7EA]"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-gp-text-muted hidden items-center gap-1.5 text-xs font-semibold xl:inline-flex">
          <Filter className="size-3.5" aria-hidden="true" />
          Type / Status
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="requests-btn border-gp-border-control bg-gp-surface-card text-gp-text-secondary hover:border-gp-gold-300 hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-3 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none sm:w-auto lg:h-10"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
