"use client";

import { AlertCircle, LogOut } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-secondary-light max-w-md rounded-[10px] border-[0.8px] bg-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-system-primary flex h-12 w-12 items-center justify-center rounded-full">
              <LogOut className="text-white" size={24} />
            </div>
            <div>
              <DialogTitle className="text-2xl/6 font-semibold text-black">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-sm/5 text-gray-600">
                Are you sure you want to log out?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-gold-stroke bg-light-warning my-4 rounded-[10px] border p-4">
          <div className="flex gap-3">
            <AlertCircle size={13} className="text-dashboard-red shrink-0" />
            <div>
              <h4 className="text-dashboard-red mb-1 text-sm/[21px] font-medium">
                Active Session Warning
              </h4>
              <p className="text-secondary-dark text-sm/[21px] font-normal">
                You have unsaved changes and pending requests. Make sure all
                important data is saved before logging out.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 *:flex-1">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isPending}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-system-primary hover:text-system-primary hover:outline-system-primary cursor-pointer text-white outline outline-transparent transition-colors duration-200 outline-solid hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isPending ? "Signing out..." : "Sign out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
