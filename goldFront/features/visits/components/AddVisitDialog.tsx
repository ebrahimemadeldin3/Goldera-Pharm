"use client";

import { FormDrawer } from "@/components/shared/FormDrawer";
import AddVisitForm from "./AddVisitForm";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { User } from "@/features/team/lib/types";
import { Building2, CalendarPlus, MapPinned, Stethoscope } from "lucide-react";
import { getTerritoryLookup } from "@/features/plan/lib/territory";

type AddVisitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "MANAGER" | "SUPERVISOR" | "MEDICAL_REP";
  doctors: DoctorApiResponse[];
  supervisors?: User[];
  medicalReps?: User[];
  initialDoctorId?: string;
  initialDate?: Date;
};

export default function AddVisitDialog({
  open,
  onOpenChange,
  role,
  doctors = [],
  supervisors = [],
  medicalReps = [],
  initialDoctorId,
  initialDate,
}: AddVisitDialogProps) {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    toast.success({ title: "Visit scheduled successfully" });
    router.refresh();
  };

  const formProps =
    role === "MANAGER"
      ? {
          role: "MANAGER" as const,
          doctors,
          supervisors,
          medicalReps,
        }
      : role === "SUPERVISOR"
        ? {
            role: "SUPERVISOR" as const,
            doctors,
            medicalReps,
          }
        : {
            role: "MEDICAL_REP" as const,
            doctors,
          };
  const selectedDoctor = initialDoctorId
    ? doctors.find((doctor) => doctor.id === initialDoctorId)
    : undefined;
  const selectedTerritory = selectedDoctor
    ? getTerritoryLookup(selectedDoctor.subRegion || selectedDoctor.area)
    : null;
  const doctorName =
    selectedDoctor?.nameAR ||
    selectedDoctor?.nameEN ||
    selectedDoctor?.name ||
    "selected doctor";
  const headerBadges = selectedDoctor ? (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {selectedDoctor.specialty && (
        <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
          <Stethoscope className="size-3" aria-hidden="true" />
          {selectedDoctor.specialty}
        </span>
      )}
      {selectedTerritory && (
        <span className="border-gp-border-subtle bg-gp-surface-subtle text-gp-navy-900 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
          <MapPinned className="text-gp-gold-600 size-3" aria-hidden="true" />
          {selectedTerritory.territory}
        </span>
      )}
      {selectedDoctor.accountName && (
        <span className="border-gp-border-subtle text-gp-text-muted inline-flex max-w-[260px] items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold">
          <Building2 className="text-gp-gold-600 size-3" aria-hidden="true" />
          <span className="truncate" dir="auto">
            {selectedDoctor.accountName}
          </span>
        </span>
      )}
    </div>
  ) : null;

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Medical Visit"
      eyebrow="New Visit"
      description={
        selectedDoctor
          ? `Plan a visit with Dr. ${doctorName}.`
          : "Schedule a new visit appointment with a doctor."
      }
      icon={<CalendarPlus className="size-5" aria-hidden="true" />}
      headerExtra={headerBadges}
      width="md"
      bodyClassName="flex overflow-hidden p-0"
      closeLabel="Close Add Visit drawer"
    >
      <AddVisitForm
        {...formProps}
        isModal
        initialDoctorId={initialDoctorId}
        initialDate={initialDate}
        onSuccess={handleSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </FormDrawer>
  );
}
