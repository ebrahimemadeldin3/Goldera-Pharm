"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckBig, CircleX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { TRequest } from "@/features/requests/lib/types";
import { approveRequestAction, rejectRequestAction } from "../../api";
import { toast } from "@/lib/utils/toast";

type RequestActionsProps = {
  request: TRequest;
};

type ActionType = "approve" | "reject" | null;

export function RequestActions({ request }: RequestActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [notes, setNotes] = useState("");

  function openDialog(type: Exclude<ActionType, null>) {
    setActionType(type);
    setNotes("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setActionType(null);
    setNotes("");
  }

  function handleAction() {
    if (!actionType) return;

    startTransition(async () => {
      const result =
        actionType === "approve"
          ? await approveRequestAction(request.id, notes || undefined)
          : await rejectRequestAction(request.id, notes || undefined);

      if (result.success) {
        if (actionType === "approve") {
          toast.success({
            title: "Request approved successfully",
            description: request.title,
          });
        } else {
          toast.error({
            title: "Request rejected successfully",
            description: request.title,
          });
        }
        closeDialog();
        router.refresh();
      } else {
        toast.error({
          title: `Failed to ${actionType === "approve" ? "approve" : "reject"} request`,
          description: result.error?.message || "An error occurred",
        });
      }
    });
  }

  return (
    <>
      <div className="requests-decision-footer border-gp-border-control bg-gp-surface-subtle flex flex-col gap-3 rounded-[12px] border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <p className="text-gp-navy-900 text-sm font-semibold">
            Ready for decision
          </p>
          <p className="text-gp-text-muted mt-0.5 text-xs font-medium">
            Review the details above before approving or rejecting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          <button
            type="button"
            onClick={() => openDialog("reject")}
            disabled={isPending}
            className="requests-reject requests-btn border-gp-danger text-gp-danger focus-visible:ring-gp-danger/25 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border bg-white px-4 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CircleX className="size-4" aria-hidden="true" />
            Reject
          </button>
          <button
            type="button"
            onClick={() => openDialog("approve")}
            disabled={isPending}
            className="requests-approve requests-btn bg-gp-navy-900 focus-visible:ring-gp-navy-900/25 inline-flex h-10 cursor-pointer items-center gap-2 rounded-[10px] px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(16,29,54,0.18)] transition-[background-color,color,box-shadow,transform,opacity] duration-[170ms] focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CircleCheckBig
              className="text-gp-gold-500 size-4"
              aria-hidden="true"
            />
            Approve
          </button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this request: &quot;
              {request.title}&quot;?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="request-notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <Textarea
              id="request-notes"
              placeholder="Add any comments or notes..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={isPending}
              className={
                actionType === "approve"
                  ? "border-gp-navy-900 bg-gp-navy-900 hover:bg-gp-navy-900/90 text-white"
                  : "border-gp-danger bg-gp-danger hover:bg-gp-danger/90 text-white"
              }
            >
              {isPending
                ? "Processing..."
                : actionType === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
