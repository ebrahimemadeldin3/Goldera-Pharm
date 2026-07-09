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
import { deleteDoctorAction } from "../../api";

type RemoveDoctorDialogProps = {
  doctorId: string;
  doctorName: string;
};

export default function RemoveDoctorDialog({
  doctorId,
  doctorName,
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
            description: `${doctorName} has been removed from the system`,
          });

          // Redirect to doctors page
          router.push("/manager/doctors");
        } else {
          toast.error({
            title: "Failed to remove doctor",
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
          className="border-dashboard-red text-dashboard-red inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-red-50"
        >
          <UserX size={16} />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-125">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dashboard-red text-lg/7 font-semibold">
            Remove Doctor
          </AlertDialogTitle>
          <AlertDialogDescription className="text-secondary-dark text-sm/5">
            Are you sure you want to remove{" "}
            <span className="font-medium text-black">{doctorName}</span> from
            the system?
            <span className="mt-1 block font-medium text-red-800">
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
            className="bg-dashboard-red hover:text-dashboard-red border-dashboard-red cursor-pointer border text-white hover:bg-white"
          >
            {isPending ? "Removing..." : "Remove Doctor"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
