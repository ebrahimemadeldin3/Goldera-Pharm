"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Store } from "lucide-react";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { PharmacyForm } from "./PharmacyForm";

type AddPharmacyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddPharmacyDialog({
  open,
  onOpenChange,
}: AddPharmacyDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSuccess() {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", "1");
    onOpenChange(false);
    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Pharmacy"
      eyebrow="New Pharmacy"
      description="Create a pharmacy account and assign it to the correct field territory."
      icon={<Store className="size-5" aria-hidden="true" />}
      width="xl"
      bodyClassName="flex overflow-hidden p-0"
      closeLabel="Close Add Pharmacy drawer"
    >
      <PharmacyForm
        onSuccess={handleSuccess}
        onCancel={() => onOpenChange(false)}
      />
    </FormDrawer>
  );
}
