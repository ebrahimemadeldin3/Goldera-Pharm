"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AddVisitForm from "./AddVisitForm";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { User } from "@/features/team/lib/types";

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="p-0 mb-4">
          <SheetTitle className="text-lg font-semibold text-slate-900">
            Schedule Medical Visit
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500">
            Schedule a new visit appointment with a doctor. Fill in the visit target, date, time, and products.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2">
          <AddVisitForm
            {...formProps}
            isModal
            initialDoctorId={initialDoctorId}
            initialDate={initialDate}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
