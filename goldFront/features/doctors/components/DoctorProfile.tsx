"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseMedical,
  Building2,
  Calendar,
  CalendarDays,
  CircleSlash,
  ClipboardList,
  Ellipsis,
  IdCard,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Save,
  SquarePen,
  Stethoscope,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import type { DoctorProfileData } from "../lib/types";
import type { DoctorApiResponse } from "../lib/types/api";
import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import { getSchedulableDoctorsAction } from "@/features/doctors/api";
import { useRoleUI } from "@/core/ui/role-ui-context";
import RemoveDoctorDialog from "./dialogs/RemoveDoctorDialog";
import InactivateDoctorDialog from "./dialogs/InactivateDoctorDialog";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { useEditDoctor } from "../hooks/useEditDoctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageContainer } from "@/components/layout/page-container";
import {
  cn,
  formatSaudiDateDisplay,
  getInitials,
  parseDateValue,
} from "@/lib/utils";
import {
  KSA_TERRITORY_STRUCTURE,
  getTerritoryLookup,
} from "@/features/plan/lib/territory";

type DoctorProfileProps = {
  doctor: DoctorProfileData;
};

const fieldClassName =
  "border-gp-border-default bg-white text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10 h-10 rounded-[10px] text-sm font-medium shadow-none";

function cleanText(value?: string | null) {
  const text = String(value ?? "").trim();
  if (!text || text.toLowerCase().includes("undefined") || text.toLowerCase().includes("null")) {
    return null;
  }
  return text;
}

function valueOrFallback(value?: string | number | null, fallback = "Not provided") {
  if (typeof value === "number") return String(value);
  return cleanText(value) ?? fallback;
}

function visitDateValue(visit: VisitApiResponse) {
  return parseDateValue(visit.date).getTime();
}

function formatVisitType(value?: string) {
  if (!value) return "Visit";
  if (value === "CHECK") return "Check Visit";
  if (value === "COACHING") return "Coaching Visit";
  if (value === "MANAGER") return "Manager Visit";
  return value;
}

function formatSamples(samples: VisitApiResponse["samples"]) {
  if (!samples?.length) return "No samples";
  return `${samples.length} ${samples.length === 1 ? "product" : "products"}`;
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        active
          ? "border-gp-success-border bg-gp-success-soft text-gp-success"
          : "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-gp-success" : "bg-gp-danger",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  index,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof Stethoscope;
  index: number;
}) {
  return (
    <div
      className="border-gp-border-default bg-gp-surface-card shadow-gp-card flex items-center gap-3 rounded-[14px] border p-4 opacity-0 [animation:plans-card-in_350ms_ease-out_forwards] motion-reduce:opacity-100 motion-reduce:[animation:none]"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-10 shrink-0 items-center justify-center rounded-[10px] border">
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-gp-text-muted truncate text-[11px] font-semibold tracking-[0.06em] uppercase">
          {label}
        </p>
        <p className="text-gp-navy-900 mt-1 truncate text-xl leading-none font-semibold">
          {value}
        </p>
        <p className="text-gp-text-placeholder mt-1 truncate text-xs font-medium">
          {helper}
        </p>
      </div>
    </div>
  );
}

function DetailCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Stethoscope;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5 transition-[border-color,box-shadow,transform] duration-[200ms] hover:-translate-y-0.5 hover:border-gp-gold-300 hover:shadow-[0_10px_24px_rgba(16,29,54,0.08)] motion-reduce:transform-none",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-9 items-center justify-center rounded-[10px] border">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <h2 className="text-gp-navy-900 text-base font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon: typeof Stethoscope;
}) {
  const content = (
    <span className="mt-1 block truncate text-sm font-semibold text-gp-navy-900" dir="auto">
      {value}
    </span>
  );

  return (
    <div className="border-gp-border-subtle bg-gp-surface-subtle/80 rounded-[10px] border px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-gp-gold-600" aria-hidden="true" />
        <span className="text-gp-text-muted text-[11px] font-semibold tracking-[0.04em] uppercase">
          {label}
        </span>
      </div>
      {href ? (
        <a href={href} className="hover:text-gp-gold-700">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function DoctorProfile({ doctor }: DoctorProfileProps) {
  const pathname = usePathname();
  const { features, role } = useRoleUI();
  const isRep = role === "MEDICAL_REP" || pathname?.startsWith("/rep");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState<DoctorApiResponse[]>([]);
  const {
    isEditMode,
    editedData,
    isPending,
    updateField,
    toggleEditMode,
    saveChanges,
    cancelEdit,
  } = useEditDoctor(doctor);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [now] = useState(() => Date.now());

  const primaryName =
    cleanText(doctor.nameAR) || cleanText(doctor.nameEN) || "Unnamed Doctor";
  const secondaryName =
    cleanText(doctor.nameAR) && cleanText(doctor.nameEN)
      ? cleanText(doctor.nameEN)
      : null;
  const initials = getInitials(cleanText(doctor.nameEN) || primaryName);
  const territory = getTerritoryLookup(doctor.subRegion || doctor.area);
  const visits = useMemo(
    () =>
      [...(doctor.visits ?? [])].sort(
        (left, right) => visitDateValue(right) - visitDateValue(left),
      ),
    [doctor.visits],
  );
  const lastVisit = visits[0];
  const upcomingVisit = visits
    .filter((visit) => visitDateValue(visit) >= now)
    .sort((left, right) => visitDateValue(left) - visitDateValue(right))[0];

  const getBackLink = () => {
    if (isRep) return "/rep/doctors";
    if (role === "MANAGER") return "/manager/doctors";
    if (role === "SUPERVISOR") return "/supervisor/doctors";
    return "/rep/doctors";
  };

  const displayName = doctor.nameEN || doctor.nameAR;

  const openSchedule = async () => {
    if (doctorsList.length === 0) {
      const doctorsRes = await getSchedulableDoctorsAction();
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleOpen(true);
    setScheduleDialogOpen(true);
  };
  const handleOpenSchedule = openSchedule;

  const startEdit = () => {
    if (!isEditMode) toggleEditMode();
  };

  const currentEditTerritory = getTerritoryLookup(
    editedData.subRegion || editedData.area,
  );
  const editDistrict = currentEditTerritory.district;
  const editRegion = currentEditTerritory.region;
  const editRegions =
    KSA_TERRITORY_STRUCTURE.find((item) => item.name === editDistrict)?.regions ??
    [];
  const editTerritories =
    editRegions.find((item) => item.name === editRegion)?.territories ?? [];

  if (isRep) {
    return (
      <PageContainer className="flex flex-col gap-5 pb-20 lg:pb-6">
        {/* Rep Doctor Profile Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/rep/doctors"
              className="inline-flex size-10 items-center justify-center rounded-[10px] border border-[#E5E8EF] bg-white text-[#344054] transition-colors hover:bg-[#F9FAFB]"
              aria-label="Back to doctors directory"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#182033]">
                  {displayName}
                </h1>
                {doctor.grade && (
                  <span className="rounded-md border border-[#E5E8EF] bg-[#F9FAFB] px-2 py-0.5 text-xs font-semibold text-[#344054]">
                    Grade {doctor.grade}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-medium text-[#667085]">
                {doctor.specialty || "Doctor"} {doctor.subRegion ? `• ${doctor.subRegion}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleOpenSchedule}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-gp-rep-primary px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all hover:bg-gp-rep-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-rep-primary/30"
            >
              <Calendar size={16} />
              <span>Schedule Visit</span>
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Info & Account Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            {/* Contact & Location Card */}
            <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 space-y-3.5">
              <h3 className="text-sm font-semibold text-[#182033] border-b border-[#EEF1F6] pb-2">
                Contact & Location
              </h3>

              <div className="space-y-2.5 text-xs text-[#344054]">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-[#8A94A6] shrink-0" />
                  <span className={doctor.phone ? "font-medium text-[#182033]" : "italic text-[#8A94A6]"}>
                    {doctor.phone || "No phone provided"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 truncate">
                  <Mail size={15} className="text-[#8A94A6] shrink-0" />
                  <span className={doctor.email ? "font-medium text-[#182033] truncate" : "italic text-[#8A94A6]"}>
                    {doctor.email || "No email provided"}
                  </span>
                </div>

                {doctor.subRegion && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={15} className="text-[#8A94A6] shrink-0" />
                    <span className="font-medium text-[#182033]">
                      {doctor.subRegion}{doctor.area ? `, ${doctor.area}` : ""}
                    </span>
                  </div>
                )}

                {doctor.avgPatientsPerDay && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <Stethoscope size={15} className="text-[#8A94A6] shrink-0" />
                    <span>
                      Volume: <strong className="font-semibold text-[#182033]">{doctor.avgPatientsPerDay} patients/day</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital / Account Card */}
            <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 space-y-2">
              <h3 className="text-sm font-semibold text-[#182033] border-b border-[#EEF1F6] pb-2">
                Hospital / Account
              </h3>
              {doctor.accountName ? (
                <div className="flex items-start gap-2.5 rounded-[10px] border border-[#E5E8EF] bg-[#FBFCFE] p-3 text-xs">
                  <Building2 size={16} className="text-gp-rep-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#182033]">{doctor.accountName}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">
                      {doctor.subRegion || "Region"}{doctor.area ? `, ${doctor.area}` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8A94A6] italic">No hospital/account assigned</p>
              )}
            </div>
          </div>

          {/* Recent Visits Main Section */}
          <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#182033]">
                  Recent Visit History
                </h3>
                <p className="text-xs text-[#667085]">
                  Past medical visits and completion status with Dr. {displayName}
                </p>
              </div>

              <Button
                type="button"
                onClick={handleOpenSchedule}
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-[9px] border-[#E5E8EF] text-xs font-semibold text-[#344054] hover:border-gp-rep-primary-border hover:bg-gp-rep-primary-soft hover:text-gp-rep-primary cursor-pointer"
              >
                <Calendar size={14} />
                Schedule Visit
              </Button>
            </div>

            {doctor.visits && doctor.visits.length > 0 ? (
              <div className="space-y-2.5">
                {doctor.visits.map((visit: VisitApiResponse, idx: number) => {
                  const statusStyles: Record<string, string> = {
                    COMPLETED: "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]",
                    SCHEDULED: "bg-[#FFF8E5] text-[#B18732] border-[#E9DDB8]",
                    IN_PROGRESS: "bg-[#EDF4FF] text-[#3972D5] border-[#D7E5FF]",
                    CANCELLED: "bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]",
                  };

                  return (
                    <div
                      key={visit.id || idx}
                      className="flex flex-col gap-2 rounded-[10px] border border-[#EEF1F6] bg-[#FBFCFE] p-3.5 sm:flex-row sm:items-center sm:justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#182033]">
                            {formatSaudiDateDisplay(parseDateValue(visit.date))}
                          </span>
                          {visit.visitType && (
                            <span className="rounded-md border border-[#E5E8EF] bg-white px-2 py-0.5 text-[10px] font-medium text-[#667085]">
                              {visit.visitType}
                            </span>
                          )}
                        </div>
                        {visit.notes && (
                          <p className="text-xs text-[#667085] line-clamp-1">{visit.notes}</p>
                        )}
                      </div>

                      <span
                        className={cn(
                          "inline-flex items-center self-start sm:self-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                          statusStyles[visit.status] || "bg-[#F9FAFB] text-[#344054] border-[#E5E8EF]"
                        )}
                      >
                        {visit.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] py-10 text-center">
                <Calendar className="size-8 text-[#98A2B3]" />
                <p className="mt-3 text-sm font-semibold text-[#182033]">
                  No recent visits recorded
                </p>
                <p className="mt-1 text-xs text-[#667085]">
                  You haven&apos;t scheduled or reported any visits with this doctor yet.
                </p>
                <Button
                  type="button"
                  onClick={handleOpenSchedule}
                  className="mt-4 h-9 gap-1.5 rounded-[9px] bg-gp-rep-primary text-white hover:bg-gp-rep-primary-hover text-xs font-semibold cursor-pointer"
                >
                  <Calendar size={14} />
                  Schedule First Visit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Visit Modal Dialog */}
        {scheduleDialogOpen && (
          <AddVisitDialog
            open={scheduleDialogOpen}
            onOpenChange={setScheduleDialogOpen}
            role="MEDICAL_REP"
            doctors={doctorsList}
            initialDoctorId={doctor.id}
          />
        )}
      </PageContainer>
    );
  }


  return (
    <PageContainer className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <Link
          href={getBackLink()}
          className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors"
          aria-label="Back to doctors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-gp-gold-700 text-[11px] font-semibold tracking-[0.14em] uppercase">
            Doctor Profile
          </p>
          <h1 className="text-gp-navy-900 mt-1 text-2xl font-semibold md:text-3xl">
            {primaryName}
          </h1>
        </div>
      </header>

      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card relative overflow-hidden rounded-[18px] border p-5 opacity-0 [animation:plans-card-in_350ms_ease-out_forwards] motion-reduce:opacity-100 motion-reduce:[animation:none]">
        <span className="bg-gp-navy-900 absolute top-5 bottom-5 left-0 w-[4px] rounded-r-full" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="border-gp-gold-300 bg-gp-navy-900 text-gp-gold-500 flex size-16 shrink-0 items-center justify-center rounded-[16px] border text-lg font-semibold shadow-[0_8px_18px_rgba(16,29,54,0.16)]">
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="text-gp-navy-900 truncate text-2xl leading-8 font-semibold" dir="auto">
                {primaryName}
              </h2>
              {secondaryName && (
                <p className="text-gp-text-muted mt-1 truncate text-base font-medium">
                  {secondaryName}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                    isRep
                      ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                      : "border-[#E8D7A8] bg-[#F8F4E9] text-[#8A681F]",
                  )}
                >
                  {valueOrFallback(doctor.specialty, "Specialty not assigned")}
                </span>
                <span className="border-gp-border-control bg-gp-surface-control text-gp-navy-900 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                  Grade {valueOrFallback(doctor.grade, "Not assigned")}
                </span>
                <StatusPill active={doctor.isActive} />
              </div>
              <div className="text-gp-text-muted mt-4 grid gap-1.5 text-sm font-medium">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-gp-gold-600" />
                  <span className="truncate" dir="auto">
                    {valueOrFallback(doctor.accountName, "Facility not assigned")}
                  </span>
                </span>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <MapPinned className="size-4 shrink-0 text-gp-gold-600" />
                  <span className="truncate">
                    {territory.region} · {territory.territory}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            {features.visits.addToDoctorProfile || features.visits.canScheduleVisit ? (
              <Button
                type="button"
                onClick={openSchedule}
                className="group bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 cursor-pointer rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,box-shadow,transform] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.2)] motion-reduce:transform-none"
              >
                <CalendarDays className="size-4 text-gp-gold-500 transition-transform duration-[170ms] group-hover:-translate-y-0.5" />
                Schedule Visit
              </Button>
            ) : null}
            {features.doctors.canEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={startEdit}
                disabled={isEditMode}
                className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 cursor-pointer rounded-[10px] px-4 text-sm font-semibold shadow-none"
              >
                <SquarePen className="size-4 text-gp-gold-600" />
                Edit Profile
              </Button>
            )}
            {(features.doctors.canInactive || features.doctors.canRemove) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gp-border-control text-gp-navy-900 h-10 cursor-pointer rounded-[10px] px-3 shadow-none"
                    aria-label="More doctor actions"
                  >
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-gp-border-control bg-white p-1 shadow-gp-popover"
                >
                  {features.doctors.canInactive && (
                    <InactivateDoctorDialog
                      doctorId={doctor.id}
                      doctorName={primaryName}
                      isActive={doctor.isActive}
                      trigger={
                        <button
                          type="button"
                          className="text-gp-navy-900 hover:bg-gp-gold-50 flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2 py-2 text-left text-sm font-semibold"
                        >
                          <UserCheck className="size-4 text-gp-gold-600" />
                          {doctor.isActive ? "Set as Inactive" : "Reactivate"}
                        </button>
                      }
                    />
                  )}
                  {features.doctors.canRemove && (
                    <RemoveDoctorDialog
                      doctorId={doctor.id}
                      doctorName={primaryName}
                      trigger={
                        <button
                          type="button"
                          className="text-gp-danger hover:bg-gp-danger-soft flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2 py-2 text-left text-sm font-semibold"
                        >
                          <CircleSlash className="size-4" />
                          Remove Doctor
                        </button>
                      }
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </section>

      {isEditMode && (
        <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-gp-navy-900 text-base font-semibold">
                Edit Doctor Profile
              </h2>
              <p className="text-gp-text-muted mt-1 text-sm font-medium">
                Update identity, professional, contact, territory and account details.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={isPending}
                className="border-gp-border-control h-10 rounded-[10px] text-sm font-semibold"
              >
                <X className="size-4" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={saveChanges}
                disabled={isPending}
                className="bg-gp-navy-900 h-10 rounded-[10px] text-sm font-semibold text-white"
              >
                <Save className="size-4 text-gp-gold-500" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input value={editedData.nameEN} onChange={(event) => updateField("nameEN", event.target.value)} className={fieldClassName} placeholder="English Name" />
            <Input value={editedData.nameAR} onChange={(event) => updateField("nameAR", event.target.value)} className={fieldClassName} placeholder="Arabic Name" dir="auto" />
            <Input value={editedData.specialty} onChange={(event) => updateField("specialty", event.target.value)} className={fieldClassName} placeholder="Specialty" />
            <Select value={editedData.grade} onValueChange={(value) => updateField("grade", value)}>
              <SelectTrigger className={fieldClassName}><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent className="plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover">
                {["A", "B", "C", "D"].map((grade) => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input value={editedData.LicenseNumber ?? ""} onChange={(event) => updateField("LicenseNumber", event.target.value || null)} className={fieldClassName} placeholder="License Number" />
            <Input type="number" min={0} value={editedData.avgPatientsPerDay?.toString() ?? ""} onChange={(event) => updateField("avgPatientsPerDay", event.target.value === "" ? null : Number(event.target.value))} className={fieldClassName} placeholder="Avg Patients / Day" />
            <Input value={editedData.phone} onChange={(event) => updateField("phone", event.target.value)} className={fieldClassName} placeholder="Phone" />
            <Input type="email" value={editedData.email ?? ""} onChange={(event) => updateField("email", event.target.value || null)} className={fieldClassName} placeholder="Email" />
            <Select value={editDistrict} onValueChange={(value) => {
              const firstRegion = KSA_TERRITORY_STRUCTURE.find((item) => item.name === value)?.regions[0];
              const firstTerritory = firstRegion?.territories[0];
              updateField("subRegion", firstTerritory?.name ?? "");
            }}>
              <SelectTrigger className={fieldClassName}><SelectValue placeholder="District" /></SelectTrigger>
              <SelectContent className="plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover">
                {KSA_TERRITORY_STRUCTURE.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={editRegion} onValueChange={(value) => {
              const firstTerritory = editRegions.find((item) => item.name === value)?.territories[0];
              updateField("subRegion", firstTerritory?.name ?? "");
            }}>
              <SelectTrigger className={fieldClassName}><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent className="plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover">
                {editRegions.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={editedData.subRegion} onValueChange={(value) => updateField("subRegion", value)}>
              <SelectTrigger className={fieldClassName}><SelectValue placeholder="Territory" /></SelectTrigger>
              <SelectContent className="plans-select-content border-gp-border-control bg-white p-1 shadow-gp-popover">
                {editTerritories.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={editedData.accountName} onChange={(event) => updateField("accountName", event.target.value)} className={fieldClassName} placeholder="Account / Facility" dir="auto" />
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visits" value={visits.length} helper="Loaded visit records" icon={ClipboardList} index={0} />
        <MetricCard label="Last Visit" value={lastVisit ? formatSaudiDateDisplay(parseDateValue(lastVisit.date)) : "None"} helper={lastVisit ? formatVisitType(lastVisit.visitType) : "No visits recorded"} icon={CalendarDays} index={1} />
        <MetricCard label="Avg. Patients / Day" value={doctor.avgPatientsPerDay ?? "Not recorded"} helper="Daily average" icon={Stethoscope} index={2} />
        <MetricCard label="Status" value={doctor.isActive ? "Active" : "Inactive"} helper="Current lifecycle state" icon={UserCheck} index={3} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <DetailCard title="Professional Information" icon={Stethoscope}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem label="Specialty" value={valueOrFallback(doctor.specialty, "Not assigned")} icon={BriefcaseMedical} />
              <DetailItem label="Grade" value={valueOrFallback(doctor.grade, "Not assigned")} icon={UserRound} />
              <DetailItem label="License Number" value={valueOrFallback(doctor.LicenseNumber)} icon={IdCard} />
              <DetailItem label="Avg Patients / Day" value={doctor.avgPatientsPerDay === null ? "Not recorded" : String(doctor.avgPatientsPerDay)} icon={Stethoscope} />
            </div>
          </DetailCard>

          <DetailCard title="Contact & Facility" icon={Building2}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DetailItem label="Phone" value={valueOrFallback(doctor.phone)} href={cleanText(doctor.phone) ? `tel:${doctor.phone}` : undefined} icon={Phone} />
              <DetailItem label="Email" value={valueOrFallback(doctor.email)} href={cleanText(doctor.email) ? `mailto:${doctor.email}` : undefined} icon={Mail} />
              <DetailItem label="Facility" value={valueOrFallback(doctor.accountName, "Not assigned")} icon={Building2} />
              <DetailItem label="Territory" value={`${territory.region} · ${territory.territory}`} icon={MapPinned} />
            </div>
          </DetailCard>

          <DetailCard title="Visit History" icon={CalendarDays}>
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="outline" onClick={openSchedule} className="border-gp-gold-300 text-gp-gold-700 hover:bg-gp-gold-50 h-9 rounded-[10px] text-xs font-semibold">
                <CalendarDays className="size-3.5" />
                Schedule New Visit
              </Button>
            </div>
            {visits.length > 0 ? (
              <div className="space-y-3">
                {visits.slice(0, 6).map((visit) => (
                  <div key={visit.id} className="border-gp-border-subtle bg-white hover:border-gp-gold-300 rounded-[12px] border p-3 transition-colors">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-gp-navy-900 text-sm font-semibold">
                          {formatSaudiDateDisplay(parseDateValue(visit.date))}
                          {visit.time ? ` · ${visit.time}` : ""}
                        </p>
                        <p className="text-gp-text-muted mt-1 text-xs font-medium">
                          {formatVisitType(visit.visitType)} · {formatSamples(visit.samples)}
                        </p>
                      </div>
                      <span className="border-gp-border-control bg-gp-surface-control text-gp-navy-900 inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold">
                        {visit.status}
                      </span>
                    </div>
                    {visit.notes && (
                      <p className="text-gp-text-muted mt-2 line-clamp-2 text-xs font-medium">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-gp-border-control bg-gp-surface-subtle rounded-[12px] border border-dashed p-6 text-center">
                <p className="text-gp-navy-900 text-sm font-semibold">No visits recorded</p>
                <p className="text-gp-text-muted mt-1 text-xs font-medium">Scheduled and completed visits will appear here.</p>
              </div>
            )}
          </DetailCard>
        </div>

        <aside className="grid gap-5 content-start">
          <DetailCard title="Territory" icon={MapPinned}>
            <div className="space-y-2">
              {[territory.district, territory.region, territory.territory].map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-3">
                  <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="border-gp-border-subtle bg-gp-surface-subtle flex-1 rounded-[10px] border px-3 py-2">
                    <p className="text-gp-navy-900 text-sm font-semibold">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>

          {upcomingVisit && (
            <DetailCard title="Upcoming Visit" icon={CalendarDays}>
              <div className="border-gp-gold-300 bg-gp-gold-50 rounded-[12px] border p-4">
                <p className="text-gp-navy-900 text-sm font-semibold">
                  {formatSaudiDateDisplay(parseDateValue(upcomingVisit.date))}
                  {upcomingVisit.time ? ` · ${upcomingVisit.time}` : ""}
                </p>
                <p className="text-gp-text-muted mt-1 text-xs font-medium">
                  {formatVisitType(upcomingVisit.visitType)}
                </p>
              </div>
            </DetailCard>
          )}

          <DetailCard title="Quick Actions" icon={ClipboardList}>
            <div className="grid gap-2">
              <Button type="button" onClick={openSchedule} className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 rounded-[10px] text-sm font-semibold text-white">
                <CalendarDays className="size-4 text-gp-gold-500" />
                Schedule Visit
              </Button>
              <Link href={getBackLink()} className="border-gp-border-control text-gp-navy-900 hover:bg-gp-surface-hover inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border bg-white text-sm font-semibold">
                Back to Doctors
                <ArrowRight className="size-4 text-gp-gold-600" />
              </Link>
            </div>
          </DetailCard>
        </aside>
      </section>

      <AddVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        role={role as "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"}
        doctors={doctorsList}
        initialDoctorId={doctor.id}
      />
    </PageContainer>
  );
}
