"use client";

import type { KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  UserRoundCheck,
  UserSearch,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import type { HRMember } from "../lib/types";
import { HRMemberCard } from "./HRMemberCard";
import { getHRMemberCoverage, getTerritory } from "../lib/utils";
import {
  ALL_TERRITORY_FILTERS,
  TerritoryCoverageFilter,
} from "@/features/geography/components/TerritoryCoverageFilter";
import { getTerritoryLookup } from "@/features/plan/lib/territory";

type HRMembersListProps = {
  members: HRMember[];
  page?: number;
  limit?: number;
  totalCount?: number;
  isCompleteDataset?: boolean;
};

type HRRoleTab = "all" | "supervisors" | "reps";
type HRMemberCoverage = ReturnType<typeof getHRMemberCoverage>;

type RoleTabOption = {
  id: HRRoleTab;
  label: string;
  count: number;
  icon: LucideIcon;
};

type EnrichedHRMember = {
  member: HRMember;
  coverage: HRMemberCoverage;
  districts: string[];
  regions: string[];
  territories: string[];
};

function isRoleTab(value: string | null): value is HRRoleTab {
  return value === "all" || value === "supervisors" || value === "reps";
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function enrichMember(member: HRMember): EnrichedHRMember {
  const coverage = getHRMemberCoverage(member);
  const districts = uniqueValues(
    coverage.territories
      .map(getTerritoryLookup)
      .filter((lookup) => lookup.isKnown)
      .map((lookup) => lookup.district),
  );

  return {
    member,
    coverage,
    districts,
    regions: uniqueValues([coverage.region]),
    territories: coverage.territories,
  };
}

export function HRMembersList({
  members,
  page = 1,
  limit = 10,
  totalCount = 0,
  isCompleteDataset = false,
}: HRMembersListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("hrRole");
  const [tab, setTab] = useState<HRRoleTab>(
    isRoleTab(initialRole) ? initialRole : "all",
  );
  const [query, setQuery] = useState(searchParams.get("hrQuery") || "");
  const [districtFilter, setDistrictFilter] = useState(ALL_TERRITORY_FILTERS);
  const [regionFilter, setRegionFilter] = useState(ALL_TERRITORY_FILTERS);
  const [territoryFilter, setTerritoryFilter] = useState(
    ALL_TERRITORY_FILTERS,
  );
  const tabRefs = useRef<Record<HRRoleTab, HTMLButtonElement | null>>({
    all: null,
    supervisors: null,
    reps: null,
  });
  const enrichedMembers = useMemo(
    () => members.map(enrichMember),
    [members],
  );

  const counts = useMemo(
    () => ({
      all: enrichedMembers.length,
      supervisors: enrichedMembers.filter(
        (entry) => entry.member.role === "SUPERVISOR",
      ).length,
      reps: enrichedMembers.filter(
        (entry) => entry.member.role === "MEDICAL_REP",
      ).length,
    }),
    [enrichedMembers],
  );

  const roleOptions: RoleTabOption[] = [
    { id: "all", label: "All", count: counts.all, icon: UsersRound },
    {
      id: "supervisors",
      label: "Supervisors",
      count: counts.supervisors,
      icon: ShieldCheck,
    },
    {
      id: "reps",
      label: "Medical Reps",
      count: counts.reps,
      icon: UserRoundCheck,
    },
  ];

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return enrichedMembers
      .filter((entry) => {
        const { member } = entry;

      if (tab === "supervisors" && member.role !== "SUPERVISOR") return false;
      if (tab === "reps" && member.role !== "MEDICAL_REP") return false;
        if (
          districtFilter !== ALL_TERRITORY_FILTERS &&
          !entry.districts.includes(districtFilter)
        ) {
          return false;
        }
        if (
          regionFilter !== ALL_TERRITORY_FILTERS &&
          !entry.regions.includes(regionFilter)
        ) {
          return false;
        }
        if (
          territoryFilter !== ALL_TERRITORY_FILTERS &&
          !entry.territories.includes(territoryFilter)
        ) {
          return false;
        }
      if (!term) return true;

      return [
        member.name,
        member.email,
        member.phone,
        member.department,
        member.location,
        member.iqamaNumber,
        member.subRegion?.name,
        member.subRegion?.region?.name,
          entry.coverage.region,
          ...entry.coverage.territories,
        getTerritory(member),
      ].some((value) => value?.toLocaleLowerCase().includes(term));
      })
      .map((entry) => entry.member);
  }, [
    districtFilter,
    enrichedMembers,
    query,
    regionFilter,
    tab,
    territoryFilter,
  ]);

  function syncDirectoryUrl(nextTab: HRRoleTab, nextQuery: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (nextTab === "all") params.delete("hrRole");
    else params.set("hrRole", nextTab);

    if (nextQuery.trim()) params.set("hrQuery", nextQuery);
    else params.delete("hrQuery");

    const nextUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  }

  function selectTab(nextTab: HRRoleTab, shouldFocus = false) {
    setTab(nextTab);
    syncDirectoryUrl(nextTab, query);

    if (shouldFocus) {
      window.requestAnimationFrame(() => tabRefs.current[nextTab]?.focus());
    }
  }

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL_TERRITORY_FILTERS);
    setTerritoryFilter(ALL_TERRITORY_FILTERS);
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL_TERRITORY_FILTERS);
  }

  function updateTerritory(value: string) {
    setTerritoryFilter(value);
  }

  function clearGeographicFilters() {
    updateDistrict(ALL_TERRITORY_FILTERS);
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: HRRoleTab,
  ) {
    const orderedTabs = roleOptions.map((option) => option.id);
    const currentIndex = orderedTabs.indexOf(currentTab);
    let nextTab: HRRoleTab | undefined;

    if (event.key === "Home") nextTab = orderedTabs[0];
    else if (event.key === "End") nextTab = orderedTabs.at(-1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextTab =
        orderedTabs[
          (currentIndex - 1 + orderedTabs.length) % orderedTabs.length
        ];
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextTab = orderedTabs[(currentIndex + 1) % orderedTabs.length];
    }

    if (!nextTab) return;
    event.preventDefault();
    selectTab(nextTab, true);
  }

  const trimmedQuery = query.trim();
  const activeGeographicFilterCount = [
    districtFilter !== ALL_TERRITORY_FILTERS,
    regionFilter !== ALL_TERRITORY_FILTERS,
    territoryFilter !== ALL_TERRITORY_FILTERS,
  ].filter(Boolean).length;
  const hasActiveGeographicFilters = activeGeographicFilterCount > 0;
  const emptyState = hasActiveGeographicFilters
    ? {
        icon: UserSearch,
        title: "No employees match this territory coverage",
        description:
          "No employees match the selected territory coverage and current filters.",
      }
    : trimmedQuery
      ? {
          icon: UserSearch,
          title: "No search results",
          description:
            "Try another name, email, Iqama number, department, or territory.",
        }
      : tab === "supervisors"
        ? {
            icon: ShieldCheck,
            title: "No supervisors found",
            description: "No supervisors are available on this directory page.",
          }
        : tab === "reps"
          ? {
              icon: UserRoundCheck,
              title: "No medical representatives found",
              description:
                "No medical representatives are available on this directory page.",
            }
          : {
              icon: UsersRound,
              title: "No employees found",
              description: "Employee records will appear here when available.",
            };
  const EmptyIcon = emptyState.icon;
  const paginationTotalCount = isCompleteDataset ? filtered.length : totalCount;
  const paginationPage = isCompleteDataset ? 1 : page;

  return (
    <section className="hr-directory hr-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
      <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
          <div className="min-w-0">
            <h2 className="text-gp-navy-900 text-lg font-semibold">
              Employees
            </h2>
            <p
              key={`${tab}-${filtered.length}-${trimmedQuery}`}
              className="hr-count-refresh text-gp-text-muted mt-0.5 text-sm font-medium"
              aria-live="polite"
            >
              {trimmedQuery
                ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"} on this page for "${trimmedQuery}"`
                : `${filtered.length} ${filtered.length === 1 ? "employee" : "employees"} shown on this page`}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter employees by role"
            className="hr-role-tabs border-gp-border-control bg-gp-surface-control grid min-w-0 grid-cols-3 self-start rounded-[12px] border p-1 lg:self-center"
          >
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = tab === option.id;

              return (
                <button
                  key={option.id}
                  ref={(element) => {
                    tabRefs.current[option.id] = element;
                  }}
                  type="button"
                  role="tab"
                  id={`hr-role-tab-${option.id}`}
                  aria-selected={isSelected}
                  aria-controls="hr-employee-results"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => selectTab(option.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, option.id)}
                  className={`hr-role-tab focus-visible:ring-gp-gold-500/25 relative flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-[190ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm ${
                    isSelected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                      : "text-gp-text-muted hover:text-gp-navy-900 border border-transparent hover:bg-gp-navy-900/5"
                  }`}
                >
                  <Icon
                    className={cn(
                      "hidden size-3.5 shrink-0 sm:block",
                      isSelected && "text-gp-gold-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                  <span
                    className={cn(
                      "hr-tab-count inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[190ms]",
                      isSelected
                        ? "text-gp-gold-500 bg-white/10"
                        : "bg-gp-border-subtle text-gp-text-muted",
                    )}
                  >
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hr-search-field relative w-full max-w-full lg:max-w-md lg:ml-auto">
            <Search
              className="hr-search-icon text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                syncDirectoryUrl(tab, nextQuery);
              }}
              placeholder="Search employees..."
              aria-label="Search employees by name, email, Iqama, department, or territory"
              className="hr-search-input border-gp-border-control bg-gp-surface-card text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 rounded-[10px] pr-10 pl-10 text-sm font-medium shadow-none lg:h-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  syncDirectoryUrl(tab, "");
                }}
                aria-label="Clear employee search"
                className="text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-gp-navy-900 mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
            <SlidersHorizontal
              className="text-gp-gold-600 size-3.5"
              aria-hidden="true"
            />
            Filters
            {hasActiveGeographicFilters && (
              <span className="bg-gp-navy-900 text-gp-gold-500 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-5">
                {activeGeographicFilterCount}
              </span>
            )}
          </div>
          <TerritoryCoverageFilter
            district={districtFilter}
            region={regionFilter}
            territory={territoryFilter}
            onDistrictChange={updateDistrict}
            onRegionChange={updateRegion}
            onTerritoryChange={updateTerritory}
          />
        </div>
      </header>

      <div
        key={tab}
        id="hr-employee-results"
        role="tabpanel"
        aria-labelledby={`hr-role-tab-${tab}`}
        className="hr-results-transition p-4 sm:p-5"
      >
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {filtered.map((member, index) => (
              <HRMemberCard
                key={member.id}
                member={member}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="hr-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-10 text-center">
            <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-12 items-center justify-center rounded-full">
              <EmptyIcon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-4 text-base font-semibold">
              {emptyState.title}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-2 max-w-md text-sm leading-6 font-medium">
              {emptyState.description}
            </p>
            {hasActiveGeographicFilters && (
              <button
                type="button"
                onClick={clearGeographicFilters}
                className="border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/25 mx-auto mt-4 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border bg-white px-3 text-xs font-semibold transition-[background-color,border-color,color] duration-[150ms] focus-visible:ring-2 focus-visible:outline-none"
              >
                Clear geographic filters
              </button>
            )}
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={paginationPage}
        limit={limit}
        totalCount={paginationTotalCount}
        itemLabel="employees"
        ariaLabel="Employee directory pagination"
        pageNavAriaLabel="Employee directory pages"
        tone="navy"
      />
    </section>
  );
}
