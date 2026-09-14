"use client";

import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  BriefcaseMedical,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  MapPin,
  RotateCcw,
  Search,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type TabId = "all" | "supervisors" | "reps";

type TabOption = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

const TAB_OPTIONS: TabOption[] = [
  { id: "all", label: "All Reviews", icon: ClipboardList },
  { id: "supervisors", label: "Supervisors", icon: UserCog },
  { id: "reps", label: "Medical Reps", icon: BriefcaseMedical },
];

const SEARCHABLE_LOCATION_THRESHOLD = 6;

type PeriodFilterOption = {
  value: string;
  label: string;
  group: "quick" | "actual";
};

type AppraisalToolbarProps = {
  period: string;
  location: string;
  tab: TabId;
  query: string;
  counts: Record<TabId, number>;
  activeFilterCount: number;
  visibleCount: number;
  totalCount: number;
  periodOptions: PeriodFilterOption[];
  selectedPeriodLabel: string;
  locationOptions: string[];
  selectedLocationLabel: string;
  onChangePeriod: (value: string) => void;
  onChangeLocation: (value: string) => void;
  onChangeTab: (value: TabId) => void;
  onChangeQuery: (value: string) => void;
  onResetFilters: () => void;
};

export function AppraisalToolbar({
  period,
  location,
  tab,
  query,
  counts,
  activeFilterCount,
  visibleCount,
  totalCount,
  periodOptions,
  selectedPeriodLabel,
  locationOptions,
  selectedLocationLabel,
  onChangePeriod,
  onChangeLocation,
  onChangeTab,
  onChangeQuery,
  onResetFilters,
}: AppraisalToolbarProps) {
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    all: null,
    supervisors: null,
    reps: null,
  });

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: TabId,
  ) {
    let nextIndex = TAB_OPTIONS.findIndex((option) => option.id === current);
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TAB_OPTIONS.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (nextIndex + 1) % TAB_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (nextIndex - 1 + TAB_OPTIONS.length) % TAB_OPTIONS.length;
    } else {
      return;
    }
    event.preventDefault();
    const next = TAB_OPTIONS[nextIndex].id;
    onChangeTab(next);
    tabRefs.current[next]?.focus();
  }

  const chips: {
    key: string;
    label: string;
    icon: LucideIcon;
    onRemove: () => void;
  }[] = [];
  if (period !== "all") {
    chips.push({
      key: "period",
      label: selectedPeriodLabel,
      icon: CalendarDays,
      onRemove: () => onChangePeriod("all"),
    });
  }
  if (location !== "all") {
    chips.push({
      key: "location",
      label: selectedLocationLabel,
      icon: MapPin,
      onRemove: () => onChangeLocation("all"),
    });
  }
  if (tab !== "all") {
    const tabLabel = TAB_OPTIONS.find((option) => option.id === tab)?.label;
    chips.push({
      key: "tab",
      label: tabLabel ?? "Filter",
      icon: tab === "supervisors" ? UserCog : Users,
      onRemove: () => onChangeTab("all"),
    });
  }
  if (query.trim().length > 0) {
    chips.push({
      key: "query",
      label: query.trim(),
      icon: Search,
      onRemove: () => onChangeQuery(""),
    });
  }

  const selectBase =
    "plans-filter-control h-11 w-full cursor-pointer rounded-[12px] border bg-white px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color] duration-[150ms] focus-visible:border-gp-gold-500 focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 [&>svg:last-child]:text-gp-text-placeholder";
  const selectInactive =
    "border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover";
  const selectActive =
    "border-gp-gold-500 bg-gp-surface-hover text-gp-navy-900";
  const selectContent =
    "plans-select-content border-gp-border-control max-h-80 bg-white p-0 shadow-gp-popover [&>div:not([data-slot])]:p-1";
  const selectItem =
    "min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900";
  const allSelectItem =
    "h-10 cursor-pointer rounded-[8px] py-0 pr-8 pl-2 text-sm font-semibold text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900";
  const actualPeriodGroups = periodOptions
    .filter((option) => option.group === "actual")
    .reduce<Record<string, PeriodFilterOption[]>>((groups, option) => {
      const year = option.label.match(/\b\d{4}\b/)?.[0] ?? "Other";
      groups[year] = [...(groups[year] ?? []), option];
      return groups;
    }, {});
  const useSearchableLocation =
    locationOptions.length > SEARCHABLE_LOCATION_THRESHOLD;
  const filteredLocationOptions = useMemo(() => {
    const normalizedSearch = locationSearch.trim().toLowerCase();
    if (!normalizedSearch) return locationOptions;
    return locationOptions.filter((locationOption) =>
      locationOption.toLowerCase().includes(normalizedSearch),
    );
  }, [locationOptions, locationSearch]);

  function chooseLocation(value: string) {
    onChangeLocation(value);
    setLocationPopoverOpen(false);
    setLocationSearch("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-gp-navy-900 text-lg font-semibold">
          Performance Reviews
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-gp-text-muted text-sm font-medium">
            Review and manage employee appraisals.
          </p>
          <p
            key={`${tab}-${visibleCount}-${query}`}
            className="appraisal-count-refresh text-gp-text-muted text-xs font-semibold"
            aria-live="polite"
          >
            {activeFilterCount > 0
              ? `Showing ${visibleCount} of ${totalCount} ${
                  totalCount === 1 ? "review" : "reviews"
                }`
              : `${totalCount} ${totalCount === 1 ? "review" : "reviews"}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="appraisal-tabs-scroll max-w-full overflow-x-auto overscroll-x-contain pb-0.5">
          <div
            role="tablist"
            aria-label="Filter appraisals by employee role"
            className="appraisal-tablist border-gp-border-control bg-gp-surface-control grid h-auto min-w-[420px] grid-cols-3 rounded-[12px] border p-1"
          >
            {TAB_OPTIONS.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = tab === option.id;
              return (
                <button
                  key={option.id}
                  ref={(element) => {
                    tabRefs.current[option.id] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`appraisal-tab-${option.id}`}
                  aria-selected={isSelected}
                  aria-controls="appraisal-results-panel"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => onChangeTab(option.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, option.id)}
                  className={cn(
                    "appraisal-tab focus-visible:ring-gp-gold-500/25 relative flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm",
                    isSelected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                      : "text-gp-text-muted hover:text-gp-navy-900 hover:bg-gp-navy-900/5 border border-transparent",
                  )}
                >
                  <OptionIcon
                    className={cn(
                      "hidden size-3.5 shrink-0 sm:block",
                      isSelected && "text-gp-gold-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                  <span
                    className={cn(
                      "appraisal-tab-count inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[190ms]",
                      isSelected
                        ? "text-gp-gold-500 bg-white/10"
                        : "text-gp-text-muted border-gp-border-subtle bg-gp-surface-subtle",
                    )}
                  >
                    {counts[option.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:items-center lg:grid-cols-[minmax(0,220px)_minmax(0,240px)_minmax(280px,1fr)]">
          <Select value={period} onValueChange={onChangePeriod}>
            <SelectTrigger
              aria-label="Filter by review period"
              title={
                period !== "all"
                  ? `Period: ${selectedPeriodLabel}`
                  : "All Periods"
              }
              className={cn(
                selectBase,
                period !== "all" ? selectActive : selectInactive,
              )}
            >
              <CalendarDays
                className="text-gp-gold-600 size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-left">
                {selectedPeriodLabel}
              </span>
            </SelectTrigger>
            <SelectContent className={selectContent}>
              <SelectGroup>
                <SelectLabel className="text-gp-text-muted px-2 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase">
                  Quick Filters
                </SelectLabel>
                {periodOptions
                  .filter((option) => option.group === "quick")
                  .map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={
                        option.value === "all" ? allSelectItem : selectItem
                      }
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CalendarDays
                          className="text-gp-gold-600 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectGroup>
              {Object.entries(actualPeriodGroups).map(([year, options]) => (
                <SelectGroup key={year}>
                  <SelectSeparator className="bg-gp-border-subtle" />
                  <SelectLabel className="text-gp-text-muted px-2 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase">
                    {year}
                  </SelectLabel>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={selectItem}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <CalendarDays
                          className="text-gp-gold-600 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          {useSearchableLocation ? (
            <Popover
              open={locationPopoverOpen}
              onOpenChange={setLocationPopoverOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Filter by location"
                  aria-haspopup="listbox"
                  aria-expanded={locationPopoverOpen}
                  title={
                    location !== "all"
                      ? `Location: ${selectedLocationLabel}`
                      : "All Locations"
                  }
                  className={cn(
                    selectBase,
                    "flex items-center justify-between gap-2",
                    location !== "all" ? selectActive : selectInactive,
                  )}
                >
                  <MapPin
                    className="text-gp-gold-600 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {selectedLocationLabel}
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-gp-text-placeholder size-4 shrink-0 transition-transform duration-[150ms]",
                      locationPopoverOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="plans-select-content border-gp-border-control w-[var(--radix-popover-trigger-width)] overflow-hidden bg-white p-0 shadow-gp-popover"
              >
                <div className="border-gp-border-subtle bg-gp-surface-control flex h-11 items-center gap-2 border-b px-3">
                  <Search
                    className="text-gp-text-placeholder size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={locationSearch}
                    onChange={(event) => setLocationSearch(event.target.value)}
                    placeholder="Search location..."
                    aria-label="Search locations"
                    className="text-gp-navy-900 placeholder:text-gp-text-placeholder h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
                  />
                </div>
                <div
                  role="listbox"
                  aria-label="Location options"
                  className="max-h-64 overflow-y-auto p-1"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={location === "all"}
                    onClick={() => chooseLocation("all")}
                    className={cn(
                      "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[8px] px-2 text-left text-sm font-semibold transition-colors duration-[120ms] hover:bg-gp-surface-control focus:bg-gp-gold-50 focus:outline-none",
                      location === "all"
                        ? "bg-gp-gold-50 text-gp-navy-900"
                        : "text-gp-text-secondary",
                    )}
                  >
                    <MapPin
                      className="text-gp-gold-600 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      All Locations
                    </span>
                    {location === "all" && (
                      <Check
                        className="text-gp-gold-600 size-4 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {filteredLocationOptions.length > 0 ? (
                    filteredLocationOptions.map((locationOption) => (
                      <button
                        key={locationOption}
                        type="button"
                        role="option"
                        aria-selected={location === locationOption}
                        onClick={() => chooseLocation(locationOption)}
                        className={cn(
                          "flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[8px] px-2 text-left text-sm font-semibold transition-colors duration-[120ms] hover:bg-gp-surface-control focus:bg-gp-gold-50 focus:outline-none",
                          location === locationOption
                            ? "bg-gp-gold-50 text-gp-navy-900"
                            : "text-gp-navy-900",
                        )}
                      >
                        <MapPin
                          className="text-gp-gold-600 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {locationOption}
                        </span>
                        {location === locationOption && (
                          <Check
                            className="text-gp-gold-600 size-4 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-gp-text-muted px-3 py-4 text-center text-sm font-medium">
                      No locations found
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Select value={location} onValueChange={onChangeLocation}>
              <SelectTrigger
                aria-label="Filter by location"
                title={
                  location !== "all"
                    ? `Location: ${selectedLocationLabel}`
                    : "All Locations"
                }
                className={cn(
                  selectBase,
                  location !== "all" ? selectActive : selectInactive,
                )}
              >
                <MapPin
                  className="text-gp-gold-600 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-left">
                  {selectedLocationLabel}
                </span>
              </SelectTrigger>
              <SelectContent className={selectContent}>
                <SelectGroup>
                  <SelectLabel className="text-gp-text-muted px-2 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase">
                    Location
                  </SelectLabel>
                  <SelectItem value="all" className={allSelectItem}>
                    <span className="flex min-w-0 items-center gap-2">
                      <MapPin
                        className="text-gp-gold-600 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">All Locations</span>
                    </span>
                  </SelectItem>
                  {locationOptions.map((locationOption) => (
                    <SelectItem
                      key={locationOption}
                      value={locationOption}
                      className={selectItem}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <MapPin
                          className="text-gp-gold-600 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{locationOption}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}

          <div className="appraisal-search-field relative w-full max-w-full sm:col-span-2 lg:col-span-1">
            <Search
              className="appraisal-search-icon text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => onChangeQuery(event.target.value)}
              className="appraisal-search-input border-gp-border-control bg-white text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 w-full rounded-[12px] pr-10 pl-10 text-sm font-medium shadow-none"
              placeholder="Search employee, reviewer, location..."
              aria-label="Search employee, reviewer, location, email, or period"
            />
            {query && (
              <button
                type="button"
                onClick={() => onChangeQuery("")}
                aria-label="Clear appraisal search"
                title="Clear search"
                className="appraisal-search-clear text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div
          aria-label="Active filters"
          className="flex flex-wrap items-center gap-2"
        >
          {chips.map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove ${chip.label} filter`}
                title="Remove filter"
                className="plans-filter-chip group inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-[#E8D29B] bg-[#FFF9EA] px-3 text-xs font-semibold text-[#7D5A12] transition-[background-color,border-color,color,transform] duration-[160ms] hover:border-gp-gold-500 hover:bg-gp-gold-50 focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 focus-visible:outline-none"
              >
                <ChipIcon
                  className="text-gp-navy-900 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="max-w-48 truncate">{chip.label}</span>
                <X
                  className="text-gp-gold-700 size-3 shrink-0"
                  aria-hidden="true"
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetFilters}
            className="appraisal-btn border-gp-border-control bg-white text-gp-navy-900 hover:border-gp-danger-border hover:bg-gp-danger-soft hover:text-gp-danger focus-visible:ring-gp-gold-500/25 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
