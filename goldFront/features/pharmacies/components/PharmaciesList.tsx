"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useMemo,
  useState,
} from "react";
import { format } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpDown,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  Copy,
  Eye,
  Globe2,
  Layers3,
  MapPin,
  MapPinned,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Store,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import {
  KSA_TERRITORY_STRUCTURE,
  UNASSIGNED_DISTRICT,
} from "@/features/plan/lib/territory";
import type { PharmacyApiResponse } from "../lib/types";
import {
  normalizePharmacyFilterValue,
  normalizePharmacyForDirectory,
  type PharmacyDirectoryData,
} from "../lib/utils/directory";

interface PharmaciesListProps {
  pharmacies?: PharmacyApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

type SortKey = "newest" | "nameAsc" | "nameDesc" | "cityAsc";
type ControlOption = {
  value: string;
  label: string;
  helper?: string;
};
type PharmacyDirectoryRow = PharmacyDirectoryData;

const ALL = "all";
const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Recently Added" },
  { value: "nameAsc", label: "Name A-Z" },
  { value: "nameDesc", label: "Name Z-A" },
  { value: "cityAsc", label: "City A-Z" },
];

function isClean(value?: string | null): value is string {
  return Boolean(
    value &&
    typeof value === "string" &&
    value.trim() !== "" &&
    !value.toLowerCase().includes("undefined") &&
    !value.toLowerCase().includes("null"),
  );
}

function cleanText(value?: string | null, fallback = "Not provided") {
  return isClean(value) ? value.trim() : fallback;
}

function includesNormalized(value: string | null | undefined, query: string) {
  return normalizePharmacyFilterValue(value).includes(query);
}

function uniqueSorted(values: Array<string | null | undefined>) {
  const labelsByValue = new Map<string, string>();

  values.filter(isClean).forEach((value) => {
    const label = value.trim().replace(/\s+/g, " ");
    const canonicalValue = normalizePharmacyFilterValue(label);

    if (!labelsByValue.has(canonicalValue)) {
      labelsByValue.set(canonicalValue, label);
    }
  });

  return Array.from(labelsByValue.values()).sort((a, b) => a.localeCompare(b));
}

function dateValue(value?: string) {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Not recorded"
    : format(parsed, "MMM d, yyyy");
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

function getActiveFilterCount({
  query,
  districtFilter,
  regionFilter,
  territoryFilter,
  cityFilter,
  sortKey,
}: {
  query: string;
  districtFilter: string;
  regionFilter: string;
  territoryFilter: string;
  cityFilter: string;
  sortKey: SortKey;
}) {
  return [
    query.trim().length > 0,
    districtFilter !== ALL,
    regionFilter !== ALL,
    territoryFilter !== ALL,
    cityFilter !== ALL,
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
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        title={isSelected ? `${label}: ${displayValue ?? value}` : allLabel}
        className={cn(
          "plans-filter-control focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 [&>svg:last-child]:text-gp-text-placeholder h-11 w-full cursor-pointer rounded-[12px] border bg-white px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color] duration-[150ms] focus-visible:ring-3",
          isSelected
            ? "border-gp-gold-500 bg-gp-surface-hover text-gp-navy-900"
            : "border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover",
          secondary && !isSelected && "text-gp-text-secondary",
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

function DataQualityText({
  value,
  fallback,
}: {
  value?: string | null;
  fallback: string;
}) {
  if (isClean(value)) return <>{value.trim()}</>;

  return (
    <span className="text-gp-text-placeholder text-xs font-medium italic">
      {fallback}
    </span>
  );
}

function DetailTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-2">
      <span className="bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-[8px]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-gp-text-muted truncate text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </p>
        <p className="text-gp-navy-900 truncate text-sm leading-5 font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function PharmacyNameCell({
  row,
  isRep = false,
}: {
  row: PharmacyDirectoryRow;
  isRep?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
          isRep
            ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] shadow-[0_4px_12px_rgba(22,133,87,0.12)]"
            : "border-gp-gold-300 bg-gp-navy-900 text-gp-gold-500 shadow-[0_6px_14px_rgba(16,29,54,0.13)]",
        )}
      >
        <Store className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p
          className="text-gp-navy-900 truncate text-sm font-semibold"
          dir="auto"
          title={row.displayName}
        >
          {row.displayName}
        </p>
        <p className="text-gp-text-muted mt-0.5 truncate text-xs font-medium">
          {row.code}
        </p>
      </div>
    </div>
  );
}

function PharmacyMobileCard({
  row,
  index,
  onViewDetails,
  isRep = false,
  isManager = false,
}: {
  row: PharmacyDirectoryRow;
  index: number;
  onViewDetails: (row: PharmacyDirectoryRow) => void;
  isRep?: boolean;
  isManager?: boolean;
}) {
  return (
    <article
      className={cn(
        "group/pharmacy border-gp-border-default bg-gp-surface-card shadow-gp-card relative [animation:plans-card-in_350ms_ease-out_forwards] overflow-hidden rounded-[14px] border opacity-0 transition-[border-color,box-shadow,transform] duration-[200ms] hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(16,27,51,0.09)] motion-reduce:transform-none motion-reduce:[animation:none] motion-reduce:opacity-100",
        isRep ? "hover:border-[#CBEFDD]" : "hover:border-gp-gold-300",
      )}
      style={{ animationDelay: `${Math.min(index, 9) * 40}ms` }}
    >
      <span
        className={cn(
          "absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full",
          isRep ? "bg-[#168557]" : "bg-gp-gold-500",
        )}
      />
      <div className="p-4">
        <PharmacyNameCell row={row} isRep={isRep} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <DetailTile
            label="City"
            value={cleanText(row.city, "Not provided")}
            icon={Building2}
          />
          <DetailTile
            label="Country"
            value={cleanText(row.country, "Saudi Arabia")}
            icon={Globe2}
          />
          <DetailTile
            label="Region"
            value={cleanText(row.region, "Not assigned")}
            icon={MapPinned}
          />
          <DetailTile
            label="Territory"
            value={getCompactTerritoryLabel(row.territoryName, isManager)}
            icon={MapPin}
          />
        </div>
        <div className="border-gp-border-subtle mt-4 flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-gp-text-muted inline-flex items-center gap-1.5 text-xs font-medium">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Added {formatDate(row.createdAt)}
          </span>
          <Button
            type="button"
            onClick={() => onViewDetails(row)}
            className={cn(
              "group h-9 cursor-pointer rounded-[10px] px-3 text-xs font-semibold text-white",
              isRep
                ? "bg-[#168557] shadow-[0_4px_14px_rgba(22,133,87,0.22)] hover:bg-[#107349]"
                : "bg-gp-navy-900 hover:bg-gp-navy-900/95 shadow-[0_6px_14px_rgba(16,29,54,0.16)]",
            )}
          >
            View Details
            <ArrowRight
              className={cn(
                "size-3.5 transition-transform duration-[170ms] group-hover:translate-x-0.5",
                isRep ? "text-white" : "text-gp-gold-500",
              )}
            />
          </Button>
        </div>
      </div>
    </article>
  );
}

function PharmacyDetailsSheet({
  pharmacy,
  open,
  onOpenChange,
  isRep = false,
  isManager = false,
}: {
  pharmacy: PharmacyDirectoryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRep?: boolean;
  isManager?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-gp-surface-page border-gp-border-default shadow-gp-dialog w-full gap-0 p-0 sm:max-w-[520px]"
        overlayClassName="bg-gp-navy-900/35"
      >
        {pharmacy && (
          <>
            <SheetHeader className="border-gp-border-subtle border-b bg-white px-5 py-5">
              <div className="flex min-w-0 items-start gap-3 pr-8">
                <span
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-[12px] border",
                    isRep
                      ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557] shadow-[0_8px_18px_rgba(22,133,87,0.16)]"
                      : "border-gp-gold-300 bg-gp-navy-900 text-gp-gold-500 shadow-[0_8px_18px_rgba(16,29,54,0.16)]",
                  )}
                >
                  <Store className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <SheetTitle
                    className="text-gp-navy-900 text-xl leading-7 font-semibold"
                    dir="auto"
                  >
                    {pharmacy.displayName}
                  </SheetTitle>
                  <SheetDescription className="text-gp-text-muted mt-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span>{pharmacy.code}</span>
                    <span className="bg-gp-success-soft text-gp-success border-gp-success-border inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase">
                      Registered
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div
                className={cn(
                  "rounded-[14px] border p-4",
                  isRep
                    ? "border-[#CBEFDD] bg-[#E9F8F1]"
                    : "border-gp-gold-300 bg-gp-gold-50",
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-semibold tracking-[0.08em] uppercase",
                    isRep ? "text-[#168557]" : "text-gp-gold-700",
                  )}
                >
                  Territory
                </p>
                <p className="text-gp-navy-900 mt-2 text-sm font-semibold">
                  {cleanText(pharmacy.district, "Not assigned")}
                </p>
                <p className="text-gp-text-muted mt-1 text-sm font-medium">
                  {cleanText(pharmacy.region, "Not assigned")} /{" "}
                  {getCompactTerritoryLabel(pharmacy.territoryName, isManager)}
                </p>
              </div>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 text-sm font-semibold">
                  Overview
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <DetailTile
                    label="City"
                    value={cleanText(pharmacy.city, "Not provided")}
                    icon={Building2}
                  />
                  <DetailTile
                    label="Country"
                    value={cleanText(pharmacy.country, "Saudi Arabia")}
                    icon={Globe2}
                  />
                  <DetailTile
                    label="Added"
                    value={formatDate(pharmacy.createdAt)}
                    icon={CalendarDays}
                  />
                  <DetailTile
                    label="Updated"
                    value={formatDate(pharmacy.updatedAt)}
                    icon={CalendarDays}
                  />
                </div>
              </section>

              <section className="mt-5">
                <h3 className="text-gp-navy-900 text-sm font-semibold">
                  Data Fields
                </h3>
                <div className="border-gp-border-subtle mt-3 overflow-hidden rounded-[12px] border bg-white">
                  {[
                    [
                      "Stored pharmacy name",
                      cleanText(pharmacy.name, "Not provided"),
                    ],
                    [
                      "Stored region",
                      cleanText(pharmacy.sourceRegion, "Not assigned"),
                    ],
                    [
                      "Stored sub-region",
                      cleanText(pharmacy.sourceTerritory, "Not assigned"),
                    ],
                    ["Record ID", pharmacy.id],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border-gp-border-subtle grid gap-1 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)]"
                    >
                      <p className="text-gp-text-muted text-xs font-semibold">
                        {label}
                      </p>
                      <p
                        className="text-gp-navy-900 min-w-0 text-sm font-medium break-words"
                        dir="auto"
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <SheetFooter className="border-gp-border-subtle border-t bg-white p-4">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "h-10 cursor-pointer rounded-[10px] text-sm font-semibold text-white",
                  isRep
                    ? "bg-[#168557] shadow-[0_4px_14px_rgba(22,133,87,0.22)] hover:bg-[#107349]"
                    : "bg-gp-navy-900 hover:bg-gp-navy-900/95",
                )}
              >
                <CheckCircle2
                  className={cn(
                    "size-4",
                    isRep ? "text-white" : "text-gp-gold-500",
                  )}
                  aria-hidden="true"
                />
                Done
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function PharmaciesList({
  pharmacies = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: PharmaciesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useRoleUI();
  const isManager = role === "MANAGER" && pathname?.startsWith("/manager");
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState(ALL);
  const [regionFilter, setRegionFilter] = useState(ALL);
  const [territoryFilter, setTerritoryFilter] = useState(ALL);
  const [cityFilter, setCityFilter] = useState(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] =
    useState<PharmacyDirectoryRow | null>(null);

  const rows = useMemo<PharmacyDirectoryData[]>(
    () => pharmacies.map(normalizePharmacyForDirectory),
    [pharmacies],
  );

  const districtOptions = useMemo<ControlOption[]>(() => {
    const available = new Set(rows.map((row) => row.district));

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
          (row) => districtFilter === ALL || row.district === districtFilter,
        )
        .map((row) => row.region),
    ).map((region) => {
      const district = rows.find((row) => row.region === region)?.district;

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
          if (districtFilter !== ALL && row.district !== districtFilter) {
            return false;
          }
          if (regionFilter !== ALL && row.region !== regionFilter) {
            return false;
          }
          return true;
        })
        .map((row) => row.territoryName),
    ).map((territory) => {
      const match = rows.find((row) => row.territoryName === territory);

      return {
        value: territory,
        label: territory,
        helper: match?.region,
      };
    });
  }, [districtFilter, regionFilter, rows]);

  const cityOptions = useMemo<ControlOption[]>(
    () =>
      uniqueSorted(
        rows
          .filter((row) => {
            if (districtFilter !== ALL && row.district !== districtFilter) {
              return false;
            }
            if (regionFilter !== ALL && row.region !== regionFilter) {
              return false;
            }
            if (
              territoryFilter !== ALL &&
              row.territoryName !== territoryFilter
            ) {
              return false;
            }
            return true;
          })
          .map((row) => row.city),
      ).map((city) => ({
        value: city,
        label: city,
      })),
    [districtFilter, regionFilter, rows, territoryFilter],
  );

  const sortControlOptions: ControlOption[] = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const directoryTerritoryOptions = useMemo<ControlOption[]>(
    () =>
      isManager
        ? territoryOptions.map((territory) => ({
            ...territory,
            label: getCompactTerritoryLabel(territory.label, true),
          }))
        : territoryOptions,
    [isManager, territoryOptions],
  );

  const filteredRows = useMemo(() => {
    const term = normalizePharmacyFilterValue(query);

    return rows.filter((row) => {
      if (districtFilter !== ALL && row.district !== districtFilter) {
        return false;
      }
      if (regionFilter !== ALL && row.region !== regionFilter) {
        return false;
      }
      if (territoryFilter !== ALL && row.territoryName !== territoryFilter) {
        return false;
      }
      if (
        cityFilter !== ALL &&
        normalizePharmacyFilterValue(row.city) !==
          normalizePharmacyFilterValue(cityFilter)
      ) {
        return false;
      }
      if (!term) return true;

      return [
        row.name,
        row.displayName,
        row.code,
        row.city,
        row.country,
        row.sourceRegion,
        row.sourceTerritory,
        row.district,
        row.region,
        row.territoryName,
      ].some((value) => includesNormalized(value, term));
    });
  }, [cityFilter, districtFilter, query, regionFilter, rows, territoryFilter]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((left, right) => {
      if (sortKey === "nameAsc") {
        return left.displayName.localeCompare(right.displayName);
      }
      if (sortKey === "nameDesc") {
        return right.displayName.localeCompare(left.displayName);
      }
      if (sortKey === "cityAsc") {
        return cleanText(left.city, "").localeCompare(
          cleanText(right.city, ""),
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
    cityFilter,
    sortKey,
  });
  const hasActiveFilters = activeFilterCount > 0;
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
  const isPageSlice = !isManager && totalCount !== pharmacies.length;
  const emptyTitle = hasActiveFilters
    ? "No pharmacies match these filters"
    : "No pharmacies found";
  const emptyCopy = hasActiveFilters
    ? "Try adjusting your territory filters or search."
    : "Newly registered pharmacy accounts will appear here.";

  function resetPageToFirst() {
    if (page <= 1) return;

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function updateQuery(value: string) {
    setQuery(value);
    resetPageToFirst();
  }

  function resetCityWhenInvalid(nextLocation: {
    district: string;
    region: string;
    territory: string;
  }) {
    if (cityFilter === ALL) return;

    const cityIsAvailable = rows.some((row) => {
      if (
        nextLocation.district !== ALL &&
        row.district !== nextLocation.district
      ) {
        return false;
      }
      if (nextLocation.region !== ALL && row.region !== nextLocation.region) {
        return false;
      }
      if (
        nextLocation.territory !== ALL &&
        row.territoryName !== nextLocation.territory
      ) {
        return false;
      }

      return (
        normalizePharmacyFilterValue(row.city) ===
        normalizePharmacyFilterValue(cityFilter)
      );
    });

    if (!cityIsAvailable) {
      setCityFilter(ALL);
    }
  }

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
    resetCityWhenInvalid({
      district: value,
      region: ALL,
      territory: ALL,
    });
    resetPageToFirst();
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL);
    resetCityWhenInvalid({
      district: districtFilter,
      region: value,
      territory: ALL,
    });
    resetPageToFirst();
  }

  function updateTerritory(value: string) {
    setTerritoryFilter(value);
    resetCityWhenInvalid({
      district: districtFilter,
      region: regionFilter,
      territory: value,
    });
    resetPageToFirst();
  }

  function updateCity(value: string) {
    setCityFilter(value);
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
    setCityFilter(ALL);
    setSortKey("newest");
    setCitySearch("");
    resetPageToFirst();
  }

  async function copyPharmacyId(row: PharmacyDirectoryRow) {
    try {
      await navigator.clipboard.writeText(row.id);
      toast.success({ title: "Pharmacy ID copied" });
    } catch {
      toast.error({ title: "Could not copy pharmacy ID" });
    }
  }

  function openDetails(row: PharmacyDirectoryRow) {
    setSelectedPharmacy(row);
  }

  return (
    <>
      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card mt-5 overflow-hidden rounded-[16px] border">
        <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-gp-navy-900 text-lg font-semibold">
                Pharmacy Directory
              </h2>
              <p
                key={`${sortedRows.length}-${query}`}
                className="text-gp-text-muted mt-0.5 text-sm font-medium"
                aria-live="polite"
              >
                {sortedRows.length}{" "}
                {sortedRows.length === 1 ? "pharmacy" : "pharmacies"} shown
                {isPageSlice ? " on this page" : ""}
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
                placeholder="Search loaded pharmacies..."
                aria-label="Search loaded pharmacies by name, city, code or territory"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateQuery("")}
                  aria-label="Clear pharmacy search"
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
                  displayValue={getCompactTerritoryLabel(
                    territoryFilter,
                    isManager,
                  )}
                  options={directoryTerritoryOptions}
                  className="md:w-[170px]"
                />
              </div>

              <FilterSelect
                value={cityFilter}
                onValueChange={updateCity}
                icon={Building2}
                label="City"
                allLabel="All Cities"
                displayValue={cityFilter === ALL ? "City" : cityFilter}
                options={cityOptions}
                className="md:w-[170px]"
                secondary
                searchable
                searchValue={citySearch}
                onSearchChange={setCitySearch}
                searchPlaceholder="Search cities..."
              />
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
                className="md:w-[175px]"
                secondary
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-gp-text-muted mr-1 text-xs font-semibold">
                {activeFilterCount}{" "}
                {activeFilterCount === 1 ? "filter" : "filters"} active
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
                  label={getCompactRegionLabel(regionFilter)}
                  onClear={() => updateRegion(ALL)}
                />
              )}
              {territoryFilter !== ALL && (
                <FilterChip
                  prefix="Territory"
                  label={territoryFilter}
                  onClear={() => updateTerritory(ALL)}
                />
              )}
              {cityFilter !== ALL && (
                <FilterChip
                  prefix="City"
                  label={cityFilter}
                  onClear={() => updateCity(ALL)}
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
                  Narrow pharmacies by territory, city, and sort.
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  <section>
                    <p className="text-gp-navy-900 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                      Location
                    </p>
                    <div className="space-y-2">
                      <FilterSelect
                        value={districtFilter}
                        onValueChange={updateDistrict}
                        icon={Layers3}
                        label="District"
                        allLabel="All Districts"
                        displayValue={getCompactDistrictLabel(districtFilter)}
                        options={districtOptions}
                      />
                      <FilterSelect
                        value={regionFilter}
                        onValueChange={updateRegion}
                        icon={MapPinned}
                        label="Region"
                        allLabel="All Regions"
                        displayValue={getCompactRegionLabel(regionFilter)}
                        options={regionOptions}
                      />
                      <FilterSelect
                        value={territoryFilter}
                        onValueChange={updateTerritory}
                        icon={MapPin}
                        label="Territory"
                        allLabel="All Territories"
                        displayValue={getCompactTerritoryLabel(
                          territoryFilter,
                          isManager,
                        )}
                        options={directoryTerritoryOptions}
                      />
                    </div>
                  </section>

                  <section>
                    <p className="text-gp-navy-900 mb-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
                      Pharmacy
                    </p>
                    <FilterSelect
                      value={cityFilter}
                      onValueChange={updateCity}
                      icon={Building2}
                      label="City"
                      allLabel="All Cities"
                      displayValue={
                        cityFilter === ALL ? "All Cities" : cityFilter
                      }
                      options={cityOptions}
                      secondary
                      searchable
                      searchValue={citySearch}
                      onSearchChange={setCitySearch}
                      searchPlaceholder="Search cities..."
                    />
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
            <>
              <div className="border-gp-border-subtle hidden overflow-hidden rounded-[14px] border bg-white lg:block">
                <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="border-gp-border-subtle text-gp-text-muted sticky top-0 z-10 border-b bg-[#F9FAFB] text-[11px] font-semibold tracking-[0.06em] uppercase">
                      <tr>
                        <th className="w-16 px-4 py-3 font-semibold">#</th>
                        <th className="px-4 py-3 font-semibold">Pharmacy</th>
                        <th className="px-4 py-3 font-semibold">City</th>
                        <th className="px-4 py-3 font-semibold">District</th>
                        <th className="px-4 py-3 font-semibold">Region</th>
                        <th className="px-4 py-3 font-semibold">Territory</th>
                        <th className="px-4 py-3 font-semibold">Country</th>
                        <th className="px-4 py-3 font-semibold">Added</th>
                        <th className="w-44 px-4 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-gp-border-subtle divide-y bg-white">
                      {visibleRows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={cn(
                            "group/row relative transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px motion-reduce:hover:translate-y-0",
                            isRep
                              ? "hover:bg-[#F0FDF4] hover:shadow-[inset_3px_0_0_#168557]"
                              : "hover:bg-[#FFFDF7] hover:shadow-[inset_3px_0_0_#C9A44C]",
                          )}
                        >
                          <td className="text-gp-text-placeholder px-4 py-3.5 text-xs font-semibold">
                            {(directoryPage - 1) * limit + index + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            <PharmacyNameCell row={row} isRep={isRep} />
                          </td>
                          <td className="text-gp-navy-900 px-4 py-3.5">
                            <DataQualityText
                              value={row.city}
                              fallback="Not provided"
                            />
                          </td>
                          <td className="text-gp-text-muted px-4 py-3.5">
                            <DataQualityText
                              value={row.district}
                              fallback="Not assigned"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-gp-navy-900 text-sm font-semibold">
                              {cleanText(row.region, "Not assigned")}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex max-w-[180px] rounded-full border px-2.5 py-1 text-xs font-semibold",
                                isRep
                                  ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                                  : "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
                              )}
                            >
                              <span className="truncate">
                                {getCompactTerritoryLabel(
                                  row.territoryName,
                                  isManager,
                                )}
                              </span>
                            </span>
                          </td>
                          <td className="text-gp-text-muted px-4 py-3.5">
                            <DataQualityText
                              value={row.country}
                              fallback="Saudi Arabia"
                            />
                          </td>
                          <td className="text-gp-text-muted px-4 py-3.5 text-xs font-medium">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                onClick={() => openDetails(row)}
                                className={cn(
                                  "group/details h-9 cursor-pointer rounded-[10px] px-3 text-xs font-semibold text-white transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px",
                                  isRep
                                    ? "bg-[#168557] shadow-[0_4px_14px_rgba(22,133,87,0.22)] hover:bg-[#107349]"
                                    : "bg-gp-navy-900 hover:bg-gp-navy-900/95 shadow-[0_6px_14px_rgba(16,29,54,0.13)]",
                                )}
                              >
                                View Details
                                <ArrowRight
                                  className={cn(
                                    "size-3.5 transition-transform duration-[170ms] group-hover/details:translate-x-0.5",
                                    isRep ? "text-white" : "text-gp-gold-500",
                                  )}
                                />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label={`More actions for ${row.displayName}`}
                                    className={cn(
                                      "inline-flex size-9 cursor-pointer items-center justify-center rounded-[10px] border bg-white transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] hover:-translate-y-px focus-visible:ring-3 focus-visible:outline-none",
                                      isRep
                                        ? "border-gp-border-control text-gp-navy-900 hover:border-[#CBEFDD] hover:bg-[#E9F8F1] focus-visible:ring-[#168557]/25"
                                        : "border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/25",
                                    )}
                                  >
                                    <MoreHorizontal
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="border-gp-border-control shadow-gp-popover min-w-52 rounded-[12px] bg-white p-1"
                                >
                                  <DropdownMenuLabel className="text-gp-text-muted px-2 py-1.5 text-xs font-semibold">
                                    Pharmacy Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onSelect={() => openDetails(row)}
                                    className={cn(
                                      "cursor-pointer rounded-[8px] text-sm font-medium",
                                      isRep
                                        ? "text-gp-navy-900 focus:bg-[#E9F8F1] focus:text-[#168557]"
                                        : "text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900",
                                    )}
                                  >
                                    <Eye
                                      className={cn(
                                        "size-4",
                                        isRep
                                          ? "text-[#168557]"
                                          : "text-gp-gold-600",
                                      )}
                                    />
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => void copyPharmacyId(row)}
                                    className={cn(
                                      "cursor-pointer rounded-[8px] text-sm font-medium",
                                      isRep
                                        ? "text-gp-navy-900 focus:bg-[#E9F8F1] focus:text-[#168557]"
                                        : "text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900",
                                    )}
                                  >
                                    <Copy
                                      className={cn(
                                        "size-4",
                                        isRep
                                          ? "text-[#168557]"
                                          : "text-gp-gold-600",
                                      )}
                                    />
                                    Copy record ID
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {visibleRows.map((row, index) => (
                  <PharmacyMobileCard
                    key={row.id}
                    row={row}
                    index={index}
                    onViewDetails={openDetails}
                    isRep={isRep}
                    isManager={isManager}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="border-gp-border-control bg-gp-surface-card rounded-[14px] border border-dashed px-5 py-10 text-center">
              <span
                className={cn(
                  "mx-auto flex size-12 items-center justify-center rounded-full",
                  isRep
                    ? "bg-[#E9F8F1] text-[#168557]"
                    : "bg-gp-gold-50 text-gp-gold-700",
                )}
              >
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
                  className={cn(
                    "mt-4 h-9 cursor-pointer rounded-[10px] text-xs font-semibold",
                    isRep
                      ? "border-[#CBEFDD] text-[#168557] hover:bg-[#E9F8F1]"
                      : "border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50",
                  )}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        <TablePaginationFooter
          page={directoryPage}
          limit={limit}
          totalCount={directoryTotalCount}
          itemLabel="pharmacies"
          ariaLabel="Pharmacies directory pagination"
          pageNavAriaLabel="Pharmacies pages"
          tone="navy"
        />
      </section>

      <PharmacyDetailsSheet
        pharmacy={selectedPharmacy}
        open={Boolean(selectedPharmacy)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedPharmacy(null);
        }}
        isRep={isRep}
        isManager={isManager}
      />
    </>
  );
}
