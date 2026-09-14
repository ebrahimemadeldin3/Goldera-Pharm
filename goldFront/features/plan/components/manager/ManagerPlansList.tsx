"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleSlash,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  Layers3,
  Map,
  MapPin,
  MapPinned,
  PieChart,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Target,
  UserRound,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/lib/utils/toast";
import type { Doctor, VisitPlan } from "@/features/plan/api/get";
import {
  rejectPlanAction,
  updatePlanStatusAction,
} from "@/features/plan/api/handle";
import { planTypeConfig } from "@/features/plan/lib/constants";
import {
  KSA_TERRITORY_STRUCTURE,
  type DistrictGroup,
  type RegionGroup,
  type TerritoryAnalytics,
  type TerritoryDoctor,
  type TerritoryGroup,
  getPlanTerritoryAnalytics,
  planContainsTerritoryFilter,
} from "@/features/plan/lib/territory";
import type { PlanStatus, VisitPlanType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Textarea } from "@/components/ui/textarea";
import { cn, getInitials } from "@/lib/utils";

type ManagerPlansListProps = {
  plans: VisitPlan[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type TabType = "all" | PlanStatus;
type SortKey =
  | "newest"
  | "oldest"
  | "mostDoctors"
  | "fewestDoctors"
  | "repAz";
type DrawerTab = "overview" | "territory" | "doctors";
type ConfirmState =
  | { type: "approve"; plan: VisitPlan }
  | { type: "reject"; plan: VisitPlan }
  | null;

const ALL = "all";
const DOCTOR_BATCH_SIZE = 16;
const TERRITORY_DOCTOR_BATCH_SIZE = 10;

const statusTabs: Array<{
  id: TabType;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "all", label: "All", icon: ClipboardList },
  { id: "PENDING", label: "Pending", icon: Clock3 },
  { id: "APPROVED", label: "Approved", icon: CheckCircle2 },
  { id: "REJECTED", label: "Rejected", icon: XCircle },
];

const drawerTabs: Array<{ id: DrawerTab; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "territory", label: "Territory Coverage", icon: MapPinned },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
];

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "mostDoctors", label: "Most Doctors" },
  { value: "fewestDoctors", label: "Fewest Doctors" },
  { value: "repAz", label: "Representative A-Z" },
];

const regionChartColors = [
  "#C9A44C",
  "#B18732",
  "#101D36",
  "#667085",
  "#D8B85A",
  "#344054",
];

const statusTone: Record<
  PlanStatus,
  {
    badge: string;
    rail: string;
    dot: string;
    kpi: string;
  }
> = {
  PENDING: {
    badge: "border-gp-warning-border bg-gp-warning-soft text-gp-gold-700",
    rail: "bg-gp-gold-500",
    dot: "bg-gp-gold-500",
    kpi: "border-gp-warning-border bg-gp-warning-soft text-gp-gold-700",
  },
  APPROVED: {
    badge: "border-gp-success-border bg-gp-success-soft text-gp-success",
    rail: "bg-gp-success",
    dot: "bg-gp-success",
    kpi: "border-gp-success-border bg-gp-success-soft text-gp-success",
  },
  REJECTED: {
    badge: "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
    rail: "bg-gp-danger",
    dot: "bg-gp-danger",
    kpi: "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
  },
};

function getRepName(plan: VisitPlan) {
  return plan.rep?.name || plan.createdBy?.name || "Unknown Representative";
}

function getSelectedDoctorsCount(plan: VisitPlan) {
  return plan.selectedDoctors?.length ?? 0;
}

function getCoverage(plan: VisitPlan) {
  const targetDoctors = plan.targetDoctors ?? 0;
  const selectedDoctors = getSelectedDoctorsCount(plan);

  if (targetDoctors <= 0) return null;

  return Math.min(100, (selectedDoctors / targetDoctors) * 100);
}

function formatCoverage(value: number | null) {
  return value === null ? "N/A" : `${value.toFixed(1)}%`;
}

function formatPercent(count: number, total: number) {
  if (total <= 0) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

function planDateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPeriod(plan: VisitPlan) {
  if (!plan.startDate && !plan.endDate) return "Period not set";
  if (!plan.endDate) return plan.startDate;
  if (!plan.startDate) return plan.endDate;
  return `${plan.startDate} - ${plan.endDate}`;
}

function getDoctorName(doctor: Doctor) {
  return doctor.nameEN || doctor.nameAR || "Unnamed doctor";
}

function getDoctorFacility(doctor: Doctor) {
  return doctor.accountName || "Unassigned facility";
}

function searchableDoctorText(entry: TerritoryDoctor) {
  const { doctor, territory } = entry;

  return [
    doctor.nameEN,
    doctor.nameAR,
    doctor.specialty,
    doctor.accountName,
    doctor.subRegion,
    doctor.area,
    territory.territory,
    territory.region,
    territory.district,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesNormalized(value: string | undefined, query: string) {
  return String(value ?? "").toLowerCase().includes(query);
}

function getPlanTerritoryText(plan: VisitPlan) {
  const analytics = getPlanTerritoryAnalytics(plan.selectedDoctors);

  return [
    analytics.districtCount ? `${analytics.districtCount} Districts` : null,
    analytics.regionCount ? `${analytics.regionCount} Regions` : null,
    analytics.territoryCount ? `${analytics.territoryCount} Territories` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function getMainFilterOptions(
  plans: VisitPlan[],
  districtFilter: string,
  regionFilter: string,
) {
  const analytics = plans.map((plan) =>
    getPlanTerritoryAnalytics(plan.selectedDoctors),
  );
  const districts = uniqueSorted(
    analytics.flatMap((item) => item.districts.map((district) => district.name)),
  );
  const regions = uniqueSorted(
    analytics.flatMap((item) =>
      item.regions
        .filter(
          (region) =>
            districtFilter === ALL || region.district === districtFilter,
        )
        .map((region) => region.name),
    ),
  );
  const territories = uniqueSorted(
    analytics.flatMap((item) =>
      item.territories
        .filter((territory) => {
          if (
            districtFilter !== ALL &&
            territory.territory.district !== districtFilter
          ) {
            return false;
          }
          if (regionFilter !== ALL && territory.territory.region !== regionFilter) {
            return false;
          }
          return true;
        })
        .map((territory) => territory.name),
    ),
  );

  return { districts, regions, territories };
}

function getDrawerFilterOptions(
  analytics: TerritoryAnalytics,
  districtFilter: string,
  regionFilter: string,
) {
  const districts = analytics.districts.map((district) => district.name);
  const regions = uniqueSorted(
    analytics.regions
      .filter(
        (region) => districtFilter === ALL || region.district === districtFilter,
      )
      .map((region) => region.name),
  );
  const territories = uniqueSorted(
    analytics.territories
      .filter((territory) => {
        if (
          districtFilter !== ALL &&
          territory.territory.district !== districtFilter
        ) {
          return false;
        }
        if (regionFilter !== ALL && territory.territory.region !== regionFilter) {
          return false;
        }
        return true;
      })
      .map((territory) => territory.name),
  );

  return { districts, regions, territories };
}

function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase",
        statusTone[status].badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusTone[status].dot)} />
      {status}
    </span>
  );
}

function PlanTypeBadge({ type }: { type: VisitPlanType }) {
  return (
    <span className="border-gp-border-control bg-gp-surface-control text-gp-navy-900 inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[11px] leading-4 font-semibold tracking-[0.04em] uppercase">
      {planTypeConfig[type]?.label || type}
    </span>
  );
}

function PlanCoverage({ value }: { value: number | null }) {
  const width = value === null ? 0 : Math.max(0, Math.min(100, value));

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
          Doctor Coverage
        </span>
        <span className="text-gp-navy-900 text-xs font-semibold">
          {formatCoverage(value)}
        </span>
      </div>
      <div
        className="bg-gp-border-subtle h-2 overflow-hidden rounded-full"
        aria-label={`Doctor coverage ${formatCoverage(value)}`}
        role="progressbar"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(width)}
      >
        <span
          className="plans-progress-fill bg-gp-gold-500 block h-full rounded-full transition-[width] duration-[650ms] ease-out motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle flex min-w-0 items-center gap-2 rounded-[10px] border px-3 py-2">
      <span className="text-gp-gold-600 bg-gp-gold-50 flex size-8 shrink-0 items-center justify-center rounded-[8px]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-gp-text-muted truncate text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </p>
        <p className="text-gp-navy-900 text-sm leading-5 font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
  index,
}: {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone?: "neutral" | PlanStatus;
  index: number;
}) {
  const toneClass =
    tone === "neutral"
      ? "border-gp-border-control bg-gp-surface-control text-gp-navy-900"
      : statusTone[tone].kpi;

  return (
    <Card
      className="border-gp-border-default bg-gp-surface-card shadow-gp-card gap-0 rounded-[14px] py-0 opacity-0 [animation:plans-card-in_350ms_ease-out_forwards] motion-reduce:opacity-100 motion-reduce:[animation:none]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px] border",
            toneClass,
          )}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-gp-text-muted truncate text-[11px] font-semibold tracking-[0.06em] uppercase">
            {label}
          </p>
          <p className="text-gp-navy-900 mt-1 text-2xl leading-none font-semibold">
            {value.toLocaleString()}
          </p>
          <p className="text-gp-text-placeholder mt-1 truncate text-xs font-medium">
            {helper}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TerritoryTooltip({
  title,
  lines,
  count,
  total,
  representative,
}: {
  title: string;
  lines: string[];
  count: number;
  total: number;
  representative?: string;
}) {
  return (
    <span className="plans-territory-tooltip pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[248px] -translate-x-1/2 rounded-[12px] border border-gp-border-default bg-white p-3 text-left shadow-gp-popover group-hover/territory:block group-focus-within/territory:block">
      <span className="text-gp-navy-900 block text-xs font-bold tracking-[0.06em] uppercase">
        {title}
      </span>
      {lines.map((line) => (
        <span
          key={line}
          className="text-gp-text-muted mt-1 block text-xs font-medium"
        >
          {line}
        </span>
      ))}
      <span className="border-gp-border-subtle mt-2 block border-t pt-2 text-xs font-semibold text-gp-navy-900">
        {count.toLocaleString()} selected doctors
      </span>
      <span className="text-gp-text-muted mt-1 block text-xs font-medium">
        {formatPercent(count, total)} of this plan
      </span>
      {representative && (
        <span className="text-gp-text-muted mt-2 block truncate text-xs font-medium">
          Representative:{" "}
          <strong className="text-gp-navy-900">{representative}</strong>
        </span>
      )}
    </span>
  );
}

function PlanCardTerritorySummary({
  plan,
  analytics,
}: {
  plan: VisitPlan;
  analytics: TerritoryAnalytics;
}) {
  const topTerritories = analytics.territories.slice(0, 3);
  const remaining = Math.max(0, analytics.territories.length - 3);

  return (
    <div className="group/territory relative inline-flex min-w-0 items-center gap-2 rounded-[10px] px-1 py-0.5">
      <MapPinned className="text-gp-gold-600 size-4 shrink-0" aria-hidden="true" />
      <span className="text-gp-text-muted truncate text-xs font-medium">
        {analytics.territoryCount > 4
          ? `${analytics.districtCount} Districts | ${analytics.regionCount} Regions | ${analytics.territoryCount} Territories`
          : `${analytics.territoryCount} Territories: ${topTerritories
              .map((territory) => territory.name)
              .join(" | ")}${remaining > 0 ? ` | +${remaining}` : ""}`}
      </span>
      <TerritoryTooltip
        title="Territory Scope"
        lines={analytics.districts.map(
          (district) =>
            `${district.name}: ${district.doctors.length.toLocaleString()} doctors`,
        )}
        count={analytics.totalDoctors}
        total={analytics.totalDoctors}
        representative={getRepName(plan)}
      />
    </div>
  );
}

function PlanCard({
  plan,
  index,
  onViewDetails,
  onConfirm,
  disabled,
}: {
  plan: VisitPlan;
  index: number;
  onViewDetails: (plan: VisitPlan) => void;
  onConfirm: (state: ConfirmState) => void;
  disabled: boolean;
}) {
  const repName = getRepName(plan);
  const selectedDoctors = useMemo(
    () => plan.selectedDoctors ?? [],
    [plan.selectedDoctors],
  );
  const selectedDoctorsCount = selectedDoctors.length;
  const coverage = getCoverage(plan);
  const analytics = useMemo(
    () => getPlanTerritoryAnalytics(selectedDoctors),
    [selectedDoctors],
  );
  const previewDoctors = selectedDoctors.slice(0, 3);
  const remainingDoctors = Math.max(
    0,
    selectedDoctorsCount - previewDoctors.length,
  );
  const objectivesPreview =
    plan.objectives?.length > 0
      ? plan.objectives.join(" | ")
      : plan.description || "No objectives provided.";

  return (
    <article
      className="group/plan border-gp-border-default bg-gp-surface-card shadow-gp-card relative overflow-hidden rounded-[14px] border opacity-0 transition-[border-color,box-shadow,transform] duration-[200ms] ease-out [animation:plans-card-in_350ms_ease-out_forwards] hover:-translate-y-0.5 hover:border-gp-gold-300 hover:shadow-[0_10px_26px_rgba(16,27,51,0.09)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none motion-reduce:[animation:none]"
      style={{ animationDelay: `${Math.min(index, 9) * 40}ms` } as CSSProperties}
    >
      <span
        className={cn(
          "absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full",
          statusTone[plan.status].rail,
        )}
        aria-hidden="true"
      />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="border-gp-gold-300 bg-gp-navy-900 text-gp-gold-500 flex size-11 shrink-0 items-center justify-center rounded-[11px] border text-sm font-semibold shadow-[0_6px_14px_rgba(16,29,54,0.15)] transition-[border-color] duration-[200ms] group-hover/plan:border-gp-gold-500">
              {getInitials(repName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-gp-navy-900 min-w-0 truncate text-base leading-6 font-semibold">
                  {plan.title || "Untitled Visit Plan"}
                </h3>
                <PlanTypeBadge type={plan.planType} />
                <PlanStatusBadge status={plan.status} />
              </div>
              <div className="text-gp-text-muted mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <UserRound
                    className="text-gp-text-placeholder size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{repName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays
                    className="text-gp-text-placeholder size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{formatPeriod(plan)}</span>
                </span>
                <PlanCardTerritorySummary plan={plan} analytics={analytics} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewDetails(plan)}
              className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover h-9 cursor-pointer rounded-[10px] px-3 text-xs font-semibold shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] hover:-translate-y-px focus-visible:ring-gp-gold-500/25 focus-visible:ring-3 motion-reduce:transform-none"
            >
              <Eye className="size-4" aria-hidden="true" />
              View Details
              <ChevronRight
                className="size-3.5 transition-transform duration-[200ms] group-hover/plan:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Button>
            {plan.status === "PENDING" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => onConfirm({ type: "reject", plan })}
                  className="border-gp-danger-border text-gp-danger hover:border-gp-danger hover:bg-gp-danger-soft h-9 cursor-pointer rounded-[10px] px-3 text-xs font-semibold shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] hover:-translate-y-px focus-visible:ring-gp-danger/25 focus-visible:ring-3 motion-reduce:transform-none"
                >
                  <XCircle className="size-4" aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  type="button"
                  disabled={disabled}
                  onClick={() => onConfirm({ type: "approve", plan })}
                  className="bg-gp-success hover:bg-[#107349] h-9 cursor-pointer rounded-[10px] px-3 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(22,133,87,0.18)] transition-[background-color,box-shadow,transform] duration-[180ms] hover:-translate-y-px hover:shadow-[0_9px_18px_rgba(22,133,87,0.22)] focus-visible:ring-gp-success/25 focus-visible:ring-3 motion-reduce:transform-none"
                >
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
          <MetricTile
            label="Target Doctors"
            value={plan.targetDoctors ?? 0}
            icon={Target}
          />
          <MetricTile
            label="Selected"
            value={selectedDoctorsCount}
            icon={Users}
          />
          <MetricTile
            label="Target Visits"
            value={plan.targetVisits ?? 0}
            icon={ClipboardList}
          />
          <MetricTile
            label="Coverage"
            value={formatCoverage(coverage)}
            icon={Clock3}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.46fr)] lg:items-end">
          <div className="min-w-0">
            <p className="text-gp-navy-900 text-xs font-semibold">Objectives</p>
            <p className="text-gp-text-muted mt-1 line-clamp-2 text-sm leading-5 font-medium">
              {objectivesPreview}
            </p>
          </div>
          <PlanCoverage value={coverage} />
        </div>

        <div className="border-gp-border-subtle mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onViewDetails(plan)}
            className="focus-visible:ring-gp-gold-500/25 group/doctors flex min-w-0 cursor-pointer items-center gap-2 rounded-[10px] text-left focus-visible:ring-3 focus-visible:outline-none"
          >
            <span className="flex shrink-0 -space-x-2">
              {previewDoctors.map((doctor, doctorIndex) => (
                <span
                  key={`${plan.id}-${doctor.id}-${doctorIndex}`}
                  title={getDoctorName(doctor)}
                  className="border-gp-surface-card bg-gp-gold-50 text-gp-gold-700 flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold"
                >
                  {getInitials(getDoctorName(doctor))}
                </span>
              ))}
              {remainingDoctors > 0 && (
                <span className="border-gp-surface-card bg-gp-navy-900 text-gp-gold-500 flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold">
                  +{remainingDoctors}
                </span>
              )}
            </span>
            <span className="min-w-0">
              <span className="text-gp-navy-900 block truncate text-xs font-semibold">
                {selectedDoctorsCount.toLocaleString()} doctors selected
              </span>
              <span className="text-gp-text-muted group-hover/doctors:text-gp-gold-700 inline-flex items-center gap-1 text-xs font-medium transition-colors">
                View doctors and territory
                <ChevronRight className="size-3 transition-transform group-hover/doctors:translate-x-0.5 motion-reduce:transition-none" />
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onViewDetails(plan)}
            className="text-gp-navy-900 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] px-2 text-xs font-semibold transition-[color,background-color] duration-[180ms] hover:bg-gp-gold-50 focus-visible:ring-3 focus-visible:outline-none"
          >
            View full details
            <ChevronRight
              className="size-3.5 transition-transform duration-[200ms] group-hover/plan:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </article>
  );
}

function ScopeStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gp-text-muted text-[11px] font-semibold tracking-[0.05em] uppercase">
          {label}
        </span>
        <Icon className="text-gp-gold-600 size-4" aria-hidden="true" />
      </div>
      <p className="text-gp-navy-900 mt-2 text-xl leading-none font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  helper,
}: {
  icon: LucideIcon;
  title: string;
  helper?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
          <Icon className="text-gp-gold-600 size-4" aria-hidden="true" />
          {title}
        </h3>
        {helper && (
          <p className="text-gp-text-muted mt-1 text-xs font-medium">
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  plan,
  analytics,
}: {
  plan: VisitPlan;
  analytics: TerritoryAnalytics;
}) {
  const coverage = getCoverage(plan);

  return (
    <div className="space-y-4">
      <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
        <SectionTitle icon={ClipboardList} title="Plan Summary" />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <MetricTile
            label="Target Doctors"
            value={plan.targetDoctors ?? 0}
            icon={Target}
          />
          <MetricTile
            label="Selected Doctors"
            value={analytics.totalDoctors}
            icon={Users}
          />
          <MetricTile
            label="Target Visits"
            value={plan.targetVisits ?? 0}
            icon={ClipboardList}
          />
          <MetricTile
            label="Coverage"
            value={formatCoverage(coverage)}
            icon={Clock3}
          />
        </div>
        <div className="mt-4">
          <PlanCoverage value={coverage} />
        </div>
      </section>

      <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
        <SectionTitle icon={FileText} title="Plan Objectives" />
        {plan.objectives?.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {plan.objectives.map((objective, index) => (
              <li
                key={`${plan.id}-objective-${index}`}
                className="text-gp-text-secondary flex gap-2 text-sm leading-6 font-medium"
              >
                <span className="bg-gp-gold-500 mt-2 size-1.5 shrink-0 rounded-full" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gp-text-muted mt-3 text-sm font-medium">
            No objectives were provided for this plan.
          </p>
        )}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
        <SectionTitle
          icon={MapPinned}
          title="Territory Scope"
          helper="Calculated from selected doctors in this plan."
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <ScopeStat
            label="Districts"
            value={analytics.districtCount}
            icon={Layers3}
          />
          <ScopeStat
            label="Regions"
            value={analytics.regionCount}
            icon={Map}
          />
          <ScopeStat
            label="Territories"
            value={analytics.territoryCount}
            icon={MapPin}
          />
          <ScopeStat
            label="Doctors"
            value={analytics.totalDoctors}
            icon={Stethoscope}
          />
        </div>
      </section>
    </div>
  );
}

function DistributionRow({
  label,
  count,
  total,
  details,
  color = "gold",
}: {
  label: string;
  count: number;
  total: number;
  details: string[];
  color?: "gold" | "navy";
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group/territory relative rounded-[10px] p-2 transition-colors hover:bg-gp-surface-hover">
      <div className="flex items-center justify-between gap-3">
        <span className="text-gp-navy-900 truncate text-sm font-semibold">
          {label}
        </span>
        <span className="text-gp-text-muted shrink-0 text-xs font-semibold">
          {count.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="bg-gp-border-subtle h-2 min-w-0 flex-1 overflow-hidden rounded-full">
          <span
            className={cn(
              "plans-progress-fill block h-full rounded-full transition-[width] duration-[600ms] ease-out motion-reduce:transition-none",
              color === "gold" ? "bg-gp-gold-500" : "bg-gp-navy-900",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-gp-navy-900 w-12 text-right text-xs font-semibold">
          {formatPercent(count, total)}
        </span>
      </div>
      <TerritoryTooltip
        title={label}
        lines={details}
        count={count}
        total={total}
      />
    </div>
  );
}

function RegionalDonut({ analytics }: { analytics: TerritoryAnalytics }) {
  const regions = analytics.regions;
  const segments = regions.reduce<
    Array<{
      region: RegionGroup;
      color: string;
      start: number;
      end: number;
    }>
  >((items, region, index) => {
    const start = items.at(-1)?.end ?? 0;
    const size =
      analytics.totalDoctors > 0
        ? (region.doctors.length / analytics.totalDoctors) * 100
        : 0;

    return [
      ...items,
      {
      region,
      color: regionChartColors[index % regionChartColors.length],
      start,
      end: start + size,
      },
    ];
  }, []);
  const gradient =
    segments.length > 0
      ? segments
          .map(
            (segment) =>
              `${segment.color} ${segment.start}% ${segment.end}%`,
          )
          .join(", ")
      : "#EEF1F6 0% 100%";

  return (
    <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
      <SectionTitle
        icon={PieChart}
        title="Regional Distribution"
        helper="Share of selected doctors by region."
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto flex size-40 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(229,232,239,0.9)]">
          <div
            className="plans-donut-reveal absolute inset-0 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="bg-gp-surface-card absolute inset-9 rounded-full shadow-[0_0_0_1px_rgba(229,232,239,0.9)]" />
          <div className="relative text-center">
            <p className="text-gp-navy-900 text-2xl leading-none font-semibold">
              {analytics.totalDoctors.toLocaleString()}
            </p>
            <p className="text-gp-text-muted mt-1 text-xs font-semibold">
              Doctors
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {segments.map((segment) => (
            <div
              key={segment.region.name}
              className="group/territory relative flex items-center gap-2 rounded-[10px] px-2 py-1.5 transition-colors hover:bg-gp-surface-hover"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gp-navy-900 min-w-0 flex-1 truncate text-sm font-semibold">
                {segment.region.name}
              </span>
              <span className="text-gp-text-muted text-xs font-semibold">
                {segment.region.doctors.length.toLocaleString()} |{" "}
                {formatPercent(
                  segment.region.doctors.length,
                  analytics.totalDoctors,
                )}
              </span>
              <TerritoryTooltip
                title={segment.region.name}
                lines={[segment.region.district]}
                count={segment.region.doctors.length}
                total={analytics.totalDoctors}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnalyticsCharts({
  analytics,
  repName,
}: {
  analytics: TerritoryAnalytics;
  repName: string;
}) {
  const maxTerritoryCount = Math.max(
    1,
    ...analytics.territories.map((territory) => territory.doctors.length),
  );

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <ScopeStat
          label="Districts"
          value={analytics.districtCount}
          icon={Layers3}
        />
        <ScopeStat label="Regions" value={analytics.regionCount} icon={Map} />
        <ScopeStat
          label="Territories"
          value={analytics.territoryCount}
          icon={MapPin}
        />
        <ScopeStat
          label="Selected Doctors"
          value={analytics.totalDoctors}
          icon={Stethoscope}
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
          <SectionTitle
            icon={Layers3}
            title="Doctor Distribution by District"
          />
          <div className="mt-3 space-y-1">
            {analytics.districts.map((district, index) => (
              <DistributionRow
                key={district.name}
                label={district.name}
                count={district.doctors.length}
                total={analytics.totalDoctors}
                color={index === 0 ? "gold" : "navy"}
                details={[
                  `${district.regions.length.toLocaleString()} regions`,
                  `Representative: ${repName}`,
                ]}
              />
            ))}
          </div>
        </section>

        <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
          <SectionTitle icon={Map} title="Doctors by Region" />
          <div className="mt-3 space-y-1">
            {analytics.regions.map((region, index) => (
              <DistributionRow
                key={`${region.district}-${region.name}`}
                label={region.name}
                count={region.doctors.length}
                total={analytics.totalDoctors}
                color={index % 2 === 0 ? "gold" : "navy"}
                details={[region.district]}
              />
            ))}
          </div>
        </section>
      </div>

      <RegionalDonut analytics={analytics} />

      <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
        <SectionTitle
          icon={MapPin}
          title="Doctors by Territory"
          helper="Ranked by selected doctors in this plan."
        />
        <div className="mt-3 space-y-1">
          {analytics.territories.map((territory, index) => {
            const percent = (territory.doctors.length / maxTerritoryCount) * 100;

            return (
              <div
                key={`${territory.territory.region}-${territory.name}`}
                className="group/territory relative rounded-[10px] p-2 transition-colors hover:bg-gp-surface-hover"
              >
                <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-gp-text-placeholder text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-gp-navy-900 min-w-0 truncate text-sm font-semibold">
                    {territory.name}
                  </span>
                  <span className="text-gp-navy-900 text-xs font-semibold">
                    {territory.doctors.length.toLocaleString()}
                  </span>
                </div>
                <div className="bg-gp-border-subtle mt-2 h-2 overflow-hidden rounded-full">
                  <span
                    className="plans-progress-fill bg-gp-gold-500 block h-full rounded-full transition-[width] duration-[600ms] ease-out motion-reduce:transition-none"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <TerritoryTooltip
                  title={territory.name}
                  lines={[
                    territory.territory.region,
                    territory.territory.district,
                  ]}
                  count={territory.doctors.length}
                  total={analytics.totalDoctors}
                  representative={repName}
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DoctorRow({ entry }: { entry: TerritoryDoctor }) {
  const { doctor, territory } = entry;

  return (
    <li className="group/doctor border-gp-border-subtle bg-gp-surface-card hover:bg-gp-surface-hover flex min-w-0 items-center gap-3 rounded-[10px] border px-3 py-2.5 transition-[background-color,border-color,transform] duration-[170ms] hover:translate-x-0.5 hover:border-gp-gold-300 motion-reduce:transform-none">
      <span className="bg-gp-navy-900/5 text-gp-navy-900 group-hover/doctor:bg-gp-gold-50 group-hover/doctor:text-gp-gold-700 flex size-9 shrink-0 items-center justify-center rounded-[9px] transition-colors">
        <Stethoscope className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-gp-navy-900 truncate text-sm font-semibold"
          dir="auto"
          title={getDoctorName(doctor)}
        >
          {getDoctorName(doctor)}
        </p>
        <p
          className="text-gp-text-muted mt-0.5 truncate text-xs font-medium"
          title={getDoctorFacility(doctor)}
        >
          {doctor.specialty ? `${doctor.specialty} | ` : ""}
          {getDoctorFacility(doctor)}
        </p>
        <p className="text-gp-gold-700 mt-0.5 truncate text-[11px] font-semibold">
          {territory.territory} | {territory.region}
        </p>
      </div>
    </li>
  );
}

function TerritoryDoctors({
  group,
  total,
}: {
  group: TerritoryGroup;
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(TERRITORY_DOCTOR_BATCH_SIZE);
  const trimmed = query.trim().toLowerCase();
  const filteredDoctors = trimmed
    ? group.doctors.filter((entry) => searchableDoctorText(entry).includes(trimmed))
    : group.doctors;
  const visibleDoctors = filteredDoctors.slice(0, limit);

  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle mt-3 rounded-[12px] border p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gp-navy-900 text-sm font-semibold">{group.name}</p>
          <p className="text-gp-text-muted text-xs font-medium">
            {group.doctors.length.toLocaleString()} doctors |{" "}
            {formatPercent(group.doctors.length, total)} of selected doctors
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search
            className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(TERRITORY_DOCTOR_BATCH_SIZE);
            }}
            className="border-gp-border-control bg-white h-9 rounded-[10px] pr-3 pl-9 text-xs font-medium shadow-none"
            placeholder={`Search within ${group.name}...`}
          />
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {visibleDoctors.map((entry, index) => (
          <DoctorRow
            key={`${group.name}-${entry.doctor.id}-${entry.doctor.visitDate ?? index}`}
            entry={entry}
          />
        ))}
      </ul>
      {filteredDoctors.length > visibleDoctors.length && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setLimit((current) => current + TERRITORY_DOCTOR_BATCH_SIZE)}
          className="border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50 mt-3 h-9 cursor-pointer rounded-[10px] text-xs font-semibold"
        >
          Show more
        </Button>
      )}
    </div>
  );
}

function TerritoryBreakdown({
  analytics,
  repName,
}: {
  analytics: TerritoryAnalytics;
  repName: string;
}) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(analytics.districts.slice(0, 1).map((district) => district.name)),
  );

  function toggle(key: string) {
    setOpenKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
      <SectionTitle
        icon={Layers3}
        title="Territory Breakdown"
        helper="Expand a territory to review assigned doctors."
      />
      <div className="mt-4 space-y-3">
        {analytics.districts.map((district) => {
          const districtKey = district.name;
          const districtOpen = openKeys.has(districtKey);

          return (
            <div
              key={district.name}
              className="border-gp-border-subtle rounded-[12px] border bg-white"
            >
              <button
                type="button"
                onClick={() => toggle(districtKey)}
                className="group/territory relative flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left"
              >
                <span className="bg-gp-navy-900 text-gp-gold-500 flex size-9 shrink-0 items-center justify-center rounded-[9px]">
                  <Layers3 className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-gp-navy-900 block truncate text-sm font-semibold uppercase tracking-[0.04em]">
                    {district.name}
                  </span>
                  <span className="text-gp-text-muted text-xs font-medium">
                    {district.doctors.length.toLocaleString()} doctors
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "text-gp-text-muted size-4 transition-transform duration-[200ms]",
                    districtOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
                <TerritoryTooltip
                  title={district.name}
                  lines={[`${district.regions.length} regions`]}
                  count={district.doctors.length}
                  total={analytics.totalDoctors}
                  representative={repName}
                />
              </button>

              {districtOpen && (
                <div className="plans-accordion-content border-gp-border-subtle border-t px-3 py-3">
                  <RegionBreakdown
                    district={district}
                    openKeys={openKeys}
                    onToggle={toggle}
                    total={analytics.totalDoctors}
                    repName={repName}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RegionBreakdown({
  district,
  openKeys,
  onToggle,
  total,
  repName,
}: {
  district: DistrictGroup;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
  total: number;
  repName: string;
}) {
  return (
    <div className="space-y-2 pl-2">
      {district.regions.map((region) => {
        const regionKey = `${district.name}/${region.name}`;
        const regionOpen = openKeys.has(regionKey);

        return (
          <div key={regionKey} className="border-l border-gp-border-subtle pl-3">
            <button
              type="button"
              onClick={() => onToggle(regionKey)}
              className="group/territory relative flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-2 text-left hover:bg-gp-surface-hover"
            >
              <MapPinned className="text-gp-gold-600 size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="text-gp-navy-900 block truncate text-sm font-semibold">
                  {region.name}
                </span>
                <span className="text-gp-text-muted text-xs font-medium">
                  {region.doctors.length.toLocaleString()} doctors
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "text-gp-text-muted size-4 transition-transform duration-[200ms]",
                  regionOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
              <TerritoryTooltip
                title={region.name}
                lines={[district.name]}
                count={region.doctors.length}
                total={total}
                representative={repName}
              />
            </button>

            {regionOpen && (
              <div className="plans-accordion-content mt-1 space-y-2 pl-3">
                <TerritoryLevel
                  region={region}
                  openKeys={openKeys}
                  onToggle={onToggle}
                  total={total}
                  repName={repName}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TerritoryLevel({
  region,
  openKeys,
  onToggle,
  total,
  repName,
}: {
  region: RegionGroup;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
  total: number;
  repName: string;
}) {
  return (
    <>
      {region.territories.map((territory) => {
        const territoryKey = `${region.district}/${region.name}/${territory.name}`;
        const territoryOpen = openKeys.has(territoryKey);

        return (
          <div key={territoryKey} className="border-l border-gp-border-subtle pl-3">
            <button
              type="button"
              onClick={() => onToggle(territoryKey)}
              className={cn(
                "group/territory relative flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-gp-surface-hover",
                territoryOpen && "bg-gp-gold-50",
              )}
            >
              <MapPin className="text-gp-gold-600 size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="text-gp-navy-900 block truncate text-sm font-semibold">
                  {territory.name}
                </span>
                <span className="text-gp-text-muted text-xs font-medium">
                  {territory.doctors.length.toLocaleString()} doctors
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "text-gp-text-muted size-4 transition-transform duration-[200ms]",
                  territoryOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
              <TerritoryTooltip
                title={territory.name}
                lines={[region.name, region.district]}
                count={territory.doctors.length}
                total={total}
                representative={repName}
              />
            </button>
            {territoryOpen && (
              <div className="plans-accordion-content">
                <TerritoryDoctors group={territory} total={total} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function TerritoryCoverageTab({
  analytics,
  repName,
}: {
  analytics: TerritoryAnalytics;
  repName: string;
}) {
  return (
    <div className="space-y-4">
      <AnalyticsCharts analytics={analytics} repName={repName} />
      <TerritoryBreakdown analytics={analytics} repName={repName} />
    </div>
  );
}

function DoctorsTab({ analytics }: { analytics: TerritoryAnalytics }) {
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState(ALL);
  const [regionFilter, setRegionFilter] = useState(ALL);
  const [territoryFilter, setTerritoryFilter] = useState(ALL);
  const [limit, setLimit] = useState(DOCTOR_BATCH_SIZE);
  const options = getDrawerFilterOptions(analytics, districtFilter, regionFilter);
  const trimmed = query.trim().toLowerCase();

  const filteredDoctors = analytics.doctors.filter((entry) => {
    if (districtFilter !== ALL && entry.territory.district !== districtFilter) {
      return false;
    }
    if (regionFilter !== ALL && entry.territory.region !== regionFilter) {
      return false;
    }
    if (
      territoryFilter !== ALL &&
      entry.territory.territory !== territoryFilter
    ) {
      return false;
    }
    if (!trimmed) return true;

    return searchableDoctorText(entry).includes(trimmed);
  });
  const visibleDoctors = filteredDoctors.slice(0, limit);

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
    setLimit(DOCTOR_BATCH_SIZE);
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL);
    setLimit(DOCTOR_BATCH_SIZE);
  }

  function updateTerritory(value: string) {
    setTerritoryFilter(value);
    setLimit(DOCTOR_BATCH_SIZE);
  }

  return (
    <div className="space-y-4">
      <section className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <SectionTitle
              icon={Stethoscope}
              title="Selected Doctors"
              helper={`${filteredDoctors.length.toLocaleString()} of ${analytics.totalDoctors.toLocaleString()} doctors shown`}
            />
          </div>
          <div className="relative lg:w-72">
            <Search
              className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(DOCTOR_BATCH_SIZE);
              }}
              className="border-gp-border-control bg-gp-surface-control text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-10 rounded-[10px] pr-9 pl-10 text-sm font-medium shadow-none"
              placeholder="Search doctors..."
              aria-label="Search selected doctors"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Select value={districtFilter} onValueChange={updateDistrict}>
            <SelectTrigger className="h-10 rounded-[10px] border-gp-border-control bg-white text-sm font-semibold shadow-none">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent className="border-gp-border-control bg-white p-0 shadow-gp-popover [&>div:not([data-slot])]:p-1">
              <SelectItem value={ALL}>All Districts</SelectItem>
              {options.districts.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={updateRegion}>
            <SelectTrigger className="h-10 rounded-[10px] border-gp-border-control bg-white text-sm font-semibold shadow-none">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent className="border-gp-border-control bg-white p-0 shadow-gp-popover [&>div:not([data-slot])]:p-1">
              <SelectItem value={ALL}>All Regions</SelectItem>
              {options.regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={territoryFilter} onValueChange={updateTerritory}>
            <SelectTrigger className="h-10 rounded-[10px] border-gp-border-control bg-white text-sm font-semibold shadow-none">
              <SelectValue placeholder="All Territories" />
            </SelectTrigger>
            <SelectContent className="border-gp-border-control bg-white p-0 shadow-gp-popover [&>div:not([data-slot])]:p-1">
              <SelectItem value={ALL}>All Territories</SelectItem>
              {options.territories.map((territory) => (
                <SelectItem key={territory} value={territory}>
                  {territory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {visibleDoctors.length > 0 ? (
        <ul className="space-y-2">
          {visibleDoctors.map((entry, index) => (
            <DoctorRow
              key={`${entry.doctor.id}-${entry.doctor.visitDate ?? index}`}
              entry={entry}
            />
          ))}
        </ul>
      ) : (
        <div className="border-gp-border-control bg-gp-surface-card rounded-[14px] border border-dashed px-4 py-10 text-center">
          <CircleSlash className="text-gp-gold-600 mx-auto size-6" />
          <p className="text-gp-navy-900 mt-2 text-sm font-semibold">
            No doctors match these filters
          </p>
          <p className="text-gp-text-muted mt-1 text-xs font-medium">
            Try clearing search, district, region, or territory filters.
          </p>
        </div>
      )}

      {filteredDoctors.length > visibleDoctors.length && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setLimit((current) => current + DOCTOR_BATCH_SIZE)}
          className="border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50 h-9 cursor-pointer rounded-[10px] text-xs font-semibold"
        >
          Show more doctors
        </Button>
      )}
    </div>
  );
}

function PlanDetailsDrawer({
  plan,
  open,
  activeTab,
  onTabChange,
  onOpenChange,
  onConfirm,
  disabled,
}: {
  plan: VisitPlan | null;
  open: boolean;
  activeTab: DrawerTab;
  onTabChange: (tab: DrawerTab) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: (state: ConfirmState) => void;
  disabled: boolean;
}) {
  const analytics = useMemo(
    () => getPlanTerritoryAnalytics(plan?.selectedDoctors ?? []),
    [plan],
  );

  if (!plan) {
    return <Sheet open={open} onOpenChange={onOpenChange} />;
  }

  const repName = getRepName(plan);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-gp-surface-page h-dvh w-full gap-0 border-gp-border-default p-0 shadow-gp-dialog sm:max-w-[85vw] lg:max-w-[760px]"
        overlayClassName="bg-gp-navy-900/35"
      >
        <SheetHeader className="sticky top-0 z-20 border-gp-border-subtle bg-gp-surface-card border-b px-5 py-5">
          <div className="flex items-start gap-3 pr-8">
            <span className="bg-gp-navy-900 text-gp-gold-500 flex size-11 shrink-0 items-center justify-center rounded-[11px] text-sm font-semibold">
              {getInitials(repName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-gp-navy-900 min-w-0 truncate text-lg leading-6 font-semibold">
                  {plan.title || "Untitled Visit Plan"}
                </SheetTitle>
                <PlanStatusBadge status={plan.status} />
              </div>
              <SheetDescription className="text-gp-text-muted mt-1 text-sm font-medium">
                <span className="block truncate">{repName}</span>
                <span className="mt-0.5 block">{formatPeriod(plan)}</span>
              </SheetDescription>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Plan drawer sections"
            className="border-gp-border-control bg-gp-surface-control mt-4 grid grid-cols-3 rounded-[12px] border p-1"
          >
            {drawerTabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "focus-visible:ring-gp-gold-500/25 flex min-h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,color,box-shadow] duration-[200ms] focus-visible:ring-3 focus-visible:outline-none",
                    selected
                      ? "bg-gp-navy-900 text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                      : "text-gp-text-muted hover:bg-white hover:text-gp-navy-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "hidden size-3.5 shrink-0 sm:block",
                      selected && "text-gp-gold-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {activeTab === "overview" && (
            <OverviewTab plan={plan} analytics={analytics} />
          )}
          {activeTab === "territory" && (
            <TerritoryCoverageTab analytics={analytics} repName={repName} />
          )}
          {activeTab === "doctors" && <DoctorsTab analytics={analytics} />}
        </div>

        {plan.status === "PENDING" && (
          <SheetFooter className="border-gp-border-subtle bg-gp-surface-card grid gap-2 border-t p-4 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onConfirm({ type: "reject", plan })}
              className="border-gp-danger-border text-gp-danger hover:border-gp-danger hover:bg-gp-danger-soft h-10 cursor-pointer rounded-[10px] text-sm font-semibold shadow-none"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Reject Plan
            </Button>
            <Button
              type="button"
              disabled={disabled}
              onClick={() => onConfirm({ type: "approve", plan })}
              className="bg-gp-success hover:bg-[#107349] h-10 cursor-pointer rounded-[10px] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(22,133,87,0.18)]"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Approve Plan
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function ManagerPlansList({
  plans = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: ManagerPlansListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [query, setQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState(ALL);
  const [regionFilter, setRegionFilter] = useState(ALL);
  const [territoryFilter, setTerritoryFilter] = useState(ALL);
  const [repFilter, setRepFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("overview");
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({
    all: null,
    PENDING: null,
    APPROVED: null,
    REJECTED: null,
  });

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const counts = useMemo(
    () => ({
      all: plans.length,
      PENDING: plans.filter((plan) => plan.status === "PENDING").length,
      APPROVED: plans.filter((plan) => plan.status === "APPROVED").length,
      REJECTED: plans.filter((plan) => plan.status === "REJECTED").length,
    }),
    [plans],
  );

  const representativeOptions = useMemo(() => {
    return Array.from(new Set(plans.map(getRepName))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [plans]);

  const mainFilterOptions = useMemo(
    () => getMainFilterOptions(plans, districtFilter, regionFilter),
    [districtFilter, plans, regionFilter],
  );
  const districtOptions = useMemo<ControlOption[]>(
    () =>
      mainFilterOptions.districts.map((district) => ({
        value: district,
        label: district,
      })),
    [mainFilterOptions.districts],
  );
  const regionOptions = useMemo<ControlOption[]>(
    () =>
      mainFilterOptions.regions.map((region) => {
        const district = KSA_TERRITORY_STRUCTURE.find((item) =>
          item.regions.some((regionItem) => regionItem.name === region),
        )?.name;

        return {
          value: region,
          label: region,
          helper: district,
        };
      }),
    [mainFilterOptions.regions],
  );
  const territoryOptions = useMemo<ControlOption[]>(
    () =>
      mainFilterOptions.territories.map((territory) => {
        const region = KSA_TERRITORY_STRUCTURE.flatMap(
          (district) => district.regions,
        ).find((regionItem) =>
          regionItem.territories.some((item) => item.name === territory),
        )?.name;

        return {
          value: territory,
          label: territory,
          helper: region,
        };
      }),
    [mainFilterOptions.territories],
  );
  const representativeControlOptions = useMemo<ControlOption[]>(
    () =>
      representativeOptions.map((name) => ({
        value: name,
        label: name,
      })),
    [representativeOptions],
  );
  const typeControlOptions: ControlOption[] = [
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
  ];
  const sortControlOptions: ControlOption[] = sortOptions.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const searchedPlans = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    return plans.filter((plan) => {
      if (activeTab !== ALL && plan.status !== activeTab) return false;
      if (repFilter !== ALL && getRepName(plan) !== repFilter) return false;
      if (typeFilter !== ALL && plan.planType !== typeFilter) return false;
      if (
        districtFilter !== ALL ||
        regionFilter !== ALL ||
        territoryFilter !== ALL
      ) {
        const matchesTerritory = planContainsTerritoryFilter(
          plan.selectedDoctors,
          {
            district: districtFilter === ALL ? undefined : districtFilter,
            region: regionFilter === ALL ? undefined : regionFilter,
            territory: territoryFilter === ALL ? undefined : territoryFilter,
          },
        );

        if (!matchesTerritory) return false;
      }

      if (!trimmed) return true;

      const territoryText = getPlanTerritoryText(plan);
      return [
        plan.title,
        plan.description,
        plan.planType,
        plan.status,
        getRepName(plan),
        plan.startDate,
        plan.endDate,
        territoryText,
        ...(plan.objectives ?? []),
      ].some((value) => includesNormalized(value, trimmed));
    });
  }, [
    activeTab,
    districtFilter,
    plans,
    query,
    regionFilter,
    repFilter,
    territoryFilter,
    typeFilter,
  ]);

  const filteredPlans = useMemo(() => {
    return [...searchedPlans].sort((left, right) => {
      if (sortKey === "oldest") {
        return (
          planDateValue(left.submittedDate) -
          planDateValue(right.submittedDate)
        );
      }

      if (sortKey === "mostDoctors") {
        return getSelectedDoctorsCount(right) - getSelectedDoctorsCount(left);
      }

      if (sortKey === "fewestDoctors") {
        return getSelectedDoctorsCount(left) - getSelectedDoctorsCount(right);
      }

      if (sortKey === "repAz") {
        return getRepName(left).localeCompare(getRepName(right));
      }

      return (
        planDateValue(right.submittedDate) -
        planDateValue(left.submittedDate)
      );
    });
  }, [searchedPlans, sortKey]);

  const averageCoverage =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + (getCoverage(plan) ?? 0), 0) /
        plans.length
      : 0;
  const hasActiveFilters =
    activeTab !== ALL ||
    query.trim().length > 0 ||
    districtFilter !== ALL ||
    regionFilter !== ALL ||
    territoryFilter !== ALL ||
    repFilter !== ALL ||
    typeFilter !== ALL ||
    sortKey !== "newest";
  const activeFilterCount = getActiveFilterCount({
    activeTab,
    query,
    districtFilter,
    regionFilter,
    territoryFilter,
    repFilter,
    typeFilter,
    sortKey,
  });

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    current: TabType,
  ) {
    const currentIndex = statusTabs.findIndex((tab) => tab.id === current);
    let nextIndex: number | undefined;

    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = statusTabs.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % statusTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + statusTabs.length) % statusTabs.length;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextTab = statusTabs[nextIndex].id;
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  }

  function updateDistrict(value: string) {
    setDistrictFilter(value);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
  }

  function updateRegion(value: string) {
    setRegionFilter(value);
    setTerritoryFilter(ALL);
  }

  function resetFilters() {
    setActiveTab(ALL);
    setQuery("");
    setDistrictFilter(ALL);
    setRegionFilter(ALL);
    setTerritoryFilter(ALL);
    setRepFilter(ALL);
    setTypeFilter(ALL);
    setSortKey("newest");
  }

  function openDetails(plan: VisitPlan) {
    setDrawerTab("overview");
    setSelectedPlanId(plan.id);
  }

  function closeConfirm() {
    if (isPending) return;
    setConfirmState(null);
    setRejectFeedback("");
  }

  function submitDecision() {
    if (!confirmState) return;

    const { plan, type } = confirmState;

    startTransition(async () => {
      const result =
        type === "approve"
          ? await updatePlanStatusAction(plan.id, "APPROVED")
          : await rejectPlanAction(plan.id, rejectFeedback.trim() || undefined);

      if (result.success) {
        toast.success({
          title:
            type === "approve"
              ? "Plan approved successfully"
              : "Plan rejected successfully",
        });
        setConfirmState(null);
        setRejectFeedback("");
        setSelectedPlanId(null);
        router.refresh();
      } else {
        toast.error({
          title:
            result.error?.message ||
            (type === "approve"
              ? "Failed to approve plan"
              : "Failed to reject plan"),
        });
      }
    });
  }

  const emptyTitle = hasActiveFilters
    ? `No plans match${query.trim() ? ` "${query.trim()}"` : " these filters"}`
    : "No plans found";
  const emptyCopy =
    activeTab === "PENDING" && !query.trim()
      ? "You're all caught up. New submitted plans will appear here."
      : "Try clearing search or filters to review the loaded plans.";

  return (
    <>
      <section
        aria-label="Plans overview"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="All Plans"
          value={totalCount || plans.length}
          helper="Across available pages"
          icon={ClipboardList}
          tone="neutral"
          index={0}
        />
        <KpiCard
          label="Pending"
          value={counts.PENDING}
          helper="On this page"
          icon={Clock3}
          tone="PENDING"
          index={1}
        />
        <KpiCard
          label="Approved"
          value={counts.APPROVED}
          helper="On this page"
          icon={CheckCircle2}
          tone="APPROVED"
          index={2}
        />
        <KpiCard
          label="Rejected"
          value={counts.REJECTED}
          helper={`Avg coverage ${averageCoverage.toFixed(1)}%`}
          icon={XCircle}
          tone="REJECTED"
          index={3}
        />
      </section>

      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card mt-5 overflow-hidden rounded-[16px] border">
        <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-gp-navy-900 text-lg font-semibold">
                Plan Review Queue
              </h2>
              <p
                key={`${activeTab}-${filteredPlans.length}-${query}`}
                className="text-gp-text-muted mt-0.5 text-sm font-medium"
                aria-live="polite"
              >
                {filteredPlans.length}{" "}
                {filteredPlans.length === 1 ? "plan" : "plans"} shown on this
                page
              </p>
            </div>

            <div className="relative w-full lg:w-[360px]">
              <Search
                className="text-gp-text-placeholder pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="border-gp-border-default bg-white text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-11 w-full rounded-[12px] pr-10 pl-10 text-sm font-medium shadow-none transition-[border-color,box-shadow] duration-[150ms]"
                placeholder="Search plans, reps, or territories..."
                aria-label="Search plans, representatives, or territories"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear plan search"
                  className="text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-full overflow-x-auto overscroll-x-contain pb-0.5">
              <div
                role="tablist"
                aria-label="Filter plans by status"
                className="border-gp-border-control bg-gp-surface-control inline-grid min-w-[560px] grid-cols-4 rounded-[12px] border p-1 sm:min-w-[540px]"
              >
                {statusTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  const count = counts[tab.id];

                  return (
                    <button
                      key={tab.id}
                      ref={(element) => {
                        tabRefs.current[tab.id] = element;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                      className={cn(
                        "focus-visible:ring-gp-gold-500/25 relative flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-[150ms] focus-visible:ring-3 focus-visible:outline-none sm:text-sm motion-reduce:transition-none",
                        isSelected
                          ? "bg-[#101D36] text-white shadow-[0_4px_10px_rgba(16,29,54,0.22)]"
                          : "border border-transparent text-gp-text-muted hover:bg-white hover:text-gp-navy-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "hidden size-3.5 shrink-0 sm:block",
                          isSelected && "text-gp-gold-500",
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">{tab.label}</span>
                      <span
                        className={cn(
                          "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-4 transition-colors duration-[150ms]",
                          isSelected
                            ? "border border-gp-gold-500/20 bg-white/10 text-gp-gold-500"
                            : "border border-gp-border-control bg-white text-gp-text-muted",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterSheetOpen(true)}
              className="border-gp-border-default bg-white text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover h-11 cursor-pointer rounded-[12px] px-3 text-sm font-semibold shadow-none md:hidden"
            >
              <SlidersHorizontal
                className="size-4 text-gp-gold-600"
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
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-gp-navy-900 uppercase">
              <SlidersHorizontal
                className="size-3.5 text-gp-gold-600"
                aria-hidden="true"
              />
              Filters
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex max-w-full flex-wrap items-center gap-2 rounded-[14px] border border-gp-border-subtle bg-gp-surface-subtle p-2">
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
                <ChevronRight className="size-4 text-gp-gold-500/75" aria-hidden="true" />
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
                <ChevronRight className="size-4 text-gp-gold-500/75" aria-hidden="true" />
                <FilterSelect
                  value={territoryFilter}
                  onValueChange={setTerritoryFilter}
                  icon={MapPin}
                  label="Territory"
                  allLabel="All Territories"
                  displayValue={getCompactTerritoryLabel(territoryFilter)}
                  options={territoryOptions}
                  className="md:w-[170px]"
                />
              </div>

              <FilterSelect
                value={repFilter}
                onValueChange={setRepFilter}
                icon={UserRound}
                label="Representative"
                allLabel="All Representatives"
                displayValue={repFilter === ALL ? "Representative" : repFilter}
                options={representativeControlOptions}
                className="md:w-[230px]"
                secondary
              />
              <FilterSelect
                value={typeFilter}
                onValueChange={setTypeFilter}
                icon={SlidersHorizontal}
                label="Plan Type"
                allLabel="All Types"
                displayValue={typeFilter === ALL ? "Type" : typeFilter}
                options={typeControlOptions}
                className="md:w-[160px]"
                secondary
              />
              <FilterSelect
                value={sortKey}
                onValueChange={(value) => setSortKey(value as SortKey)}
                icon={ArrowUpDown}
                label="Sort"
                allLabel="Newest"
                displayValue={
                  sortOptions.find((option) => option.value === sortKey)
                    ?.label ?? "Newest"
                }
                options={sortControlOptions}
                className="md:w-[150px]"
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
              {activeTab !== ALL && (
                <FilterChip
                  prefix="Status"
                  label={activeTab}
                  onClear={() => setActiveTab(ALL)}
                />
              )}
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
                  onClear={() => setTerritoryFilter(ALL)}
                />
              )}
              {repFilter !== ALL && (
                <FilterChip
                  prefix="Rep"
                  label={repFilter}
                  onClear={() => setRepFilter(ALL)}
                />
              )}
              {typeFilter !== ALL && (
                <FilterChip
                  prefix="Type"
                  label={
                    planTypeConfig[typeFilter as VisitPlanType]?.label ??
                    typeFilter
                  }
                  onClear={() => setTypeFilter(ALL)}
                />
              )}
              {sortKey !== "newest" && (
                <FilterChip
                  prefix="Sort"
                  label={
                    sortOptions.find((option) => option.value === sortKey)
                      ?.label ?? "Newest"
                  }
                  onClear={() => setSortKey("newest")}
                />
              )}
              {query.trim() && (
                <FilterChip
                  prefix="Search"
                  label={query.trim()}
                  onClear={() => setQuery("")}
                />
              )}
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                className="border-gp-border-control bg-white text-gp-navy-900 hover:border-gp-danger-border hover:bg-gp-danger-soft hover:text-gp-danger h-8 cursor-pointer rounded-full px-3 text-xs font-semibold shadow-none"
              >
                <XCircle className="size-3.5" aria-hidden="true" />
                Clear all
              </Button>
            </div>
          )}

          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetContent
              side="right"
              className="bg-gp-surface-page w-full gap-0 border-gp-border-default p-0 shadow-gp-dialog sm:max-w-[420px]"
              overlayClassName="bg-gp-navy-900/35"
            >
              <SheetHeader className="border-gp-border-subtle bg-white border-b px-5 py-5">
                <SheetTitle className="text-gp-navy-900 text-lg font-semibold">
                  Filters
                </SheetTitle>
                <SheetDescription className="text-gp-text-muted text-sm font-medium">
                  Narrow plans by territory, representative, type, and sort.
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-5">
                  <section>
                    <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-gp-navy-900 uppercase">
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
                        onValueChange={setTerritoryFilter}
                        icon={MapPin}
                        label="Territory"
                        allLabel="All Territories"
                        displayValue={getCompactTerritoryLabel(territoryFilter)}
                        options={territoryOptions}
                      />
                    </div>
                  </section>

                  <section>
                    <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-gp-navy-900 uppercase">
                      People
                    </p>
                    <FilterSelect
                      value={repFilter}
                      onValueChange={setRepFilter}
                      icon={UserRound}
                      label="Representative"
                      allLabel="All Representatives"
                      displayValue={repFilter === ALL ? "All Representatives" : repFilter}
                      options={representativeControlOptions}
                      secondary
                    />
                  </section>

                  <section>
                    <p className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-gp-navy-900 uppercase">
                      Plan
                    </p>
                    <div className="space-y-2">
                      <FilterSelect
                        value={typeFilter}
                        onValueChange={setTypeFilter}
                        icon={SlidersHorizontal}
                        label="Plan Type"
                        allLabel="All Types"
                        displayValue={typeFilter === ALL ? "All Types" : typeFilter}
                        options={typeControlOptions}
                        secondary
                      />
                      <FilterSelect
                        value={sortKey}
                        onValueChange={(value) => setSortKey(value as SortKey)}
                        icon={ArrowUpDown}
                        label="Sort"
                        allLabel="Newest"
                        displayValue={
                          sortOptions.find((option) => option.value === sortKey)
                            ?.label ?? "Newest"
                        }
                        options={sortControlOptions}
                        secondary
                      />
                    </div>
                  </section>
                </div>
              </div>

              <SheetFooter className="border-gp-border-subtle bg-white grid grid-cols-2 gap-2 border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="border-gp-border-control text-gp-navy-900 hover:border-gp-danger-border hover:bg-gp-danger-soft hover:text-gp-danger h-10 cursor-pointer rounded-[10px] text-sm font-semibold"
                >
                  Clear all
                </Button>
                <Button
                  type="button"
                  onClick={() => setFilterSheetOpen(false)}
                  className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] text-sm font-semibold text-white"
                >
                  <CheckCircle2
                    className="size-4 text-gp-gold-500"
                    aria-hidden="true"
                  />
                  Apply Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </header>

        <div className="bg-gp-surface-subtle/40 p-4 sm:p-5">
          {filteredPlans.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {filteredPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={index}
                  onViewDetails={openDetails}
                  onConfirm={setConfirmState}
                  disabled={isPending}
                />
              ))}
            </div>
          ) : (
            <div className="border-gp-border-control bg-gp-surface-card rounded-[14px] border border-dashed px-5 py-10 text-center">
              <span className="bg-gp-gold-50 text-gp-gold-700 mx-auto flex size-12 items-center justify-center rounded-full">
                <FileText className="size-5" aria-hidden="true" />
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
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>

        <TablePaginationFooter
          page={page}
          limit={limit}
          totalCount={totalCount}
          itemLabel="plans"
          ariaLabel="Manager plans directory pagination"
          pageNavAriaLabel="Manager plan pages"
          tone="navy"
        />
      </section>

      <PlanDetailsDrawer
        plan={selectedPlan}
        open={Boolean(selectedPlan)}
        activeTab={drawerTab}
        onTabChange={setDrawerTab}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedPlanId(null);
        }}
        onConfirm={setConfirmState}
        disabled={isPending}
      />

      <Dialog
        open={Boolean(confirmState)}
        onOpenChange={(open) => !open && closeConfirm()}
      >
        <DialogContent className="border-gp-border-default bg-gp-surface-card rounded-[16px] p-0 shadow-gp-dialog sm:max-w-[460px]">
          {confirmState && (
            <>
              <DialogHeader className="border-gp-border-subtle border-b px-5 py-5">
                <DialogTitle
                  className={cn(
                    "flex items-center gap-2 text-lg leading-6 font-semibold",
                    confirmState.type === "approve"
                      ? "text-gp-navy-900"
                      : "text-gp-danger",
                  )}
                >
                  {confirmState.type === "approve" ? (
                    <CheckCircle2
                      className="text-gp-success size-5"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="text-gp-danger size-5"
                      aria-hidden="true"
                    />
                  )}
                  {confirmState.type === "approve"
                    ? "Approve this plan?"
                    : "Reject this plan?"}
                </DialogTitle>
                <DialogDescription className="text-gp-text-muted text-sm leading-6 font-medium">
                  {confirmState.type === "approve"
                    ? "This will change the plan status to Approved."
                    : "This will change the plan status to Rejected."}
                </DialogDescription>
              </DialogHeader>

              <div className="px-5 py-4">
                <div className="border-gp-border-subtle bg-gp-surface-subtle rounded-[12px] border p-3">
                  <p className="text-gp-navy-900 truncate text-sm font-semibold">
                    {confirmState.plan.title || "Untitled Visit Plan"}
                  </p>
                  <p className="text-gp-text-muted mt-1 text-xs font-medium">
                    {getRepName(confirmState.plan)} |{" "}
                    {getSelectedDoctorsCount(
                      confirmState.plan,
                    ).toLocaleString()}{" "}
                    selected doctors
                  </p>
                </div>

                {confirmState.type === "reject" && (
                  <div className="mt-4">
                    <label
                      className="text-gp-navy-900 text-xs font-semibold"
                      htmlFor="manager-plan-reject-feedback"
                    >
                      Rejection Reason / Feedback
                    </label>
                    <Textarea
                      id="manager-plan-reject-feedback"
                      value={rejectFeedback}
                      onChange={(event) =>
                        setRejectFeedback(event.target.value)
                      }
                      placeholder="Provide constructive feedback for the representative..."
                      className="border-gp-border-control focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 mt-2 min-h-24 rounded-[10px] bg-white text-sm shadow-none"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="border-gp-border-subtle border-t px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeConfirm}
                  disabled={isPending}
                  className="border-gp-border-control h-10 cursor-pointer rounded-[10px] px-4 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitDecision}
                  disabled={isPending}
                  className={cn(
                    "h-10 cursor-pointer rounded-[10px] px-4 text-sm font-semibold text-white",
                    confirmState.type === "approve"
                      ? "bg-gp-success hover:bg-[#107349]"
                      : "bg-gp-danger hover:bg-[#971F16]",
                  )}
                >
                  {confirmState.type === "approve" ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-4" aria-hidden="true" />
                  )}
                  {isPending
                    ? "Updating..."
                    : confirmState.type === "approve"
                      ? "Approve Plan"
                      : "Reject Plan"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FilterChip({
  label,
  prefix,
  onClear,
}: {
  label: string;
  prefix?: string;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="plans-filter-chip inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-[#E8D29B] bg-[#FFF9EA] px-3 text-xs font-semibold text-[#7D5A12] transition-[background-color,border-color,color,transform] duration-[160ms] hover:border-gp-gold-500 hover:bg-gp-gold-50"
    >
      <span className="truncate">
        {prefix && <span className="text-gp-navy-900">{prefix}: </span>}
        {label}
      </span>
      <X className="size-3 shrink-0 text-gp-gold-700" aria-hidden="true" />
    </button>
  );
}

function getCompactDistrictLabel(value: string) {
  if (value === ALL) return "All Districts";
  return value.replace(" District", "");
}

function getCompactRegionLabel(value: string) {
  if (value === ALL) return "All Regions";
  return value.replace(" Region", "");
}

function getCompactTerritoryLabel(value: string) {
  if (value === ALL) return "All Territories";
  return value;
}

function getActiveFilterCount({
  activeTab,
  query,
  districtFilter,
  regionFilter,
  territoryFilter,
  repFilter,
  typeFilter,
  sortKey,
}: {
  activeTab: TabType;
  query: string;
  districtFilter: string;
  regionFilter: string;
  territoryFilter: string;
  repFilter: string;
  typeFilter: string;
  sortKey: SortKey;
}) {
  return [
    activeTab !== ALL,
    query.trim().length > 0,
    districtFilter !== ALL,
    regionFilter !== ALL,
    territoryFilter !== ALL,
    repFilter !== ALL,
    typeFilter !== ALL,
    sortKey !== "newest",
  ].filter(Boolean).length;
}

type ControlOption = {
  value: string;
  label: string;
  helper?: string;
};

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
}) {
  const isSelected = value !== ALL;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        title={isSelected ? `${label}: ${displayValue ?? value}` : allLabel}
        className={cn(
          "plans-filter-control h-11 w-full cursor-pointer rounded-[12px] border bg-white px-3 text-sm font-semibold shadow-none transition-[border-color,background-color,box-shadow,color] duration-[150ms] focus-visible:border-gp-gold-500 focus-visible:ring-3 focus-visible:ring-gp-gold-500/10 [&>svg:last-child]:text-gp-text-placeholder",
          isSelected
            ? "border-gp-gold-500 bg-gp-surface-hover text-gp-navy-900"
            : "border-gp-border-default text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-surface-hover",
          secondary && !isSelected && "text-gp-text-secondary",
          className,
        )}
      >
        <Icon className="size-4 shrink-0 text-gp-gold-600" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">
          {displayValue ?? allLabel}
        </span>
      </SelectTrigger>
      <SelectContent className="plans-select-content border-gp-border-control bg-white p-0 shadow-gp-popover [&>div:not([data-slot])]:p-1">
        <SelectItem
          value={ALL}
          className="h-10 cursor-pointer rounded-[8px] py-0 pr-8 pl-2 text-sm font-semibold text-gp-text-secondary focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="size-4 shrink-0 text-gp-gold-600" aria-hidden="true" />
            <span className="truncate">{allLabel}</span>
          </span>
        </SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-10 cursor-pointer rounded-[8px] py-1.5 pr-8 pl-2 text-sm font-semibold text-gp-navy-900 focus:bg-gp-gold-50 focus:text-gp-navy-900 data-[state=checked]:bg-gp-gold-50 data-[state=checked]:text-gp-navy-900"
          >
            <span className="flex min-w-0 items-start gap-2">
              <Icon
                className="mt-0.5 size-4 shrink-0 text-gp-gold-600"
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
      </SelectContent>
    </Select>
  );
}
