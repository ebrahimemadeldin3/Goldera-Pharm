"use client";

import type { ReactNode } from "react";
import {
  ChevronRight,
  Layers3,
  MapPin,
  MapPinned,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  KSA_TERRITORY_STRUCTURE,
  getRegionOptionsForDistrict,
  getTerritoryOptionsForRegion,
} from "@/features/plan/lib/territory";

export const ALL_TERRITORY_FILTERS = "all";

type TerritoryCoverageFilterProps = {
  district: string;
  region: string;
  territory: string;
  onDistrictChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onTerritoryChange: (value: string) => void;
  className?: string;
  description?: string;
};

function compactDistrictLabel(value: string) {
  if (value === ALL_TERRITORY_FILTERS) return "All Districts";
  return value.replace(" District", "");
}

export function compactRegionLabel(value: string) {
  if (value === ALL_TERRITORY_FILTERS) return "All Regions";
  return value.replace(" Region", "");
}

export function compactTerritoryLabel(value: string) {
  if (value === ALL_TERRITORY_FILTERS) return "All Territories";
  return value;
}

function FilterSelect({
  value,
  onValueChange,
  icon: Icon,
  label,
  displayValue,
  children,
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  icon: LucideIcon;
  label: string;
  displayValue: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  const isSelected = value !== ALL_TERRITORY_FILTERS;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        title={`${label}: ${displayValue}`}
        className={cn(
          "plans-filter-control focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 [&>svg:last-child]:text-gp-text-placeholder h-11 w-full cursor-pointer rounded-[12px] border bg-white px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color] duration-[150ms] focus-visible:ring-3",
          isSelected
            ? "border-gp-gold-500 bg-gp-surface-hover text-gp-navy-900"
            : "border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover",
          disabled &&
            "border-gp-border-subtle bg-gp-surface-subtle text-gp-text-placeholder hover:border-gp-border-subtle hover:bg-gp-surface-subtle cursor-not-allowed",
        )}
      >
        <Icon className="text-gp-gold-600 size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">
          {displayValue}
        </span>
      </SelectTrigger>
      <SelectContent className="plans-select-content border-gp-border-control shadow-gp-popover max-h-[300px] bg-white p-1">
        {children}
      </SelectContent>
    </Select>
  );
}

function FilterOption({
  value,
  label,
  helper,
  icon: Icon,
}: {
  value: string;
  label: string;
  helper?: string;
  icon: LucideIcon;
}) {
  return (
    <SelectItem
      value={value}
      className="text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900 min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold"
    >
      <span className="flex min-w-0 items-start gap-2">
        <Icon
          className="text-gp-gold-600 mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="block truncate">{label}</span>
          {helper && (
            <span className="text-gp-text-muted mt-0.5 block truncate text-[11px] font-medium">
              {helper}
            </span>
          )}
        </span>
      </span>
    </SelectItem>
  );
}

export function TerritoryCoverageFilter({
  district,
  region,
  territory,
  onDistrictChange,
  onRegionChange,
  onTerritoryChange,
  className,
  description = "Filter employees by district, region and assigned territory",
}: TerritoryCoverageFilterProps) {
  const regionOptions = getRegionOptionsForDistrict(district);
  const territoryOptions =
    region === ALL_TERRITORY_FILTERS ? [] : getTerritoryOptionsForRegion(region);

  return (
    <div
      className={cn(
        "border-gp-border-default w-full rounded-[14px] border bg-[#F9FAFB] p-3",
        className,
      )}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span className="bg-gp-gold-50 text-gp-gold-700 flex size-7 shrink-0 items-center justify-center rounded-[8px]">
          <MapPinned className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-gp-navy-900 text-sm font-semibold">
            Territory Coverage
          </p>
          <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
            {description}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        <FilterSelect
          value={district}
          onValueChange={onDistrictChange}
          icon={Layers3}
          label="District"
          displayValue={compactDistrictLabel(district)}
        >
          <FilterOption
            value={ALL_TERRITORY_FILTERS}
            label="All Districts"
            icon={Layers3}
          />
          {KSA_TERRITORY_STRUCTURE.map((item) => (
            <FilterOption
              key={item.name}
              value={item.name}
              label={item.name}
              icon={Layers3}
            />
          ))}
        </FilterSelect>
        <ChevronRight
          className="text-gp-gold-500/75 hidden size-4 lg:block"
          aria-hidden="true"
        />
        <FilterSelect
          value={region}
          onValueChange={onRegionChange}
          icon={MapPinned}
          label="Region"
          displayValue={compactRegionLabel(region)}
        >
          <FilterOption
            value={ALL_TERRITORY_FILTERS}
            label="All Regions"
            icon={MapPinned}
          />
          {regionOptions.map((item) => (
            <FilterOption
              key={item.name}
              value={item.name}
              label={item.name}
              icon={MapPinned}
              helper={district === ALL_TERRITORY_FILTERS ? undefined : district}
            />
          ))}
        </FilterSelect>
        <ChevronRight
          className="text-gp-gold-500/75 hidden size-4 lg:block"
          aria-hidden="true"
        />
        <FilterSelect
          value={region === ALL_TERRITORY_FILTERS ? ALL_TERRITORY_FILTERS : territory}
          onValueChange={onTerritoryChange}
          icon={MapPin}
          label="Territory"
          displayValue={
            region === ALL_TERRITORY_FILTERS
              ? "Select a region first"
              : compactTerritoryLabel(territory)
          }
          disabled={region === ALL_TERRITORY_FILTERS}
        >
          <FilterOption
            value={ALL_TERRITORY_FILTERS}
            label="All Territories"
            icon={MapPin}
          />
          {territoryOptions.map((item) => (
            <FilterOption
              key={item.name}
              value={item.name}
              label={item.name}
              helper={region}
              icon={MapPin}
            />
          ))}
        </FilterSelect>
      </div>
    </div>
  );
}
