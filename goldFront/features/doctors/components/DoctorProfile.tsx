"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  SquarePen,
  Stethoscope,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  Check,
  X,
} from "lucide-react";
import { DoctorProfileData } from "../lib/types";
import { useRoleUI } from "@/core/ui/role-ui-context";
import RemoveDoctorDialog from "./dialogs/RemoveDoctorDialog";
import InactivateDoctorDialog from "./dialogs/InactivateDoctorDialog";
import { useEditDoctor } from "../hooks/useEditDoctor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddVisitDialog from "@/features/visits/components/AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { VisitApiResponse } from "@/features/visits/lib/types/api";
import { formatSaudiDateDisplay, parseDateValue, cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/page-container";

type DoctorProfileProps = {
  doctor: DoctorProfileData;
};

export default function DoctorProfile({ doctor }: DoctorProfileProps) {
  const { features, role } = useRoleUI();
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

  // Determine back link based on role
  const getBackLink = () => {
    if (role === "MANAGER") return "/manager/doctors";
    if (role === "SUPERVISOR") return "/supervisor/doctors";
    return "/rep/doctors";
  };

  const displayName = doctor.nameEN || doctor.nameAR;

  const handleOpenSchedule = async () => {
    if (doctorsList.length === 0) {
      const doctorsRes = await getDoctorsAction(undefined, undefined, undefined, false);
      if (doctorsRes.success && doctorsRes.data) {
        setDoctorsList(doctorsRes.data);
      }
    }
    setScheduleDialogOpen(true);
  };

  if (role === "MEDICAL_REP") {
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
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-start gap-2">
        <Link
          href={getBackLink()}
          className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="ml-3 min-w-0 flex-1">
          <h1 className="font-nomral text-2xl text-black md:text-[34px]">Doctor Profile</h1>
          <p className="text-secondary-dark text-[16px]">
            View and manage doctor information
          </p>
        </div>

        {/* Supervisor: Create Visit button */}
        {features.visits.addToDoctorProfile && !features.doctors.canEdit && (
          <Link
            href={`${getBackLink().replace("/doctors", "/visits")}/add?doctorId=${doctor.id}`}
            className="bg-system-primary hover:text-system-primary border-system-primary ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-white hover:bg-white"
          >
            <Calendar className="h-4 w-4" />
            Add New Visit
          </Link>
        )}

        {features.doctors.canEdit && (
          <>
            <button
              onClick={isEditMode ? saveChanges : toggleEditMode}
              disabled={isPending}
              className="border-secondary-dark text-secondary-dark hover:bg-secondary-light ml-auto inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isEditMode ? (
                <>
                  <Check className="h-4 w-4" />
                  {isPending ? "Saving..." : "Save Changes"}
                </>
              ) : (
                <>
                  <SquarePen className="h-4 w-4" />
                  Edit Profile
                </>
              )}
            </button>

            {isEditMode && (
              <button
                onClick={cancelEdit}
                disabled={isPending}
                className="border-secondary-light inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}

            {!isEditMode && features.doctors.canInactive && (
              <InactivateDoctorDialog
                doctorId={doctor.id}
                doctorName={displayName}
                isActive={doctor.isActive}
              />
            )}

            {!isEditMode && features.doctors.canRemove && (
              <RemoveDoctorDialog
                doctorId={doctor.id}
                doctorName={displayName}
              />
            )}
          </>
        )}

        {!features.doctors.canEdit && features.doctors.canInactive && (
          <InactivateDoctorDialog
            doctorId={doctor.id}
            doctorName={displayName}
            isActive={doctor.isActive}
          />
        )}
      </header>

      {/* profile summary card */}
      <section className="border-secondary-light rounded-lg border-[0.8px] bg-white p-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#1E3A8A] text-xl font-semibold text-white">
            <Stethoscope size={48} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base/6 font-normal text-black">
                {displayName}
              </h2>
              <span className="border-dashboard-blue text-dashboard-blue rounded-xl border px-2 py-0.5 text-xs/4 font-medium">
                {doctor.specialty}
              </span>
              <span className="bg-dashboard-blue rounded-xl px-2 py-0.5 text-xs/4 font-medium text-white">
                {doctor.subRegion}
              </span>
              <span
                className={`rounded-xl border px-2 py-0.5 text-xs/4 font-medium ${
                  doctor.isActive
                    ? "border-dashboard-green text-dashboard-green"
                    : "border-gold-stroke text-dashboard-red"
                }`}
              >
                {doctor.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="text-secondary-dark mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Name (EN):</span>
                {isEditMode ? (
                  <Input
                    value={editedData.nameEN}
                    onChange={(e) => updateField("nameEN", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="English name"
                  />
                ) : (
                  <span>{doctor.nameEN}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Name (AR):</span>
                {isEditMode ? (
                  <Input
                    value={editedData.nameAR}
                    onChange={(e) => updateField("nameAR", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Arabic name"
                  />
                ) : (
                  <span>{doctor.nameAR}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                {isEditMode ? (
                  <Input
                    type="email"
                    value={editedData.email || ""}
                    onChange={(e) =>
                      updateField("email", e.target.value || null)
                    }
                    className="h-8 flex-1 text-sm"
                    placeholder="Email"
                  />
                ) : (
                  <span>{doctor.email || "N/A"}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                {isEditMode ? (
                  <Input
                    value={editedData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Phone"
                  />
                ) : (
                  <span>{doctor.phone}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Specialty:</span>
                {isEditMode ? (
                  <Input
                    value={editedData.specialty}
                    onChange={(e) => updateField("specialty", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Specialty"
                  />
                ) : (
                  <span>{doctor.specialty}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Grade:</span>
                {isEditMode ? (
                  <Input
                    value={editedData.grade}
                    onChange={(e) => updateField("grade", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Grade (A/B/C/D)"
                    maxLength={1}
                  />
                ) : (
                  <span>{doctor.grade}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4" />
                <span>
                  License:{" "}
                  {isEditMode ? (
                    <Input
                      value={editedData.LicenseNumber || ""}
                      onChange={(e) =>
                        updateField("LicenseNumber", e.target.value || null)
                      }
                      className="h-8 flex-1 text-sm"
                      placeholder="License number"
                    />
                  ) : (
                    doctor.LicenseNumber || "N/A"
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">
                  Avg Patients/Day:
                </span>
                {isEditMode ? (
                  <Input
                    type="number"
                    value={editedData.avgPatientsPerDay?.toString() || ""}
                    onChange={(e) =>
                      updateField(
                        "avgPatientsPerDay",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="h-8 flex-1 text-sm"
                    placeholder="Average patients"
                  />
                ) : (
                  <span>{doctor.avgPatientsPerDay || "N/A"}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Account Name:</span>
                {isEditMode ? (
                  <Input
                    value={editedData.accountName}
                    onChange={(e) => updateField("accountName", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Account name"
                  />
                ) : (
                  <span>{doctor.accountName}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Sub Region:</span>
                {isEditMode ? (
                  <Input
                    value={editedData.subRegion}
                    onChange={(e) => updateField("subRegion", e.target.value)}
                    className="h-8 flex-1 text-sm"
                    placeholder="Sub region"
                  />
                ) : (
                  <span>{doctor.subRegion}</span>
                )}
              </div>

              {(doctor.area || isEditMode) && (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-black">Area:</span>
                  {isEditMode ? (
                    <Input
                      value={editedData.area || ""}
                      onChange={(e) =>
                        updateField("area", e.target.value || null)
                      }
                      className="h-8 flex-1 text-sm"
                      placeholder="Area"
                    />
                  ) : (
                    <span>{doctor.area}</span>
                  )}
                </div>
              )}

              {isEditMode && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-black">Latitude:</span>
                    <Input
                      type="number"
                      step="any"
                      value={editedData.latitude?.toString() || ""}
                      onChange={(e) =>
                        updateField(
                          "latitude",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="h-8 flex-1 text-sm"
                      placeholder="Latitude"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-black">Longitude:</span>
                    <Input
                      type="number"
                      step="any"
                      value={editedData.longitude?.toString() || ""}
                      onChange={(e) =>
                        updateField(
                          "longitude",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="h-8 flex-1 text-sm"
                      placeholder="Longitude"
                    />
                  </div>
                </>
              )}

              {!isEditMode && doctor.latitude && doctor.longitude && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Coordinates: {doctor.latitude}, {doctor.longitude}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Created At:</span>
                <span>
                  {formatSaudiDateDisplay(new Date(doctor.createdAt))}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-black">Updated At:</span>
                <span>
                  {formatSaudiDateDisplay(new Date(doctor.updatedAt))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-secondary-light flex flex-col gap-1 rounded-lg border-[0.8px] bg-white p-6 text-center">
          <div className="text-secondary-dark text-base/6">
            Avg. Patients/Day
          </div>
          <div className="text-lg/6 font-medium text-black">
            {doctor.avgPatientsPerDay || "N/A"}
          </div>
          <div className="text-secondary-dark text-md/5">Daily average</div>
        </div>
        <div className="border-secondary-light flex flex-col gap-1 rounded-lg border-[0.8px] bg-white p-6 text-center">
          <div className="text-secondary-dark text-base/6">Status</div>
          <div className="text-lg/6 font-medium text-black">
            {doctor.isActive ? "Active" : "Inactive"}
          </div>
          <div className="text-secondary-dark text-md/5">Current status</div>
        </div>
        <div className="border-secondary-light flex flex-col gap-1 rounded-lg border-[0.8px] bg-white p-6 text-center">
          <div className="text-secondary-dark text-base/6">Grade</div>
          <div className="text-lg/6 font-medium text-black">{doctor.grade}</div>
          <div className="text-secondary-dark text-md/5">Doctor grade</div>
        </div>
      </section>

      {/* two-column area */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Account Information */}
        <div className="border-secondary-light rounded-lg border-[0.8px] bg-white p-6">
          <h3 className="mb-4 text-[20px]/6 font-semibold text-black">
            Account Information
          </h3>

          <div className="flex flex-col gap-4">
            {doctor.accountName ? (
              <div className="flex w-full items-start gap-3 rounded-lg border border-blue-stroke bg-light-blue-gradiant px-4 py-3">
                <Building2 size={18} className="text-dashboard-blue mt-1" />
                <div className="flex-1">
                  <div className="flex items-center text-sm font-normal text-black">
                    {doctor.accountName}
                  </div>
                  <div className="text-secondary-dark mt-1 text-xs font-normal">
                    <MapPin className="mr-1 inline size-3" />
                    {doctor.subRegion}
                    {doctor.area ? `, ${doctor.area}` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-secondary-dark text-sm">
                No account information assigned
              </p>
            )}
          </div>
        </div>

        {/* Recent Visit History */}
        <div className="border-secondary-light rounded-lg border-[0.8px] bg-white p-6">
          <h3 className="mb-4 text-[20px]/6 font-semibold text-black">
            Recent Visit History
          </h3>

          <div className="flex flex-col gap-3">
            {doctor.visits && doctor.visits.length > 0 ? (
              doctor.visits.map((visit: VisitApiResponse, index: number) => (
                <div
                  key={visit.id || index}
                  className="border-secondary-light flex items-center justify-between rounded-lg border px-3 py-3"
                >
                  <div>
                    <div className="text-base/6 font-normal text-black">
                      {formatSaudiDateDisplay(parseDateValue(visit.date))}
                    </div>
                    <div className="text-secondary-dark mt-1 text-xs/5">
                      {visit.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary-dark text-sm">No visits recorded</p>
            )}
          </div>
        </div>
      </section>

      {/* Plan & Coaching Info */}
      {/* {hasPlanOrCoachings && (
        <section className="grid grid-cols-2 gap-6">
          {!!doctor.plan && (
            <div className="border-secondary-light rounded-lg border-[0.8px] bg-white p-6">
              <h3 className="mb-4 text-[20px]/6 font-semibold text-black">
                Plan Information
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black">Plan ID:</span>
                  <span className="text-secondary-dark">
                    {doctor.planId || "N/A"}
                  </span>
                </div>
                <pre className="text-secondary-dark max-h-96 overflow-auto rounded bg-gray-50 p-2 text-xs">
                  {JSON.stringify(doctor.plan, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {doctor.coachings && doctor.coachings.length > 0 && (
            <div className="border-secondary-light rounded-lg border-[0.8px] bg-white p-6">
              <h3 className="mb-4 text-[20px]/6 font-semibold text-black">
                Coaching Sessions ({doctor.coachings.length})
              </h3>
              <div className="flex max-h-96 flex-col gap-3 overflow-auto">
                {doctor.coachings.map(
                  (coaching: CoachingReportApiResponse, index: number) => (
                    <div
                      key={coaching.id || index}
                      className="border-secondary-light rounded-lg border px-3 py-2"
                    >
                      <pre className="text-secondary-dark overflow-auto text-xs">
                        {JSON.stringify(coaching, null, 2)}
                      </pre>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </section>
      )} */}
    </PageContainer>
  );
}
