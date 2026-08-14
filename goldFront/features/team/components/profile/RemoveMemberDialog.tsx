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
import { UserPlus } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { deleteTeamMemberAction } from "@/features/team/api";

type RemoveMemberDialogProps = {
  memberId: string;
  memberName: string;
  isSupervisor?: boolean;
};

export default function RemoveMemberDialog({
  memberId,
  memberName,
  isSupervisor = false,
}: RemoveMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await deleteTeamMemberAction(memberId);

        if (result.success) {
          toast.success({
            title: "Team member removed successfully",
            description: `${memberName} has been removed from the team`,
          });

          // Redirect to team page
          router.push("/manager/team");
        } else {
          toast.error({
            title: "Failed to remove team member",
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
          className="border-gold-stroke bg-light-warning text-dashboard-red inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-yellow-50"
        >
          <UserPlus size={16} />
          Remove {isSupervisor ? "Supervisor" : "Member"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full sm:max-w-125">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-dashboard-red text-lg/7 font-semibold">
            Remove Team Member
          </AlertDialogTitle>
          <AlertDialogDescription className="text-secondary-dark text-sm/5">
            Are you sure you want to remove{" "}
            <span className="font-medium text-black">{memberName}</span> from
            the team?
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
            {isPending ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
