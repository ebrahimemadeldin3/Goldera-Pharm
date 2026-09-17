"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import TeamCard from "@/features/team/components/TeamCard";
import { Input } from "@/components/ui/input";
import {
  ArrowDownAZ,
  CheckCircle2,
  RotateCcw,
  Search as SearchIcon,
  ShieldCheck,
  SlidersHorizontal,
  UserSearch,
  UserRoundCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "../lib/types";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { cn } from "@/lib/utils";
import {
  ALL_TERRITORY_FILTERS,
  TerritoryCoverageFilter,
} from "@/features/geography/components/TerritoryCoverageFilter";
import { getTeamMemberAssignment } from "../lib/utils";

type TeamSummary = {
  totalMembers: number;
  repsCount: number;
  supervisorsCount: number;
  activeMembers: number;
  coverageCount: number;
};

type TeamListProps = {
  members: User[];
  medicalReps?: User[];
  supervisors?: User[];
  stats?: {
    totalMembers: number;
    supervisorsCount: number;
    repsCount: number;
  };
  page?: number;
  limit?: number;
  totalCount?: number;
  medicalRepsTotalCount?: number;
  supervisorsTotalCount?: number;
  baseUrl?: string;
  onSummaryChange?: (summary: TeamSummary) => void;
};

type TeamRoleTab = "all" | "supervisors" | "reps";
type StatusFilter = "all" | "active" | "inactive";
type SortFilter = "name-asc" | "name-desc" | "newest" | "oldest";

type TeamTypeOption = {
  id: TeamRoleTab;
  label: string;
  count: number;
  icon: LucideIcon;
};

type EnrichedMember = {
  member: User;
  roleLabel: string;
  employeeId: string;
  reportsTo: string;
  district: string;
  region: string;
  territory: string;
  territories: string[];
  territoryAssigned: boolean;
  joinedTime: number;
};

const pageSizeOptions = [10, 20, 50];

const selectTriggerClassName =
  "team-filter-trigger border-gp-border-control bg-white text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus:ring-gp-gold-500/15 h-11 cursor-pointer rounded-[12px] text-sm font-semibold shadow-none transition-[background-color,border-color,box-shadow,color] duration-[170ms] focus:ring-[3px] focus:ring-offset-0 data-[state=open]:border-gp-gold-400 data-[state=open]:bg-gp-gold-50 disabled:cursor-not-allowed disabled:bg-gp-surface-subtle disabled:text-gp-text-placeholder disabled:opacity-75 [&_svg]:text-gp-gold-700";

const selectContentClassName =
  "border-gp-border-default shadow-gp-popover max-h-72 rounded-[12px] bg-white p-1 text-gp-text-primary";

const selectItemClassName =
  "cursor-pointer rounded-[8px] text-sm font-medium text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:text-gp-navy-900";

function getRoleLabel(member: User) {
  if (member.role === "SUPERVISOR") return "Supervisor";
  if (member.role === "MEDICAL_REP") return "Medical Representative";
  return "Manager";
}

function getJoinedTime(member: User) {
  const date = new Date(
    member.joinedDate || member.dateOfRecruitment || member.createdAt || "",
  );
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function enrichMember(member: User): EnrichedMember {
  const assignment = getTeamMemberAssignment(member);

  return {
    member,
    roleLabel: getRoleLabel(member),
    employeeId: member.employeeId || "",
    reportsTo: assignment.reportsTo,
    district: assignment.district,
    region: assignment.region,
    territory: assignment.territory,
    territories: assignment.territories,
    territoryAssigned: assignment.hasTerritory,
    joinedTime: getJoinedTime(member),
  };
}

function matchesSearch(entry: EnrichedMember, search: string) {
  if (!search) return true;

  return [
    entry.member.name,
    entry.member.email,
    entry.member.phone,
    entry.employeeId,
    entry.member.iqama,
    entry.member.passport,
    entry.roleLabel,
    entry.reportsTo,
    entry.district,
    entry.region,
    entry.territory,
    ...entry.territories,
  ].some((value) => value?.toLowerCase().includes(search));
}

function sortMembers(entries: EnrichedMember[], sortFilter: SortFilter) {
  return [...entries].sort((first, second) => {
    if (sortFilter === "name-desc") {
      return second.member.name.localeCompare(first.member.name);
    }
    if (sortFilter === "newest") {
      return second.joinedTime - first.joinedTime;
    }
    if (sortFilter === "oldest") {
      return first.joinedTime - second.joinedTime;
    }

    return first.member.name.localeCompare(second.member.name);
  });
}

export default function TeamList({
  members,
  medicalReps,
  supervisors,
  page = 1,
  limit = 10,
  totalCount,
  medicalRepsTotalCount = 0,
  supervisorsTotalCount = 0,
  baseUrl = "/manager/team",
  onSummaryChange,
}: TeamListProps) {
  const { role } = useRoleUI();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TeamRoleTab>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [districtFilter, setDistrictFilter] = useState(ALL_TERRITORY_FILTERS);
  const [regionFilter, setRegionFilter] = useState(ALL_TERRITORY_FILTERS);
  const [territoryFilter, setTerritoryFilter] = useState(
    ALL_TERRITORY_FILTERS,
  );
  const [sortFilter, setSortFilter] = useState<SortFilter>("name-asc");
  const [currentPage, setCurrentPage] = useState(Math.max(1, page));
  const [rowsPerPage, setRowsPerPage] = useState(
    pageSizeOptions.includes(limit) ? limit : 10,
  );
  const tabRefs = useRef<Record<TeamRoleTab, HTMLButtonElement | null>>({
    all: null,
    supervisors: null,
    reps: null,
  });

  const isManager = role === "MANAGER";
  const allManagerMembers = useMemo(
    () => [...(supervisors || []), ...(medicalReps || [])],
    [medicalReps, supervisors],
  );
  const sourceMembers = isManager ? allManagerMembers : members;
  const enrichedMembers = useMemo(
    () => sourceMembers.map(enrichMember),
    [sourceMembers],
  );
  const trimmedSearchQuery = searchQuery.trim();
  const search = trimmedSearchQuery.toLowerCase();

  const scopedEntries = useMemo(
    () =>
      enrichedMembers.filter((entry) => {
        if (statusFilter === "active" && !entry.member.isActive) return false;
        if (statusFilter === "inactive" && entry.member.isActive) return false;
        if (
          districtFilter !== ALL_TERRITORY_FILTERS &&
          entry.district !== districtFilter
        ) {
          return false;
        }
        if (
          regionFilter !== ALL_TERRITORY_FILTERS &&
          entry.region !== regionFilter
        ) {
          return false;
        }
        if (
          territoryFilter !== ALL_TERRITORY_FILTERS &&
          !entry.territories.includes(territoryFilter)
        ) {
          return false;
        }

        return matchesSearch(entry, search);
      }),
    [
      districtFilter,
      enrichedMembers,
      regionFilter,
      search,
      statusFilter,
      territoryFilter,
    ],
  );

  const roleCounts = useMemo(
    () => ({
      all: scopedEntries.length,
      supervisors: scopedEntries.filter(
        (entry) => entry.member.role === "SUPERVISOR",
      ).length,
      reps: scopedEntries.filter((entry) => entry.member.role === "MEDICAL_REP")
        .length,
    }),
    [scopedEntries],
  );

  const roleScopedEntries = useMemo(() => {
    if (!isManager || activeTab === "all") return scopedEntries;
    if (activeTab === "reps") {
      return scopedEntries.filter((entry) => entry.member.role === "MEDICAL_REP");
    }

    return scopedEntries.filter((entry) => entry.member.role === "SUPERVISOR");
  }, [activeTab, isManager, scopedEntries]);

  const filteredEntries = useMemo(
    () => sortMembers(roleScopedEntries, sortFilter),
    [roleScopedEntries, sortFilter],
  );
  const totalFilteredMembers = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredMembers / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedEntries = filteredEntries.slice(
    pageStartIndex,
    pageStartIndex + rowsPerPage,
  );
  const paginatedMembers = paginatedEntries.map((entry) => entry.member);
  const filteredSummary = useMemo<TeamSummary>(
    () => ({
      totalMembers: scopedEntries.length,
      repsCount: scopedEntries.filter(
        (entry) => entry.member.role === "MEDICAL_REP",
      ).length,
      supervisorsCount: scopedEntries.filter(
        (entry) => entry.member.role === "SUPERVISOR",
      ).length,
      activeMembers: scopedEntries.filter((entry) => entry.member.isActive)
        .length,
      coverageCount: new Set(
        scopedEntries
          .filter((entry) => entry.territoryAssigned)
          .flatMap((entry) => entry.territories),
      ).size,
    }),
    [scopedEntries],
  );

  useEffect(() => {
    onSummaryChange?.(filteredSummary);
  }, [filteredSummary, onSummaryChange]);

  const activeTabIndex = [
    "all",
    "supervisors",
    "reps",
  ].indexOf(activeTab);
  const activeMemberLabel = isManager
    ? activeTab === "all"
      ? "team members"
      : activeTab === "reps"
        ? "medical reps"
        : "supervisors"
    : "team members";
  const loadedTotal = isManager
    ? medicalRepsTotalCount + supervisorsTotalCount || allManagerMembers.length
    : (totalCount ?? members.length);
  const resultSummary = trimmedSearchQuery
    ? `${paginatedMembers.length} shown of ${totalFilteredMembers} matching "${trimmedSearchQuery}"`
    : `${paginatedMembers.length} shown on this page of ${totalFilteredMembers} ${activeMemberLabel}`;
  const teamTypeOptions: TeamTypeOption[] = isManager
    ? [
        { id: "all", label: "All", count: roleCounts.all, icon: UsersRound },
        {
          id: "supervisors",
          label: "Supervisors",
          count: roleCounts.supervisors,
          icon: ShieldCheck,
        },
        {
          id: "reps",
          label: "Medical Reps",
          count: roleCounts.reps,
          icon: UserRoundCheck,
        },
      ]
    : [];

  function selectTeamType(nextTab: TeamRoleTab, shouldFocus = false) {
    setActiveTab(nextTab);
    setCurrentPage(1);

    if (shouldFocus) {
      window.requestAnimationFrame(() => {
        tabRefs.current[nextTab]?.focus();
      });
    }
  }

  function handleTypeKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: TeamRoleTab,
  ) {
    if (!isManager) return;

    const orderedTabs = teamTypeOptions.map((option) => option.id);
    const currentIndex = orderedTabs.indexOf(currentTab);
    let nextTab: TeamRoleTab | undefined;

    if (event.key === "Home") {
      nextTab = orderedTabs[0];
    } else if (event.key === "End") {
      nextTab = orderedTabs[orderedTabs.length - 1];
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextTab =
        orderedTabs[
          (currentIndex - 1 + orderedTabs.length) % orderedTabs.length
        ];
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextTab = orderedTabs[(currentIndex + 1) % orderedTabs.length];
    }

    if (!nextTab) return;

    event.preventDefault();
    selectTeamType(nextTab, true);
  }

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL_TERRITORY_FILTERS);
    setTerritoryFilter(ALL_TERRITORY_FILTERS);
    setCurrentPage(1);
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL_TERRITORY_FILTERS);
    setCurrentPage(1);
  }

  function updateStatus(value: StatusFilter) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function updateTerritory(value: string) {
    setTerritoryFilter(value);
    setCurrentPage(1);
  }

  function updateSearch(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function updateSort(value: SortFilter) {
    setSortFilter(value);
    setCurrentPage(1);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setActiveTab("all");
    setStatusFilter("all");
    setDistrictFilter(ALL_TERRITORY_FILTERS);
    setRegionFilter(ALL_TERRITORY_FILTERS);
    setTerritoryFilter(ALL_TERRITORY_FILTERS);
    setSortFilter("name-asc");
    setCurrentPage(1);
  }

  const activeChips = [
    trimmedSearchQuery
      ? {
          id: "search",
          label: `Search: ${trimmedSearchQuery}`,
          onClear: () => updateSearch(""),
        }
      : null,
    statusFilter !== "all"
      ? {
          id: "status",
          label: statusFilter === "active" ? "Active" : "Inactive",
          onClear: () => updateStatus("all"),
        }
      : null,
    districtFilter !== ALL_TERRITORY_FILTERS
      ? {
          id: "district",
          label: districtFilter,
          onClear: () => updateDistrict(ALL_TERRITORY_FILTERS),
        }
      : null,
    regionFilter !== ALL_TERRITORY_FILTERS
      ? {
          id: "region",
          label: regionFilter,
          onClear: () => updateRegion(ALL_TERRITORY_FILTERS),
        }
      : null,
    territoryFilter !== ALL_TERRITORY_FILTERS
      ? {
          id: "territory",
          label: territoryFilter,
          onClear: () => updateTerritory(ALL_TERRITORY_FILTERS),
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; onClear: () => void }>;

  const emptyState = (() => {
    if (activeChips.length > 0) {
      return {
        icon: UserSearch,
        title: "No team members match your filters",
        description: "Try adjusting your search or filters.",
      };
    }

    if (isManager && activeTab === "supervisors") {
      return {
        icon: ShieldCheck,
        title: "No supervisors found",
        description: "No supervisors are available.",
      };
    }

    if (isManager && activeTab === "reps") {
      return {
        icon: UserRoundCheck,
        title: "No medical representatives found",
        description: "No medical representatives are available.",
      };
    }

    return {
      icon: UsersRound,
      title: loadedTotal === 0 ? "No team members are available" : "No team members found",
      description:
        loadedTotal === 0
          ? "Team members will appear here when available."
          : "Team members will appear here when they match the selected scope.",
    };
  })();
  const EmptyIcon = emptyState.icon;

  return (
    <section className="team-directory-panel team-page-enter border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
      <header className="team-directory-header border-gp-border-subtle bg-white border-b px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(360px,460px)_minmax(260px,380px)] xl:items-center">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="team-directory-icon border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-10 shrink-0 items-center justify-center rounded-[10px] border">
                  <UsersRound className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="team-directory-eyebrow text-gp-gold-700 text-[11px] font-semibold tracking-[0.08em] uppercase">
                    Team Directory
                  </p>
                  <h2 className="team-directory-title text-gp-navy-900 mt-1 text-lg font-semibold">
                    Team Members
                  </h2>
                  <p
                    key={`${activeTab}-${paginatedMembers.length}-${totalFilteredMembers}-${trimmedSearchQuery}-${statusFilter}-${districtFilter}-${regionFilter}-${territoryFilter}`}
                    className="team-directory-summary team-count-refresh text-gp-text-muted mt-1 text-sm font-medium"
                    aria-live="polite"
                  >
                    {resultSummary}
                  </p>
                </div>
              </div>
            </div>

            {isManager && (
              <div
                role="tablist"
                aria-label="Team type"
                className="team-type-switch border-gp-border-control bg-gp-surface-control relative grid min-w-0 grid-cols-3 items-center overflow-hidden rounded-[13px] border p-1"
                style={
                  {
                    "--team-type-index": Math.max(activeTabIndex, 0),
                    "--team-type-count": teamTypeOptions.length,
                  } as CSSProperties
                }
              >
                <span className="team-type-indicator" aria-hidden="true" />
                {teamTypeOptions.map((option) => {
                  const isActive = activeTab === option.id;
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.id}
                      id={`team-type-tab-${option.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="team-directory-grid"
                      tabIndex={isActive ? 0 : -1}
                      ref={(button) => {
                        tabRefs.current[option.id] = button;
                      }}
                      onClick={() => selectTeamType(option.id)}
                      onKeyDown={(event) => handleTypeKeyDown(event, option.id)}
                      className={cn(
                        "team-type-tab focus-visible:ring-gp-gold-500/30 relative z-10 flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,color,transform] duration-[160ms] ease-out outline-none focus-visible:ring-3 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:text-sm",
                        isActive
                          ? "text-white"
                          : "text-gp-text-muted hover:text-gp-navy-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "team-type-tab-icon hidden size-3.5 shrink-0 sm:block",
                          isActive ? "text-gp-gold-500" : "text-gp-text-muted",
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{option.label}</span>
                      <span
                        className={cn(
                          "team-tab-count inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-none font-bold",
                          isActive
                            ? "bg-white/10 text-gp-gold-500"
                            : "bg-gp-border-subtle text-gp-text-muted",
                        )}
                      >
                        {option.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="team-search-field relative min-w-0 xl:ml-auto xl:w-full">
              <SearchIcon
                className="team-search-icon text-gp-text-secondary pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                placeholder="Search name, email, ID, territory..."
                aria-label="Search team members by name, email, ID, role, territory or supervisor"
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                className="team-search-input border-gp-border-control text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:bg-gp-surface-hover h-11 rounded-[12px] border bg-white pr-10 pl-10 text-sm font-medium shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] outline-none focus-visible:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateSearch("")}
                  aria-label="Clear team search"
                  className="team-search-clear text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full transition-[background-color,color] duration-[150ms] focus-visible:ring-2 focus-visible:outline-none"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="team-directory-controls space-y-3">
            <div className="text-gp-navy-900 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
              <SlidersHorizontal
                className="text-gp-gold-600 size-3.5"
                aria-hidden="true"
              />
              Filters
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,220px)_minmax(0,220px)]">
              <Select
                value={statusFilter}
                onValueChange={(value) => updateStatus(value as StatusFilter)}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  <SelectItem value="all" className={selectItemClassName}>
                    All Statuses
                  </SelectItem>
                  <SelectItem value="active" className={selectItemClassName}>
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className={selectItemClassName}>
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortFilter}
                onValueChange={(value) => updateSort(value as SortFilter)}
              >
                <SelectTrigger className={selectTriggerClassName}>
                  <ArrowDownAZ className="size-4" aria-hidden="true" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className={selectContentClassName}>
                  <SelectItem value="name-asc" className={selectItemClassName}>
                    Name A-Z
                  </SelectItem>
                  <SelectItem value="name-desc" className={selectItemClassName}>
                    Name Z-A
                  </SelectItem>
                  <SelectItem value="newest" className={selectItemClassName}>
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className={selectItemClassName}>
                    Oldest
                  </SelectItem>
                </SelectContent>
              </Select>
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
        </div>
      </header>

      {activeChips.length > 0 && (
        <div className="team-search-scope border-gp-border-subtle bg-gp-surface-subtle border-b px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={chip.onClear}
                  className="team-filter-chip border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900 hover:border-gp-gold-400 hover:bg-white focus-visible:ring-gp-gold-500/25 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,transform] duration-[150ms] hover:-translate-y-px focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="truncate">{chip.label}</span>
                  <X
                    className="text-gp-text-secondary size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-gp-navy-900 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/25 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-[background-color,color] duration-[150ms] focus-visible:ring-2 focus-visible:outline-none"
            >
              <RotateCcw
                className="size-3.5 text-gp-gold-700"
                aria-hidden="true"
              />
              Clear all
            </button>
          </div>
        </div>
      )}

      <div
        id="team-directory-grid"
        role="tabpanel"
        aria-labelledby={isManager ? `team-type-tab-${activeTab}` : undefined}
        key={`${activeTab}-${statusFilter}-${districtFilter}-${regionFilter}-${territoryFilter}-${sortFilter}-${safeCurrentPage}-${rowsPerPage}`}
        className="team-tab-swap p-4 sm:p-5"
      >
        {paginatedMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {paginatedMembers.map((member, index) => (
              <TeamCard
                key={member.id}
                member={member}
                baseUrl={baseUrl}
                animationIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="team-empty-state border-gp-border-control bg-gp-surface-subtle rounded-[14px] border border-dashed px-5 py-10 text-center">
            <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-12 items-center justify-center rounded-full border">
              <EmptyIcon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="text-gp-navy-900 mt-4 text-base font-semibold">
              {emptyState.title}
            </h3>
            <p className="text-gp-text-muted mx-auto mt-2 max-w-[360px] text-sm leading-6 font-medium">
              {emptyState.description}
            </p>
            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="bg-gp-navy-900 hover:bg-gp-navy-850 focus-visible:ring-gp-gold-500/25 mx-auto mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px focus-visible:ring-3 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <SlidersHorizontal
                  className="size-4 text-gp-gold-500"
                  aria-hidden="true"
                />
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      <TablePaginationFooter
        page={safeCurrentPage}
        limit={rowsPerPage}
        totalCount={totalFilteredMembers}
        itemLabel={activeMemberLabel}
        ariaLabel="Team directory pagination"
        pageNavAriaLabel="Team directory pages"
        pageSizeOptions={pageSizeOptions}
        onPageChange={setCurrentPage}
        onPageSizeChange={(nextPageSize) => {
          setRowsPerPage(nextPageSize);
          setCurrentPage(1);
        }}
        tone="navy"
      />
    </section>
  );
}
