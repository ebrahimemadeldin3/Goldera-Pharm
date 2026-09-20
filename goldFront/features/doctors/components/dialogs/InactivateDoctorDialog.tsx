"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { toggleDoctorActiveAction } from "../../api";

type InactivateDoctorDialogProps = {
  doctorId: string;
  doctorName: string;
  isActive: boolean;
  trigger?: ReactNode;
};

export default function InactivateDoctorDialog({
  doctorId,
  doctorName,
  isActive,
  trigger,
}: InactivateDoctorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleDoctorActiveAction(doctorId, !isActive);

        if (result.success) {
          toast.success({
            title: "Doctor updated successfully",
            description: `${doctorName} is now ${isActive ? "inactive" : "active"}`,
          });

          router.refresh();
          setOpen(false);
        } else {
          toast.error({
            title: "Couldn't update doctor",
            description: result.error?.message || "Please try again",
          });
          setOpen(false);
        }
      } catch {
        toast.error({
          title: "Couldn't update doctor",
          description: "Please try again later",
        });
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            className="border-dashboard-orange text-dashboard-orange inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-orange-50"
          >
            <UserX size={16} />
            {isActive ? "Inactive" : "Activate"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="border-gp-border-default bg-white w-125 rounded-[16px] shadow-gp-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gp-navy-900 text-lg/7 font-semibold">
            {isActive ? "Set doctor as inactive?" : "Reactivate doctor?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gp-text-muted text-sm/5">
            Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
            <span className="font-semibold text-gp-navy-900">{doctorName}</span>?
            {isActive && (
              <span className="text-gp-gold-700 mt-1 block font-medium">
                The doctor will not be available for scheduling visits when
                inactive.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggle}
            disabled={isPending}
            className="bg-gp-navy-900 hover:bg-gp-navy-900/95 cursor-pointer rounded-[10px] border border-gp-navy-900 text-white"
          >
            {isPending
              ? `${isActive ? "Deactivating" : "Activating"}...`
              : `${isActive ? "Deactivate" : "Activate"} Doctor`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
