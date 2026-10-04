"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";

type Props = {
  name: string;
  kind: string;
  onEdit: () => void;
  onDeleted?: () => void;
  remove: () => Promise<{ success: boolean; error?: { message?: string } }>;
};

export function RecordActions({
  name,
  kind,
  onEdit,
  onDeleted,
  remove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function deleteRecord() {
    startTransition(async () => {
      try {
        const result = await remove();
        if (!result.success) {
          toast.error({
            title: `Could not delete ${kind}`,
            description: result.error?.message || "Please try again.",
          });
          return;
        }
        setOpen(false);
        onDeleted?.();
        toast.success({ title: `${kind} deleted successfully` });
        router.refresh();
      } catch {
        toast.error({
          title: `Could not delete ${kind}`,
          description: "Please try again.",
        });
      }
    });
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Actions for ${name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" /> Edit {kind.toLowerCase()}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setOpen(true)}
            className="text-gp-danger"
          >
            <Trash2 className="size-4" /> Delete {kind.toLowerCase()}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {kind.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete “{name}”? This action cannot be undone. Records used by
              other operations must be retained.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              disabled={pending}
              onClick={deleteRecord}
              className="bg-gp-danger hover:bg-gp-danger/90 text-white"
            >
              {pending ? "Deleting…" : `Delete ${kind.toLowerCase()}`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
