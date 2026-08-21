"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddDoctorForm from "./AddDoctorForm";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/utils/toast";

type AddDoctorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddDoctorDialog({
  open,
  onOpenChange,
}: AddDoctorDialogProps) {
  const router = useRouter();

  const handleSuccess = () => {
    onOpenChange(false);
    toast.success({ title: "Doctor added successfully" });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Add New Doctor
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Add a new doctor contact to your CRM database. Fill in required details below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <AddDoctorForm
            isModal
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
