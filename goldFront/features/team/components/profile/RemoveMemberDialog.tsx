"use client";

import { useTransition } from "react";
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
} from "@/components/ui/alert-dialog";
import { TriangleAlert } from "lucide-react";
import { toast } from "@/lib/utils/toast";
import { deleteTeamMemberAction } from "@/features/team/api";

type RemoveMemberDialogProps = {
  memberId: string;
  memberName: string;
  isSupervisor?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RemoveMemberDialog({
  memberId,
  memberName,
  isSupervisor = false,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
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
          onOpenChange(false);
        }
      } catch {
        toast.error({
          title: "An unexpected error occurred",
          description: "Please try again later",
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-gp-border-default shadow-gp-dialog w-full rounded-[16px] bg-white sm:max-w-125">
        <AlertDialogHeader>
          <div className="bg-gp-danger-soft text-gp-danger mb-2 flex size-10 items-center justify-center rounded-[10px]">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-gp-navy-900 text-lg/7 font-semibold">
            Remove {isSupervisor ? "Supervisor" : "Team Member"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gp-text-muted text-sm/5">
            Are you sure you want to remove{" "}
            <span className="text-gp-text-primary font-semibold">
              {memberName}
            </span>{" "}
            from the team?
            <span className="text-gp-danger mt-1 block font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gp-border-control text-gp-navy-850 h-10 cursor-pointer rounded-[10px] px-4 font-semibold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isPending}
            className="bg-gp-danger border-gp-danger hover:text-gp-danger h-10 cursor-pointer rounded-[10px] border px-4 font-semibold text-white hover:bg-white"
          >
            {isPending ? "Removing..." : "Remove Member"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
