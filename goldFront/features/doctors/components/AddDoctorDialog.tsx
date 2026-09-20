"use client";

import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { FormDrawer } from "@/components/shared/FormDrawer";
import AddDoctorForm from "./AddDoctorForm";
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

  const handleSuccess = (doctorName: string) => {
    onOpenChange(false);
    toast.success({
      title: "Doctor added successfully",
      description: `${doctorName} is now available.`,
    });
    router.refresh();
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Doctor"
      eyebrow="New Doctor"
      description="Create a doctor profile and assign the doctor to the correct territory and account."
      icon={<Stethoscope className="size-5" aria-hidden="true" />}
      width="xl"
      bodyClassName="flex overflow-hidden p-0"
      closeLabel="Close Add Doctor drawer"
    >
      <AddDoctorForm
        isModal
        onSuccess={handleSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </FormDrawer>
  );
}
