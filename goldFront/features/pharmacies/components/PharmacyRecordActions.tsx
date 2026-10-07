"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RecordActions } from "@/components/shared/RecordActions";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/utils/toast";
import { updatePharmacyAction, deletePharmacyAction } from "../api";
import type { CreatePharmacyDto, PharmacyApiResponse } from "../lib/types";

export function PharmacyRecordActions({
  pharmacy,
  onDeleted,
}: {
  pharmacy: PharmacyApiResponse;
  onDeleted?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const fields = [
    ["name", "Pharmacy name"],
    ["city", "City"],
    ["country", "Country"],
    ["region", "Region"],
    ["subRegion", "Territory"],
  ] as const;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      fields.map(([key]) => [key, String(form.get(key) || "").trim()]),
    ) as unknown as CreatePharmacyDto;
    if (Object.values(values).some((value) => !value)) {
      setError("Complete all required fields.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await updatePharmacyAction(pharmacy.id, values);
      if (!result.success) {
        const message = result.error?.message || "Please try again.";
        setError(message);
        toast.error({
          title: "Could not update pharmacy",
          description: message,
        });
        return;
      }
      setEditing(false);
      toast.success({ title: "Pharmacy updated successfully" });
      router.refresh();
    });
  }
  return (
    <>
      <RecordActions
        inline
        name={pharmacy.name}
        kind="Pharmacy"
        onEdit={() => {
          setError("");
          setEditing(true);
        }}
        onDeleted={onDeleted}
        remove={() => deletePharmacyAction(pharmacy.id)}
      />
      <FormDrawer
        open={editing}
        onOpenChange={(next) => {
          if (!pending) setEditing(next);
        }}
        title="Edit pharmacy"
        description="Update the pharmacy and its assigned territory."
        width="md"
      >
        <form onSubmit={submit} className="space-y-4">
          {fields.map(([key, label]) => (
            <div key={key} className="space-y-2">
              <label
                htmlFor={`pharmacy-${pharmacy.id}-${key}`}
                className="text-sm font-medium"
              >
                {label}
              </label>
              <Input
                id={`pharmacy-${pharmacy.id}-${key}`}
                name={key}
                defaultValue={pharmacy[key]}
                required
                disabled={pending}
              />
            </div>
          ))}
          {error && (
            <p role="alert" className="text-gp-danger text-sm">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </FormDrawer>
    </>
  );
}
