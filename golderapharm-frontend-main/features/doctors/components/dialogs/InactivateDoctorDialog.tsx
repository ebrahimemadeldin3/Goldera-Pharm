"use client";

import { useState, useTransition } from "react";
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
};

export default function InactivateDoctorDialog({
  doctorId,
  doctorName,
  isActive,
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
            title: `Doctor ${isActive ? "deactivated" : "activated"} successfully`,
            description: `${doctorName} is now ${isActive ? "inactive" : "active"}`,
          });

          router.refresh();
          setOpen(false);
        } else {
          toast.error({
            title: `Failed to ${isActive ? "deactivate" : "activate"} doctor`,
            description: result.error?.message || "Please try again",
          });
          setOpen(false);
        }
      } catch {
        toast.error({
          title: "An unexpected error occurred",
          description: "Please try again later",
        });
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="border-dashboard-orange text-dashboard-orange inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-orange-50"
        >
          <UserX size={16} />
          {isActive ? "Inactive" : "Activate"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-125">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dashboard-orange text-lg/7 font-semibold">
            {isActive ? "Deactivate" : "Activate"} Doctor
          </AlertDialogTitle>
          <AlertDialogDescription className="text-secondary-dark text-sm/5">
            Are you sure you want to {isActive ? "deactivate" : "activate"}{" "}
            <span className="font-medium text-black">{doctorName}</span>?
            {isActive && (
              <span className="mt-1 block font-medium text-orange-600">
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
            className="bg-dashboard-orange hover:text-dashboard-orange border-dashboard-orange cursor-pointer rounded-md border text-white hover:bg-white"
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
