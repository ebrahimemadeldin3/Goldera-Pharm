"use client";

import {
  Sheet,
  SheetClose,
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
import { CalendarPlus, X } from "lucide-react";

import { cn } from "@/lib/utils";

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
      <SheetContent
        side="right"
        hideCloseButton
        overlayClassName="visits-add-drawer-overlay bg-[rgba(15,23,42,0.24)] backdrop-blur-[1px]"
        className="visits-add-drawer !w-full gap-0 overflow-hidden border-l border-[#E5E8EF] bg-white p-0 shadow-[0_18px_55px_rgba(15,23,42,0.16)] sm:!w-[min(480px,calc(100vw-24px))] sm:!max-w-[480px] lg:!max-w-[500px]"
      >
        <SheetHeader className="visits-add-drawer-header sticky top-0 z-10 border-b border-[#EEF1F6] bg-white px-5 py-5 text-left sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-[12px] border",
                  role === "MEDICAL_REP"
                    ? "border-[#CBEFDD] bg-[#E9F8F1] text-[#168557]"
                    : "border-[#E9DDB8] bg-[#FFF8E5] text-[#B18732]"
                )}
              >
                <CalendarPlus className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="text-[21px] leading-tight font-semibold text-[#182033]">
                  Schedule Medical Visit
                </SheetTitle>
                <SheetDescription className="mt-2 max-w-[340px] text-sm leading-5 font-medium text-[#667085]">
                  Schedule a new visit appointment with a doctor.
                </SheetDescription>
              </div>
            </div>

            <SheetClose asChild>
              <button
                type="button"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[#667085] transition-[background-color,color,transform] duration-[160ms] hover:-translate-y-px hover:bg-[#F4F6FA] hover:text-[#182033] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/25 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                aria-label="Close Add Visit drawer"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <AddVisitForm
          {...formProps}
          isModal
          initialDoctorId={initialDoctorId}
          initialDate={initialDate}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
