"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  GalleryVerticalEnd,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "../../lib/types";
import RemoveMemberDialog from "./RemoveMemberDialog";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const profileTitle = isSupervisor
    ? "Supervisor Profile"
    : "Medical Representative Profile";
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  return (
    <header className="member-profile-header flex w-full flex-col gap-4 rounded-[16px] border border-gp-border-default bg-white px-4 py-4 shadow-gp-card sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <Link
          href={backUrl}
          aria-label="Back to team"
          className="member-profile-back-button group/back border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/25 inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white shadow-none transition-[background-color,border-color,color,box-shadow,transform] duration-[170ms] focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft
            className="member-profile-back-icon size-4"
            aria-hidden="true"
          />
        </Link>

        <div className="min-w-0">
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="bg-gp-gold-500 h-px w-8 rounded-full" />
            <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-7 items-center justify-center rounded-[8px] border">
              <GalleryVerticalEnd className="size-3.5" aria-hidden="true" />
            </span>
            <p className="text-gp-gold-700 text-[11px] font-bold tracking-[0.12em] uppercase">
              Management / Team
            </p>
          </div>
          <h1 className="text-gp-navy-900 text-[26px] leading-tight font-semibold sm:text-[30px]">
            {profileTitle}
          </h1>
          <p className="text-gp-text-muted mt-1 text-sm leading-6 font-medium">
            Review performance, territory, activity and account information.
          </p>
        </div>
      </div>

      {isManager && (
        <div className="member-profile-header-actions flex w-full gap-2 sm:w-auto sm:justify-end">
          {isEditMode ? (
            <>
              <Button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="member-profile-secondary-action border-gp-border-control text-gp-navy-850 hover:border-gp-gold-300 hover:bg-gp-gold-50 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/20 h-10 flex-1 cursor-pointer rounded-[10px] border bg-white px-4 text-sm font-semibold shadow-none active:scale-[0.98] sm:flex-none"
              >
                <X className="size-4" aria-hidden="true" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={isPending}
                className="member-profile-primary-action bg-gp-navy-900 hover:bg-gp-navy-850 hover:text-white focus-visible:ring-gp-gold-500/25 h-10 flex-1 cursor-pointer rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[background-color,box-shadow,transform,color] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.24)] active:scale-[0.98] sm:flex-none"
              >
                <Check className="text-gp-gold-500 size-4" aria-hidden="true" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={onToggleEdit}
                className="member-profile-edit-action bg-gp-navy-900 hover:bg-gp-navy-850 hover:text-white focus-visible:ring-gp-gold-500/25 h-10 flex-1 cursor-pointer rounded-[10px] border border-transparent px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.18)] transition-[background-color,box-shadow,transform,color] duration-[170ms] hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(16,29,54,0.24)] active:scale-[0.98] sm:flex-none"
              >
                <Pencil
                  className="member-profile-edit-icon text-gp-gold-500 size-4"
                  aria-hidden="true"
                />
                Edit Profile
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    aria-label="More member actions"
                    className="member-profile-more-action border-gp-border-control text-gp-navy-850 hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/20 size-10 shrink-0 cursor-pointer rounded-[10px] border bg-white p-0 shadow-none"
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="border-gp-border-default shadow-gp-popover min-w-48 rounded-[10px] bg-white p-1.5"
                >
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setRemoveDialogOpen(true)}
                    className="text-gp-danger focus:bg-gp-danger-soft focus:text-gp-danger h-9 cursor-pointer rounded-[8px] px-2.5 font-semibold"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Remove {isSupervisor ? "Supervisor" : "Member"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      )}

      {isManager && (
        <RemoveMemberDialog
          memberId={memberDetails.id}
          memberName={memberDetails.name}
          isSupervisor={isSupervisor}
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
        />
      )}
    </header>
  );
}
