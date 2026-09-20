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
import { deleteDoctorAction } from "../../api";

type RemoveDoctorDialogProps = {
  doctorId: string;
  doctorName: string;
  trigger?: ReactNode;
};

export default function RemoveDoctorDialog({
  doctorId,
  doctorName,
  trigger,
}: RemoveDoctorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await deleteDoctorAction(doctorId);

        if (result.success) {
          toast.success({
            title: "Doctor removed successfully",
            description: "The doctor was removed successfully.",
          });

          // Redirect to doctors page
          router.push("/manager/doctors");
        } else {
          toast.error({
            title: "Couldn't remove doctor",
            description: result.error?.message || "Please try again",
          });
          setOpen(false);
        }
      } catch {
        toast.error({
          title: "Couldn't remove doctor",
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
            className="border-dashboard-red text-dashboard-red inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-red-50"
          >
            <UserX size={16} />
            Remove
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="border-gp-border-default bg-white w-125 rounded-[16px] shadow-gp-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gp-danger text-lg/7 font-semibold">
            Remove doctor?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gp-text-muted text-sm/5">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-gp-navy-900">{doctorName}</span> from
            the system?
            <span className="text-gp-danger mt-1 block font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending}
            className="bg-gp-danger hover:bg-[#971F16] cursor-pointer rounded-[10px] border border-gp-danger text-white"
          >
            {isPending ? "Removing..." : "Remove Doctor"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
