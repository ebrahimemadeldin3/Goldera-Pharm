"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowUpDown,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  Layers3,
  MapPin,
  MapPinned,
  Search,
  SlidersHorizontal,
  Stethoscope,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DoctorCard from "./DoctorCard";
import type { DoctorApiResponse } from "../lib/types/api";
import {
  normalizeDoctorForDirectory,
  type DoctorDirectoryData,
} from "../lib/utils/mappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import {
  KSA_TERRITORY_STRUCTURE,
  UNASSIGNED_DISTRICT,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";

interface DoctorsListProps {
  doctors?: DoctorApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
  selectedSubRegion?: string;
}

type SortKey = "newest" | "nameAsc" | "nameDesc" | "specialtyAsc";
type ControlOption = {
  value: string;
  label: string;
  helper?: string;
};

const ALL = "all";
const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Recently Added" },
  { value: "nameAsc", label: "Name A-Z" },
  { value: "nameDesc", label: "Name Z-A" },
  { value: "specialtyAsc", label: "Specialty A-Z" },
];
const businessRegions = KSA_TERRITORY_STRUCTURE.flatMap(
  (district) => district.regions,
);

function isClean(value?: string | null): value is string {
  return Boolean(
    value &&
    typeof value === "string" &&
    value.trim() !== "" &&
    !value.toLowerCase().includes("undefined") &&
    !value.toLowerCase().includes("null"),
  );
}

function uniqueSorted(values: Array<string | null | undefined>) {
  const labelsByValue = new Map<string, string>();

  values.filter(isClean).forEach((value) => {
    const label = value.trim().replace(/\s+/g, " ");
    const canonicalValue = normalizeFilterValue(label);

    if (!labelsByValue.has(canonicalValue)) {
      labelsByValue.set(canonicalValue, label);
    }
  });

  return Array.from(labelsByValue.values()).sort((a, b) => a.localeCompare(b));
}

function normalizeFilterValue(value?: string | null) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}

function includesNormalized(value: string | null | undefined, query: string) {
  return normalizeFilterValue(value).includes(query);
}

function dateValue(value?: string) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDisplayName(row: DoctorDirectoryData) {
  return row.nameEN || row.nameAR || "Unnamed Doctor";
}

function getCompactDistrictLabel(value: string) {
  if (value === ALL) return "All Districts";
  return value.replace(" District", "");
}

function getCompactRegionLabel(value: string) {
  if (value === ALL) return "All Regions";
  return value.replace(" Region", "");
}

function getCompactTerritoryLabel(value: string, useManagerLabel = false) {
  if (value === ALL) return "All Territories";
  return useManagerLabel && value === "Southern" ? "Southern Area" : value;
}

function getBusinessRegionOptions(rows: DoctorDirectoryData[]): ControlOption[] {
  return businessRegions.map((region) => {
    const matchingTerritoryCount = new Set(
      rows
        .filter((row) => row.territory.region === region.name)
        .map((row) => row.territory.territory),
    ).size;

    return {
      value: region.name,
      label: region.name,
      helper:
        matchingTerritoryCount > 0
          ? `${matchingTerritoryCount} ${
              matchingTerritoryCount === 1 ? "territory" : "territories"
            } loaded`
          : `${region.territories.length} ${
              region.territories.length === 1 ? "territory" : "territories"
            }`,
    };
  });
}

function getBusinessTerritoryOptions(regionName: string): ControlOption[] {
  if (regionName === ALL) return [];

  const region = businessRegions.find((item) => item.name === regionName);

  return (
    region?.territories.map((territory) => ({
      value: territory.name,
      label: territory.name,
      helper: region.name,
    })) ?? []
  );
}

function getActiveFilterCount({
  query,
  districtFilter,
  regionFilter,
  territoryFilter,
  specialtyFilter,
  facilityFilter,
  sortKey,
}: {
  query: string;
  districtFilter: string;
  regionFilter: string;
  territoryFilter: string;
  specialtyFilter: string;
  facilityFilter: string;
  sortKey: SortKey;
}) {
  return [
    query.trim().length > 0,
    districtFilter !== ALL,
    regionFilter !== ALL,
    territoryFilter !== ALL,
    specialtyFilter !== ALL,
    facilityFilter !== ALL,
    sortKey !== "newest",
  ].filter(Boolean).length;
}

function FilterChip({
  prefix,
  label,
  onClear,
}: {
  prefix: string;
  label: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="plans-filter-chip hover:border-gp-gold-500 hover:bg-gp-gold-50 inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-[#E8D29B] bg-[#FFF9EA] px-3 text-xs font-semibold text-[#7D5A12] transition-[background-color,border-color,color,transform] duration-[160ms]"
    >
      <span className="truncate">
        <span className="text-gp-navy-900">{prefix}: </span>
        {label}
      </span>
      <X className="text-gp-gold-700 size-3 shrink-0" aria-hidden="true" />
    </button>
  );
}

function FilterSelect({
  value,
  onValueChange,
  icon: Icon,
  label,
  options,
  allLabel,
  displayValue,
  className,
  secondary = false,
  searchable = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  icon: LucideIcon;
  label: string;
  options: ControlOption[];
  allLabel: string;
  displayValue?: string;
  className?: string;
  secondary?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
}) {
  const isSelected = value !== ALL;
  const searchTerm = searchValue.trim().toLowerCase();
  const visibleOptions =
    searchable && searchTerm
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(searchTerm) ||
            option.helper?.toLowerCase().includes(searchTerm),
        )
      : options;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        title={isSelected ? `${label}: ${displayValue ?? value}` : allLabel}
        className={cn(
          "plans-filter-control focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 [&>svg:last-child]:text-gp-text-placeholder h-11 w-full cursor-pointer rounded-[12px] border bg-white px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color] duration-[150ms] focus-visible:ring-3",
          isSelected
            ? "border-gp-gold-500 bg-gp-surface-hover text-gp-navy-900"
            : "border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover",
          secondary && !isSelected && "text-gp-text-secondary",
          disabled &&
            "border-gp-border-subtle bg-gp-surface-subtle text-gp-text-placeholder hover:border-gp-border-subtle hover:bg-gp-surface-subtle cursor-not-allowed",
          className,
        )}
      >
        <Icon className="text-gp-gold-600 size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">
          {displayValue ?? allLabel}
        </span>
      </SelectTrigger>
      <SelectContent className="plans-select-content border-gp-border-control shadow-gp-popover max-h-[300px] bg-white p-0 [&>div:not([data-slot])]:p-1">
        {searchable && options.length > 8 && (
          <div
            className="border-gp-border-subtle sticky top-0 z-10 border-b bg-white p-2"
            onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }
          >
            <div className="relative">
              <Search
                className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                className="border-gp-border-control focus:border-gp-gold-500 focus:ring-gp-gold-500/10 text-gp-navy-900 h-9 w-full rounded-[9px] border bg-white pr-2 pl-8 text-xs font-medium transition-[border-color,box-shadow] duration-[150ms] outline-none focus:ring-3"
              />
            </div>
          </div>
        )}
        <SelectItem
          value={ALL}
          className="text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900 h-10 cursor-pointer rounded-[8px] py-0 pr-8 pl-2 text-sm font-semibold"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon
              className="text-gp-gold-600 size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{allLabel}</span>
          </span>
        </SelectItem>
        {visibleOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900 min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold"
          >
            <span className="flex min-w-0 items-start gap-2">
              <Icon
                className="text-gp-gold-600 mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.helper && (
                  <span className="text-gp-text-muted mt-0.5 block truncate text-[11px] font-medium">
                    {option.helper}
                  </span>
                )}
              </span>
            </span>
          </SelectItem>
        ))}
        {visibleOptions.length === 0 && (
          <div className="text-gp-text-muted px-3 py-3 text-xs font-medium">
            No matching options
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

export default function DoctorsList({
  doctors = [],
  page = 1,
  limit = 10,
  totalCount = 0,
  selectedSubRegion = "",
}: DoctorsListProps) {
  const { role } = useRoleUI();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isManager = role === "MANAGER" && pathname?.startsWith("/manager");

  const initialSubRegion =
    searchParams.get("subRegion") || selectedSubRegion || ALL;
  const initialTerritoryLookup = getTerritoryLookup(initialSubRegion);
  const initialTerritory =
    initialSubRegion === ALL ? ALL : initialTerritoryLookup.territory;

  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState(ALL);
  const [regionFilter, setRegionFilter] = useState(
    isManager && initialSubRegion !== ALL ? initialTerritoryLookup.region : ALL,
  );
  const [territoryFilter, setTerritoryFilter] = useState(initialTerritory);
  const [specialtyFilter, setSpecialtyFilter] = useState(ALL);
  const [facilityFilter, setFacilityFilter] = useState(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState("");

  const rows = useMemo<DoctorDirectoryData[]>(
    () => doctors.map(normalizeDoctorForDirectory),
    [doctors],
  );

  const districtOptions = useMemo<ControlOption[]>(() => {
    const available = new Set(rows.map((row) => row.territory.district));

    return [
      ...KSA_TERRITORY_STRUCTURE.filter((district) =>
        available.has(district.name),
      ).map((district) => ({
        value: district.name,
        label: district.name,
      })),
      ...Array.from(available)
        .filter(
          (district) =>
            district === UNASSIGNED_DISTRICT ||
            !KSA_TERRITORY_STRUCTURE.some((item) => item.name === district),
        )
        .sort((a, b) => a.localeCompare(b))
        .map((district) => ({
          value: district,
          label: district,
        })),
    ];
  }, [rows]);

  const regionOptions = useMemo<ControlOption[]>(() => {
    return uniqueSorted(
      rows
        .filter(
          (row) =>
            districtFilter === ALL || row.territory.district === districtFilter,
        )
        .map((row) => row.territory.region),
    ).map((region) => {
      const district = rows.find((row) => row.territory.region === region)
        ?.territory.district;

      return {
        value: region,
        label: region,
        helper: district,
      };
    });
  }, [districtFilter, rows]);

  const territoryOptions = useMemo<ControlOption[]>(() => {
    return uniqueSorted(
      rows
        .filter((row) => {
          if (
            districtFilter !== ALL &&
            row.territory.district !== districtFilter
          ) {
            return false;
          }
          if (regionFilter !== ALL && row.territory.region !== regionFilter) {
            return false;
          }
          return true;
        })
        .map((row) => row.territory.territory),
    ).map((territory) => {
      const lookup = rows.find(
        (row) => row.territory.territory === territory,
      )?.territory;

      return {
        value: territory,
        label: territory,
        helper: lookup?.region,
      };
    });
  }, [districtFilter, regionFilter, rows]);

  const specialtyOptions = useMemo<ControlOption[]>(
    () =>
      uniqueSorted(rows.map((row) => row.specialty)).map((specialty) => ({
        value: specialty,
        label: specialty,
      })),
    [rows],
  );

  const facilityOptions = useMemo<ControlOption[]>(
    () =>
      uniqueSorted(rows.map((row) => row.accountName)).map((facility) => ({
        value: facility,
        label: facility,
      })),
    [rows],
  );

  const sortControlOptions: ControlOption[] = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const managerRegionOptions = useMemo<ControlOption[]>(
    () => getBusinessRegionOptions(rows),
    [rows],
  );

  const managerTerritoryOptions = useMemo<ControlOption[]>(
    () => getBusinessTerritoryOptions(regionFilter),
    [regionFilter],
  );

  const filteredRows = useMemo(() => {
    const term = normalizeFilterValue(query);

    return rows.filter((row) => {
      if (districtFilter !== ALL && row.territory.district !== districtFilter) {
        return false;
      }
      if (regionFilter !== ALL && row.territory.region !== regionFilter) {
        return false;
      }
      if (
        territoryFilter !== ALL &&
        row.territory.territory !== territoryFilter
      ) {
        return false;
      }
      if (
        specialtyFilter !== ALL &&
        normalizeFilterValue(row.specialty) !==
          normalizeFilterValue(specialtyFilter)
      ) {
        return false;
      }
      if (
        facilityFilter !== ALL &&
        normalizeFilterValue(row.accountName) !==
          normalizeFilterValue(facilityFilter)
      ) {
        return false;
      }
      if (!term) return true;

      return [
        row.nameEN,
        row.nameAR,
        row.specialty,
        row.accountName,
        row.subRegion,
        row.area,
        row.email,
        row.phone,
        row.territory.district,
        row.territory.region,
        row.territory.territory,
        isManager
          ? getCompactTerritoryLabel(row.territory.territory, true)
          : "",
      ].some((value) => includesNormalized(value, term));
    });
  }, [
    districtFilter,
    facilityFilter,
    query,
    regionFilter,
    rows,
    specialtyFilter,
    territoryFilter,
    isManager,
  ]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      if (sortKey === "nameAsc") {
        return getDisplayName(left).localeCompare(getDisplayName(right));
      }
      if (sortKey === "nameDesc") {
        return getDisplayName(right).localeCompare(getDisplayName(left));
      }
      if (sortKey === "specialtyAsc") {
        return String(left.specialty ?? "").localeCompare(
          String(right.specialty ?? ""),
        );
      }
      return dateValue(right.createdAt) - dateValue(left.createdAt);
    });
  }, [filteredRows, sortKey]);

  const activeFilterCount = getActiveFilterCount({
    query,
    districtFilter,
    regionFilter,
    territoryFilter,
    specialtyFilter,
    facilityFilter,
    sortKey,
  });
  const hasActiveFilters = activeFilterCount > 0;
  const coverageSummary = [
    regionFilter !== ALL ? regionFilter : "",
    territoryFilter !== ALL
      ? getCompactTerritoryLabel(territoryFilter, true)
      : "",
  ]
    .filter(Boolean)
    .join(" -> ");
  const directoryTotalCount = isManager ? sortedRows.length : totalCount;
  const directoryTotalPages = Math.max(
    1,
    Math.ceil(directoryTotalCount / limit),
  );
  const directoryPage = isManager
    ? Math.min(Math.max(page, 1), directoryTotalPages)
    : page;
  const visibleRows = isManager
    ? sortedRows.slice((directoryPage - 1) * limit, directoryPage * limit)
    : sortedRows;

  function pushSubRegionFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value === ALL) {
      params.delete("subRegion");
    } else {
      params.set("subRegion", value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
    pushSubRegionFilter(ALL);
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL);
    pushSubRegionFilter(ALL);
  }

  function updateTerritory(value: string) {
    setTerritoryFilter(value);
    pushSubRegionFilter(value);
  }

  function resetPageToFirst() {
    if (!isManager || page <= 1) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function updateQuery(value: string) {
    setQuery(value);
    resetPageToFirst();
  }

  function updateSpecialty(value: string) {
    setSpecialtyFilter(value);
    resetPageToFirst();
  }

  function updateFacility(value: string) {
    setFacilityFilter(value);
    resetPageToFirst();
  }

  function updateSort(value: string) {
    setSortKey(value as SortKey);
    resetPageToFirst();
  }

  function resetFilters() {
    setQuery("");
    setDistrictFilter(ALL);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
    setSpecialtyFilter(ALL);
    setFacilityFilter(ALL);
    setSortKey("newest");
    setFacilitySearch("");
    pushSubRegionFilter(ALL);
  }

  const emptyTitle = hasActiveFilters
    ? "No doctors match the selected filters."
    : "No doctors found";
  const emptyCopy = hasActiveFilters
    ? "Try changing your territory, specialty or search criteria."
    : "Newly registered doctors will appear here.";

  return (
    <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card mt-5 overflow-hidden rounded-[16px] border">
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-gp-navy-900 text-lg font-semibold">
              Doctor Directory
            </h2>
            <p
              key={`${sortedRows.length}-${query}`}
              className="text-gp-text-muted mt-0.5 text-sm font-medium"
              aria-live="polite"
            >
              {sortedRows.length}{" "}
              {sortedRows.length === 1 ? "doctor" : "doctors"} available
              {isManager && coverageSummary && ` | ${coverageSummary}`}
              {isPending && " · Loading..."}
            </p>
          </div>

          <div className="relative w-full lg:w-[380px]">
            <Search
              className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              className="border-gp-border-default text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 w-full rounded-[12px] bg-white pr-10 pl-10 text-sm font-medium shadow-none transition-[border-color,box-shadow] duration-[150ms]"
              placeholder="Search doctors, specialties or facilities..."
              aria-label="Search doctors, specialties, facilities, or territories"
              disabled={isPending}
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                aria-label="Clear doctor search"
                className="text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end md:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterSheetOpen(true)}
            className="border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover h-11 cursor-pointer rounded-[12px] bg-white px-3 text-sm font-semibold shadow-none"
          >
            <SlidersHorizontal
              className="text-gp-gold-600 size-4"
              aria-hidden="true"
            />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-gp-navy-900 text-gp-gold-500 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px]">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="mt-4 hidden md:block">
          <div className="text-gp-navy-900 mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
            <SlidersHorizontal
              className="text-gp-gold-600 size-3.5"
              aria-hidden="true"
            />
            Filters
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isManager ? (
              <div className="border-gp-border-default w-full rounded-[14px] border bg-[#F9FAFB] p-3">
                <div className="mb-3 flex items-start gap-2.5">
                  <span className="bg-gp-gold-50 text-gp-gold-700 flex size-7 shrink-0 items-center justify-center rounded-[8px]">
                    <MapPinned className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-gp-navy-900 text-sm font-semibold">
                      Territory Coverage
                    </p>
                    <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
                      Filter doctors by region and assigned territory
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 items-center gap-2 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                  <FilterSelect
                    value={regionFilter}
                    onValueChange={updateRegion}
                    icon={MapPinned}
                    label="Region"
                    allLabel="All Regions"
                    displayValue={
                      regionFilter === ALL ? "All Regions" : regionFilter
                    }
                    options={managerRegionOptions}
                  />
                  <ChevronRight
                    className="text-gp-gold-500/75 hidden size-4 xl:block"
                    aria-hidden="true"
                  />
                  <FilterSelect
                    value={territoryFilter}
                    onValueChange={updateTerritory}
                    icon={MapPin}
                    label="Territory"
                    allLabel={
                      regionFilter === ALL
                        ? "Select a region first"
                        : "All Territories"
                    }
                    displayValue={
                      regionFilter === ALL
                        ? "Select a region first"
                        : getCompactTerritoryLabel(territoryFilter, true)
                    }
                    options={managerTerritoryOptions}
                    disabled={regionFilter === ALL}
                  />
                </div>
              </div>
            ) : (
              <div className="border-gp-border-subtle bg-gp-surface-subtle flex max-w-full flex-wrap items-center gap-2 rounded-[14px] border p-2">
                <FilterSelect
                  value={districtFilter}
                  onValueChange={updateDistrict}
                  icon={Layers3}
                  label="District"
                  allLabel="All Districts"
                  displayValue={getCompactDistrictLabel(districtFilter)}
                  options={districtOptions}
                  className="md:w-[230px]"
                />
                <ChevronRight
                  className="text-gp-gold-500/75 size-4"
                  aria-hidden="true"
                />
                <FilterSelect
                  value={regionFilter}
                  onValueChange={updateRegion}
                  icon={MapPinned}
                  label="Region"
                  allLabel="All Regions"
                  displayValue={getCompactRegionLabel(regionFilter)}
                  options={regionOptions}
                  className="md:w-[205px]"
                />
                <ChevronRight
                  className="text-gp-gold-500/75 size-4"
                  aria-hidden="true"
                />
                <FilterSelect
                  value={territoryFilter}
                  onValueChange={updateTerritory}
                  icon={MapPin}
                  label="Territory"
                  allLabel="All Territories"
                  displayValue={getCompactTerritoryLabel(territoryFilter)}
                  options={territoryOptions}
                  className="md:w-[170px]"
                />
              </div>
            )}

            <FilterSelect
              value={specialtyFilter}
              onValueChange={updateSpecialty}
              icon={Stethoscope}
              label="Specialty"
              allLabel="All Specialties"
              displayValue={
                specialtyFilter === ALL ? "Specialty" : specialtyFilter
              }
              options={specialtyOptions}
              className="md:w-[190px]"
              secondary
            />
            <FilterSelect
              value={facilityFilter}
              onValueChange={updateFacility}
              icon={Building2}
              label="Facility"
              allLabel="All Facilities"
              displayValue={
                facilityFilter === ALL ? "Facility" : facilityFilter
              }
              options={facilityOptions}
              className="md:w-[230px]"
              secondary
              searchable
              searchValue={facilitySearch}
              onSearchChange={setFacilitySearch}
              searchPlaceholder="Search facilities..."
            />
            <FilterSelect
              value={sortKey}
              onValueChange={updateSort}
              icon={ArrowUpDown}
              label="Sort"
              allLabel="Recently Added"
              displayValue={
                sortOptions.find((option) => option.value === sortKey)?.label ??
                "Recently Added"
              }
              options={sortControlOptions}
              className="md:w-[170px]"
              secondary
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-gp-text-muted mr-1 text-xs font-semibold">
              {isManager
                ? "Active coverage"
                : `${activeFilterCount} ${activeFilterCount === 1 ? "filter" : "filters"} active`}
            </span>
            {districtFilter !== ALL && (
              <FilterChip
                prefix="District"
                label={getCompactDistrictLabel(districtFilter)}
                onClear={() => updateDistrict(ALL)}
              />
            )}
            {regionFilter !== ALL && (
              <FilterChip
                prefix="Region"
                label={
                  isManager ? regionFilter : getCompactRegionLabel(regionFilter)
                }
                onClear={() => updateRegion(ALL)}
              />
            )}
            {territoryFilter !== ALL && (
              <FilterChip
                prefix="Territory"
                label={getCompactTerritoryLabel(territoryFilter, isManager)}
                onClear={() => updateTerritory(ALL)}
              />
            )}
            {specialtyFilter !== ALL && (
              <FilterChip
                prefix="Specialty"
                label={specialtyFilter}
                onClear={() => updateSpecialty(ALL)}
              />
            )}
            {facilityFilter !== ALL && (
              <FilterChip
                prefix="Facility"
                label={facilityFilter}
                onClear={() => updateFacility(ALL)}
              />
            )}
            {sortKey !== "newest" && (
              <FilterChip
                prefix="Sort"
                label={
                  sortOptions.find((option) => option.value === sortKey)
                    ?.label ?? "Recently Added"
                }
                onClear={() => updateSort("newest")}
              />
            )}
            {query.trim() && (
              <FilterChip
                prefix="Search"
                label={query.trim()}
                onClear={() => updateQuery("")}
              />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
              className="border-gp-border-control text-gp-navy-900 hover:border-gp-danger-border hover:bg-gp-danger-soft hover:text-gp-danger h-8 cursor-pointer rounded-full bg-white px-3 text-xs font-semibold shadow-none"
            >
              <XCircle className="size-3.5" aria-hidden="true" />
              Clear all
            </Button>
          </div>
        )}

        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetContent
            side="right"
            className="bg-gp-surface-page border-gp-border-default shadow-gp-dialog w-full gap-0 p-0 sm:max-w-[420px]"
            overlayClassName="bg-gp-navy-900/35"
          >
            <SheetHeader className="border-gp-border-subtle border-b bg-white px-5 py-5">
              <SheetTitle className="text-gp-navy-900 text-lg font-semibold">
                Filters
              </SheetTitle>
              <SheetDescription className="text-gp-text-muted text-sm font-medium">
                Narrow doctors by territory, specialty, facility, and sort.
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-5">
                <section>
                  <p className="text-gp-navy-900 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    {isManager ? "Territory Coverage" : "Location"}
                  </p>
                  <div className="space-y-2">
                    {!isManager && (
                      <FilterSelect
                        value={districtFilter}
                        onValueChange={updateDistrict}
                        icon={Layers3}
                        label="District"
                        allLabel="All Districts"
                        displayValue={getCompactDistrictLabel(districtFilter)}
                        options={districtOptions}
                      />
                    )}
                    <FilterSelect
                      value={regionFilter}
                      onValueChange={updateRegion}
                      icon={MapPinned}
                      label="Region"
                      allLabel="All Regions"
                      displayValue={
                        isManager
                          ? regionFilter === ALL
                            ? "All Regions"
                            : regionFilter
                          : getCompactRegionLabel(regionFilter)
                      }
                      options={isManager ? managerRegionOptions : regionOptions}
                    />
                    <FilterSelect
                      value={territoryFilter}
                      onValueChange={updateTerritory}
                      icon={MapPin}
                      label="Territory"
                      allLabel={
                        isManager && regionFilter === ALL
                          ? "Select a region first"
                          : "All Territories"
                      }
                      displayValue={
                        isManager && regionFilter === ALL
                          ? "Select a region first"
                          : getCompactTerritoryLabel(territoryFilter, isManager)
                      }
                      options={
                        isManager ? managerTerritoryOptions : territoryOptions
                      }
                      disabled={isManager && regionFilter === ALL}
                    />
                  </div>
                </section>

                <section>
                  <p className="text-gp-navy-900 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Doctor
                  </p>
                  <div className="space-y-2">
                    <FilterSelect
                      value={specialtyFilter}
                      onValueChange={updateSpecialty}
                      icon={Stethoscope}
                      label="Specialty"
                      allLabel="All Specialties"
                      displayValue={
                        specialtyFilter === ALL
                          ? "All Specialties"
                          : specialtyFilter
                      }
                      options={specialtyOptions}
                      secondary
                    />
                    <FilterSelect
                      value={facilityFilter}
                      onValueChange={updateFacility}
                      icon={Building2}
                      label="Facility"
                      allLabel="All Facilities"
                      displayValue={
                        facilityFilter === ALL
                          ? "All Facilities"
                          : facilityFilter
                      }
                      options={facilityOptions}
                      secondary
                      searchable
                      searchValue={facilitySearch}
                      onSearchChange={setFacilitySearch}
                      searchPlaceholder="Search facilities..."
                    />
                  </div>
                </section>

                <section>
                  <p className="text-gp-navy-900 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Sort
                  </p>
                  <FilterSelect
                    value={sortKey}
                    onValueChange={updateSort}
                    icon={ArrowUpDown}
                    label="Sort"
                    allLabel="Recently Added"
                    displayValue={
                      sortOptions.find((option) => option.value === sortKey)
                        ?.label ?? "Recently Added"
                    }
                    options={sortControlOptions}
                    secondary
                  />
                </section>
              </div>
            </div>

            <SheetFooter className="border-gp-border-subtle grid grid-cols-2 gap-2 border-t bg-white p-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="border-gp-border-control text-gp-navy-900 hover:border-gp-danger-border hover:bg-gp-danger-soft hover:text-gp-danger h-10 cursor-pointer rounded-[10px] text-sm font-semibold"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] text-sm font-semibold text-white"
              >
                <CheckCircle2
                  className="text-gp-gold-500 size-4"
                  aria-hidden="true"
                />
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </header>

      <div className="bg-gp-surface-subtle/40 p-4 sm:p-5">
        {visibleRows.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {visibleRows.map((doctor, index) => (
              <DoctorCard key={doctor.id} data={doctor} index={index} />
            ))}
          </div>
        ) : (
          <div className="border-gp-border-control bg-gp-surface-card rounded-[14px] border border-dashed px-5 py-10 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-12 items-center justify-center rounded-full">
              <CircleSlash className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-4 text-base font-semibold">
              {emptyTitle}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-2 max-w-md text-sm leading-6 font-medium">
              {emptyCopy}
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50 mt-4 h-9 cursor-pointer rounded-[10px] text-xs font-semibold"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={directoryPage}
        limit={limit}
        totalCount={directoryTotalCount}
        itemLabel="doctors"
        ariaLabel="Doctors directory pagination"
        pageNavAriaLabel="Doctors pages"
        tone="navy"
      />
    </section>
  );
}
