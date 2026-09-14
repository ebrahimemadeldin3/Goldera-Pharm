"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPinned,
  Phone,
  Route,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SafeCldImage } from "@/components/ui/safe-cld-image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getInitials, getSaudiDateParts } from "@/lib/utils";
import { User, RegionData } from "@/features/team/lib/types";
import { Region } from "@/lib/types/regions";
import {
  CopyableValue,
  formatMaybeDate,
  getServiceDuration,
  MissingValue,
  RolePill,
  StatusPill,
} from "./ProfileInfoCards";
import { getTeamMemberAssignment } from "@/features/team/lib/utils";

type EditableProfileFields = {
  name: string;
  email: string;
  phone: string;
  region: RegionData;
  isActive: boolean;
  role: "SUPERVISOR" | "MEDICAL_REP";
};

type DetailsProps = {
  data: User;
  isEditMode?: boolean;
  editedData?: EditableProfileFields;
  regions?: Region[];
  onFieldChange?: <K extends keyof EditableProfileFields>(
    field: K,
    value: EditableProfileFields[K],
  ) => void;
};

type ContactRowProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
  title?: string;
};

type MetricItemProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  helper: string;
  progress?: number;
  delay: number;
};

const inputClassName =
  "h-10 rounded-[10px] border-gp-border-control bg-gp-surface-control text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10";

function useAnimatedNumber(value: number | null, duration = 320) {
  const [displayValue, setDisplayValue] = useState(value ?? 0);

  useEffect(() => {
    if (value === null || !Number.isFinite(value)) return;

    const targetValue = value;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;

    if (reduceMotion) {
      frame = window.requestAnimationFrame(() => setDisplayValue(targetValue));
      return () => window.cancelAnimationFrame(frame);
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(targetValue * eased));

      if (progress < 1) frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration, value]);

  return displayValue;
}

function ContactRow({
  icon: Icon,
  label,
  children,
  className,
  title,
}: ContactRowProps) {
  return (
    <div
      className={cn(
        "member-profile-contact-row text-gp-text-secondary flex min-w-0 items-start gap-2.5 rounded-[9px] px-2 py-2 text-sm font-medium",
        className,
      )}
    >
      <Icon
        className="text-gp-navy-800 mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.05em] uppercase">
          {label}
        </p>
        <div
          className="text-gp-navy-900 mt-1 min-w-0 text-sm leading-5 font-semibold break-words"
          title={title}
        >
          <span className="sr-only">{label}: </span>
          {children}
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  icon: Icon,
  label,
  value,
  helper,
  progress,
  delay,
}: MetricItemProps) {
  return (
    <article
      className="member-profile-metric-item member-profile-metric-enter min-w-0 p-4 sm:p-5"
      style={{ "--member-profile-delay": `${delay}ms` } as CSSProperties}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="member-profile-kpi-icon bg-gp-navy-900 text-gp-gold-500 flex size-9 shrink-0 items-center justify-center rounded-[10px]">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
            {label}
          </p>
          <div className="text-gp-text-primary mt-1.5 min-h-7 text-xl leading-7 font-semibold">
            {value}
          </div>
        </div>
      </div>
      {typeof progress === "number" && (
        <Progress
          value={progress}
          className="member-profile-progress bg-gp-border-subtle mt-3 h-1.5"
          indicatorClassName="bg-gp-gold-500"
          aria-label={`${label}: ${progress}%`}
        />
      )}
      <p className="text-gp-text-muted mt-1.5 text-xs leading-4 font-medium">
        {helper}
      </p>
    </article>
  );
}

function FieldValue({
  label,
  value,
  fallback = "Not assigned",
}: {
  label: string;
  value?: string;
  fallback?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.05em] uppercase">
        {label}
      </dt>
      <dd className="text-gp-navy-900 mt-1 text-sm leading-5 font-semibold break-words">
        {value ? (
          <span title={value}>{value}</span>
        ) : (
          <MissingValue>{fallback}</MissingValue>
        )}
      </dd>
    </div>
  );
}

export default function Details({
  data,
  isEditMode = false,
  editedData,
  regions = [],
  onFieldChange,
}: DetailsProps) {
  const displayData =
    isEditMode && editedData ? { ...data, ...editedData } : data;
  const serviceDuration = getServiceDuration(displayData);
  const targetPercentage =
    typeof data.targetPercentage === "number" &&
    Number.isFinite(data.targetPercentage)
      ? Math.min(Math.max(data.targetPercentage, 0), 100)
      : null;
  const monthlyVisits =
    typeof data.monthlyVisits === "number" &&
    Number.isFinite(data.monthlyVisits)
      ? Math.max(0, data.monthlyVisits)
      : null;
  const animatedTarget = useAnimatedNumber(targetPercentage);
  const animatedVisits = useAnimatedNumber(monthlyVisits);
  const assignment = getTeamMemberAssignment(displayData);
  const joinedDate = formatMaybeDate(data.joinedDate);
  const lastLogin = formatMaybeDate(data.lastLogin, true);
  const supervisorName = assignment.reportsTo || "";
  const employeeId = displayData.employeeId || "";
  const joinedDateValue = data.joinedDate ? new Date(data.joinedDate) : null;
  const joinedYear =
    joinedDateValue && !Number.isNaN(joinedDateValue.getTime())
      ? getSaudiDateParts(joinedDateValue).year
      : "";

  const subRegions = useMemo(() => {
    if (!editedData?.region?.id) return [];
    const selectedRegion = regions.find(
      (region) => region.id === editedData.region.id,
    );
    return selectedRegion?.subRegions || [];
  }, [editedData, regions]);

  return (
    <section className="flex w-full flex-col gap-5">
      <Card className="member-profile-hero member-profile-section-enter border-gp-border-default shadow-gp-card relative gap-0 overflow-hidden rounded-[16px] border bg-[linear-gradient(135deg,#FFFFFF_0%,#FFFFFF_70%,#FFFBF0_100%)] py-0 before:absolute before:inset-y-5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-gp-navy-900">
        <CardContent className="p-5 sm:p-6">
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(280px,1fr)] lg:items-start lg:gap-6">
            <div className="member-profile-identity min-w-0 text-center sm:text-left">
              <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-start">
                <div className="member-profile-avatar relative size-24 shrink-0 sm:size-[104px]">
                  <div className="member-profile-avatar-ring border-gp-gold-300 bg-gp-gold-50 shadow-gp-card size-full overflow-hidden rounded-full border-[3px] ring-4 ring-white">
                    {data.avatar ? (
                      <SafeCldImage
                        src={data.avatar}
                        alt={`Profile photo of ${displayData.name}`}
                        width={112}
                        height={112}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        className="bg-gp-navy-900 flex size-full items-center justify-center text-3xl font-semibold text-white"
                        role="img"
                        aria-label={`Avatar for ${displayData.name}`}
                      >
                        {getInitials(displayData.name)}
                      </div>
                    )}
                  </div>
                  <span
                    aria-label={
                      displayData.isActive ? "Active member" : "Inactive member"
                    }
                    className={cn(
                      "member-profile-online-indicator absolute right-1 bottom-2 size-4 rounded-full border-2 border-white",
                      displayData.isActive
                        ? "bg-gp-success"
                        : "bg-gp-text-placeholder",
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {isEditMode ? (
                    <Input
                      value={displayData.name || ""}
                      onChange={(event) =>
                        onFieldChange?.("name", event.target.value)
                      }
                      className={`${inputClassName} mx-auto max-w-xl text-base font-semibold sm:mx-0 sm:text-lg`}
                      placeholder="Name"
                    />
                  ) : (
                    <h2
                      className="text-gp-navy-900 text-[24px] leading-tight font-semibold break-words sm:text-[28px]"
                      title={displayData.name}
                      dir="auto"
                    >
                      {displayData.name}
                    </h2>
                  )}

                  <div className="member-profile-status mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <RolePill role={displayData.role} />
                    {isEditMode ? (
                      <div className="border-gp-border-control bg-gp-surface-subtle inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
                        <Switch
                          checked={displayData.isActive}
                          onCheckedChange={(checked) =>
                            onFieldChange?.("isActive", checked)
                          }
                          className="scale-75"
                          aria-label="Toggle member active status"
                        />
                        <span className="text-gp-text-secondary text-xs font-bold">
                          {displayData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    ) : (
                      <StatusPill active={displayData.isActive} />
                    )}
                  </div>

                  <div className="border-gp-border-subtle bg-gp-surface-subtle mt-4 rounded-[12px] border px-3.5 py-3">
                    <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.05em] uppercase">
                      Employee ID
                    </p>
                    <p className="text-gp-navy-900 mt-1 text-sm font-semibold">
                      {employeeId || <MissingValue>Not assigned</MissingValue>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="member-profile-contact-panel border-gp-border-subtle bg-white rounded-[14px] border p-3">
              <div className="mb-2 flex items-center gap-2 px-2 pt-1">
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 items-center justify-center rounded-[9px] border">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-gp-navy-900 text-sm font-semibold">
                    Contact & Reporting
                  </p>
                  <p className="text-gp-text-muted text-xs font-medium">
                    Account contact and manager line
                  </p>
                </div>
              </div>
              <div className="grid gap-1">
                <ContactRow
                  icon={Mail}
                  label="Email"
                  title={displayData.email || undefined}
                >
                  {isEditMode ? (
                    <Input
                      value={displayData.email || ""}
                      onChange={(event) =>
                        onFieldChange?.("email", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="Email"
                      type="email"
                    />
                  ) : (
                    <CopyableValue value={displayData.email} label="Email" />
                  )}
                </ContactRow>
                <ContactRow icon={Phone} label="Phone">
                  {isEditMode ? (
                    <Input
                      value={displayData.phone || ""}
                      onChange={(event) =>
                        onFieldChange?.("phone", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="Phone"
                    />
                  ) : (
                    <CopyableValue value={displayData.phone} label="Phone" />
                  )}
                </ContactRow>
                <ContactRow
                  icon={UsersRound}
                  label="Reports To"
                  title={supervisorName || undefined}
                >
                  {supervisorName || <MissingValue>Not assigned</MissingValue>}
                </ContactRow>
                <ContactRow icon={CalendarDays} label="Joined">
                  {joinedDate ? (
                    `Joined ${joinedDate}`
                  ) : (
                    <MissingValue>Join date not provided</MissingValue>
                  )}
                </ContactRow>
              </div>
            </div>

            <aside className="member-profile-highlights border-gp-border-subtle bg-gp-surface-subtle rounded-[14px] border p-4">
              <div className="flex items-center gap-2">
                <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 items-center justify-center rounded-[9px] border">
                  <MapPinned className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-gp-navy-900 text-sm font-semibold">
                    Field Assignment
                  </p>
                  <p className="text-gp-text-muted text-xs font-medium">
                    Territory and reporting scope
                  </p>
                </div>
              </div>

              {isEditMode ? (
                <div className="mt-4 grid gap-2">
                  <Select
                    value={editedData?.region?.id || ""}
                    onValueChange={(regionId) => {
                      const selectedRegion = regions.find(
                        (region) => region.id === regionId,
                      );
                      if (selectedRegion) {
                        onFieldChange?.("region", {
                          name: selectedRegion.name,
                          id: selectedRegion.id,
                          subRegion: { name: "", id: "" },
                        });
                      }
                    }}
                  >
                    <SelectTrigger className={`${inputClassName} w-full`}>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={editedData?.region?.subRegion?.id || ""}
                    onValueChange={(subRegionId) => {
                      const selectedSubRegion = subRegions.find(
                        (subRegion) => subRegion.id === subRegionId,
                      );
                      if (selectedSubRegion && editedData?.region) {
                        onFieldChange?.("region", {
                          ...editedData.region,
                          subRegion: {
                            name: selectedSubRegion.name,
                            id: selectedSubRegion.id,
                          },
                        });
                      }
                    }}
                    disabled={!editedData?.region?.id || subRegions.length === 0}
                  >
                    <SelectTrigger className={`${inputClassName} w-full`}>
                      <SelectValue placeholder="Select territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subRegions.map((subRegion) => (
                        <SelectItem key={subRegion.id} value={subRegion.id}>
                          {subRegion.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <dl className="mt-4 grid gap-3">
                  <FieldValue label="District" value={assignment.district} />
                  <FieldValue label="Region" value={assignment.region} />
                  <FieldValue label="Territory" value={assignment.territory} />
                </dl>
              )}

              <dl className="border-gp-border-subtle mt-4 grid gap-3 border-t pt-4">
                <div className="min-w-0">
                  <dt className="text-gp-text-muted text-[11px] font-semibold tracking-[0.05em] uppercase">
                    Status
                  </dt>
                  <dd
                    className={cn(
                      "mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
                      assignment.hasTerritory
                        ? "border-gp-success-border bg-gp-success-soft text-gp-success"
                        : "border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700",
                    )}
                  >
                    {assignment.hasTerritory ? (
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    )}
                    {assignment.hasTerritory ? "Assigned" : "Incomplete"}
                  </dd>
                </div>
                <FieldValue
                  label="Last login"
                  value={lastLogin}
                  fallback="Never"
                />
              </dl>
            </aside>
          </div>
        </CardContent>
      </Card>

      <section
        aria-labelledby="member-performance-summary"
        className="member-profile-performance-strip member-profile-section-enter border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border"
        style={{ "--member-profile-delay": "110ms" } as CSSProperties}
      >
        <h2 id="member-performance-summary" className="sr-only">
          Performance summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <MetricItem
            icon={BriefcaseBusiness}
            label="Total Sales"
            value={
              data.totalSales ? (
                data.totalSales
              ) : (
                <MissingValue>No sales activity yet</MissingValue>
              )
            }
            helper={
              data.totalSales
                ? "Recorded total for this member"
                : "No sales records found for this employee"
            }
            delay={150}
          />
          <MetricItem
            icon={Target}
            label="Target Achievement"
            value={
              targetPercentage !== null ? (
                `${animatedTarget}%`
              ) : (
                <MissingValue>Target not assigned</MissingValue>
              )
            }
            helper={
              targetPercentage !== null
                ? "Current progress"
                : "No target data available"
            }
            progress={targetPercentage !== null ? animatedTarget : undefined}
            delay={200}
          />
          <MetricItem
            icon={Route}
            label="Completed Visits"
            value={
              monthlyVisits !== null ? (
                animatedVisits
              ) : (
                <MissingValue>No completed visits yet</MissingValue>
              )
            }
            helper={
              monthlyVisits !== null
                ? "Recorded visit activity"
                : "No completed visits recorded"
            }
            delay={250}
          />
          <MetricItem
            icon={Award}
            label="Years of Service"
            value={
              serviceDuration ? (
                serviceDuration
              ) : (
                <MissingValue>Recruitment date unavailable</MissingValue>
              )
            }
            helper={
              serviceDuration && joinedYear
                ? `Since ${joinedYear}`
                : "Recruitment date unavailable"
            }
            delay={300}
          />
        </div>
      </section>
    </section>
  );
}
