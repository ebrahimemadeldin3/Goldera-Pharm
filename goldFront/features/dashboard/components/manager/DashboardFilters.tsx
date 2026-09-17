"use client";

import { CalendarDays, RotateCcw, UserRound, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserApiResponse } from "@/features/team/lib/types";
import {
  ALL_TERRITORY_FILTERS,
  TerritoryCoverageFilter,
} from "@/features/geography/components/TerritoryCoverageFilter";
import {
  ALL_FILTER,
  PERIODS,
  formatDateRangeLabel,
} from "./dashboard-utils";
import type { DashboardFilters as DashboardFiltersState, Period } from "./dashboard-types";

type DashboardFiltersProps = {
  filters: DashboardFiltersState;
  asOf: string;
  reps: UserApiResponse[];
  onChange: (filters: DashboardFiltersState) => void;
  onReset: () => void;
};

function chipLabel(key: string, value: string) {
  return `${key}: ${value}`;
}

export function DashboardFilters({
  filters,
  asOf,
  reps,
  onChange,
  onReset,
}: DashboardFiltersProps) {
  const selectedPeriod = PERIODS.find((item) => item.value === filters.period);
  const activeChips = [
    {
      id: "period",
      label: chipLabel(
        "Date",
        filters.period === "custom"
          ? formatDateRangeLabel(filters, asOf)
          : selectedPeriod?.label ?? "This Month",
      ),
      onClear: () => onReset(),
      always: true,
    },
    filters.district !== ALL_FILTER
      ? {
          id: "district",
          label: chipLabel("District", filters.district),
          onClear: () =>
            onChange({
              ...filters,
              district: ALL_FILTER,
              region: ALL_FILTER,
              territory: ALL_FILTER,
            }),
        }
      : null,
    filters.region !== ALL_FILTER
      ? {
          id: "region",
          label: chipLabel("Region", filters.region),
          onClear: () =>
            onChange({
              ...filters,
              region: ALL_FILTER,
              territory: ALL_FILTER,
            }),
        }
      : null,
    filters.territory !== ALL_FILTER
      ? {
          id: "territory",
          label: chipLabel("Territory", filters.territory),
          onClear: () =>
            onChange({
              ...filters,
              territory: ALL_FILTER,
            }),
        }
      : null,
    filters.repId !== ALL_FILTER
      ? {
          id: "rep",
          label: chipLabel(
            "Rep",
            reps.find((rep) => rep.id === filters.repId)?.name ?? "Selected rep",
          ),
          onClear: () => onChange({ ...filters, repId: ALL_FILTER }),
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    onClear: () => void;
    always?: boolean;
  }>;
  const hasActiveFilters = activeChips.some((chip) => !chip.always);

  function updatePeriod(period: Period) {
    onChange({ ...filters, period });
  }

  function updateDistrict(value: string) {
    onChange({
      ...filters,
      district: value,
      region: ALL_TERRITORY_FILTERS,
      territory: ALL_TERRITORY_FILTERS,
    });
  }

  function updateRegion(value: string) {
    onChange({
      ...filters,
      region: value,
      territory: ALL_TERRITORY_FILTERS,
    });
  }

  return (
    <section className="border-gp-border-default bg-white shadow-gp-card rounded-[16px] border p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:grid xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)_minmax(0,260px)] xl:items-start">
          <div>
            <p className="text-gp-navy-900 text-sm font-semibold">
              Dashboard Scope
            </p>
            <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
              {formatDateRangeLabel(filters, asOf)}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
            <Select
              value={filters.period}
              onValueChange={(value) => updatePeriod(value as Period)}
            >
              <SelectTrigger className="border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[12px] bg-white text-sm font-semibold shadow-none focus-visible:ring-3">
                <CalendarDays className="text-gp-gold-600 size-4" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent className="border-gp-border-control shadow-gp-popover bg-white p-1">
                {PERIODS.map((period) => (
                  <SelectItem
                    key={period.value}
                    value={period.value}
                    className="focus:bg-gp-gold-50 rounded-[8px] text-sm font-semibold"
                  >
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.period === "custom" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={filters.customFrom}
                  onChange={(event) =>
                    onChange({ ...filters, customFrom: event.target.value })
                  }
                  className="border-gp-border-default text-gp-navy-900 focus:border-gp-gold-500 focus:ring-gp-gold-500/10 h-11 rounded-[12px] border bg-white px-3 text-sm font-semibold outline-none focus:ring-3"
                  aria-label="Custom range start date"
                />
                <input
                  type="date"
                  value={filters.customTo}
                  onChange={(event) =>
                    onChange({ ...filters, customTo: event.target.value })
                  }
                  className="border-gp-border-default text-gp-navy-900 focus:border-gp-gold-500 focus:ring-gp-gold-500/10 h-11 rounded-[12px] border bg-white px-3 text-sm font-semibold outline-none focus:ring-3"
                  aria-label="Custom range end date"
                />
              </div>
            )}
          </div>

          <Select
            value={filters.repId}
            onValueChange={(value) => onChange({ ...filters, repId: value })}
          >
            <SelectTrigger className="border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[12px] bg-white text-sm font-semibold shadow-none focus-visible:ring-3">
              <UserRound className="text-gp-gold-600 size-4" />
              <SelectValue placeholder="All Medical Reps" />
            </SelectTrigger>
            <SelectContent className="border-gp-border-control shadow-gp-popover bg-white p-1">
              <SelectItem
                value={ALL_FILTER}
                className="focus:bg-gp-gold-50 rounded-[8px] text-sm font-semibold"
              >
                All Medical Reps
              </SelectItem>
              {reps.map((rep) => (
                <SelectItem
                  key={rep.id}
                  value={rep.id}
                  className="focus:bg-gp-gold-50 rounded-[8px] text-sm font-semibold"
                >
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TerritoryCoverageFilter
          district={filters.district}
          region={filters.region}
          territory={filters.territory}
          onDistrictChange={updateDistrict}
          onRegionChange={updateRegion}
          onTerritoryChange={(territory) => onChange({ ...filters, territory })}
          description="Filter dashboard records by district, region and assigned territory where supported"
        />

        <div className="flex flex-col gap-2 border-t border-[#EEF1F5] pt-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-gp-text-muted mr-1 text-xs font-semibold">
              Reporting Scope
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.onClear}
                className="border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900 hover:border-gp-gold-500 hover:bg-white inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                <span className="truncate">{chip.label}</span>
                <X className="text-gp-gold-700 size-3.5 shrink-0" />
              </button>
            ))}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="text-gp-navy-900 hover:bg-gp-gold-50 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
            >
              <RotateCcw className="text-gp-gold-700 size-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
