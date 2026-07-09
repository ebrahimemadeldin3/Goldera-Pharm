"use client";

import Link from "next/link";
import { ArrowLeft, SquarePen, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "../../lib/types";
import RemoveMemberDialog from "./RemoveMemberDialog";
import { useRoleUI } from "@/core/ui/role-ui-context";

type ProfileHeaderProps = {
  memberDetails: User;
  backUrl: string;
  isEditMode: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function ProfileHeader({
  memberDetails,
  backUrl,
  isEditMode,
  isPending,
  onToggleEdit,
  onSave,
  onCancel,
}: ProfileHeaderProps) {
  const { role: currentUserRole } = useRoleUI();
  const isSupervisor = memberDetails.role === "SUPERVISOR";
  const isManager = currentUserRole === "MANAGER";

  return (
    <header className="flex items-center justify-start gap-6">
      <Link
        href={backUrl}
        className="border-system-primary text-system-primary hover:bg-system-primary inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white hover:border-transparent hover:text-white"
      >
        <ArrowLeft size={16} />
      </Link>

      <div>
        <h1 className="text-[34px]/10 font-normal text-black">
          {currentUserRole === "SUPERVISOR"
            ? "Medical Rep Details"
            : `${isSupervisor ? "Supervisor" : "Medical Rep"} Member Details`}
        </h1>
        <p className="text-secondary-dark text-base/6">
          View and manage team member information
        </p>
      </div>

      <div className="ml-auto flex gap-2">
        {isEditMode ? (
          <>
            <Button
              onClick={onCancel}
              disabled={isPending}
              className="border-secondary-light inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isPending}
              className="bg-system-primary hover:bg-system-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white"
            >
              <Check className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onToggleEdit}
              className="border-secondary-light inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100"
            >
              <SquarePen className="h-4 w-4" />
              Edit Profile
            </Button>

            {isManager && (
              <RemoveMemberDialog
                memberId={memberDetails.id}
                memberName={memberDetails.name}
                isSupervisor={isSupervisor}
              />
            )}
          </>
        )}
      </div>
    </header>
  );
}
