"use client";
import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { RecordActions } from "@/components/shared/RecordActions";
import { FormDrawer } from "@/components/shared/FormDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/utils/toast";
import {
  saveReferenceAction,
  deleteReferenceAction,
  type ReferenceRecord,
  type ReferenceKind,
} from "../api/reference-data";

const kinds = ["regions", "sub-regions", "accounts"] as const;
const labels = {
  regions: "Region",
  "sub-regions": "Territory",
  accounts: "Facility",
};
const pluralLabels = {
  regions: "Regions",
  "sub-regions": "Territories",
  accounts: "Facilities",
};
export function ReferenceData({
  data,
}: {
  data: Record<ReferenceKind, ReferenceRecord[]>;
}) {
  const [kind, setKind] = useState<ReferenceKind>("regions");
  const [edit, setEdit] = useState<{
    kind: ReferenceKind;
    record: ReferenceRecord | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit) return;
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, String(value).trim()]),
    );
    if (!values.name) {
      setError("Name is required.");
      return;
    }
    const current = edit;
    startTransition(async () => {
      const result = await saveReferenceAction(
        current.kind,
        current.record?.id || null,
        values,
      );
      if (!result.success) {
        setError(result.error?.message || "Please try again.");
        return;
      }
      toast.success({
        title: `${labels[current.kind]} ${current.record ? "updated" : "created"} successfully`,
      });
      setEdit(null);
      router.refresh();
    });
  }
  return (
    <section className="border-gp-border-default rounded-[14px] border bg-white p-5">
      <h2 className="text-gp-navy-900 text-lg font-semibold">
        Territories and facilities
      </h2>
      <p className="text-gp-text-muted mt-1 text-sm">
        Maintain the regions, territories and facilities used by your team.
        Assigned records must be reassigned before deletion.
      </p>
      <div className="my-4 flex flex-wrap items-center gap-2">
        {kinds.map((value) => (
          <Button
            key={value}
            variant={value === kind ? "default" : "outline"}
            aria-pressed={value === kind}
            onClick={() => setKind(value)}
          >
            {pluralLabels[value]}
          </Button>
        ))}
        <Button
          className="sm:ml-auto"
          onClick={() => {
            setError("");
            setEdit({ kind, record: null });
          }}
        >
          Add {labels[kind].toLowerCase()}
        </Button>
      </div>
      <ul className="divide-gp-border-subtle divide-y">
        {data[kind].map((record) => (
          <li
            key={record.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium break-words">{record.name}</p>
              <p className="text-gp-text-muted text-xs">
                {record.country ||
                  record.region?.name ||
                  record.subRegion?.name ||
                  "No territory assigned"}
              </p>
            </div>
            <RecordActions
              name={record.name}
              kind={labels[kind]}
              onEdit={() => {
                setError("");
                setEdit({ kind, record });
              }}
              remove={() => deleteReferenceAction(kind, record.id)}
            />
          </li>
        ))}
        {!data[kind].length && (
          <li className="text-gp-text-muted py-5 text-sm">
            No {labels[kind].toLowerCase()} records yet. Add the first one to
            get started.
          </li>
        )}
      </ul>
      <FormDrawer
        open={Boolean(edit)}
        onOpenChange={(next) => {
          if (!next && !pending) setEdit(null);
        }}
        title={`${edit?.record ? "Edit" : "Add"} ${edit ? labels[edit.kind].toLowerCase() : "record"}`}
        description="Complete the required details and save your changes."
        width="md"
      >
        {edit && (
          <form
            key={`${edit.kind}:${edit.record?.id || "new"}`}
            onSubmit={submit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="reference-name">Name</label>
              <Input
                id="reference-name"
                name="name"
                defaultValue={edit.record?.name}
                required
                disabled={pending}
              />
            </div>
            {edit.kind === "regions" ? (
              <div className="space-y-2">
                <label htmlFor="reference-country">Country</label>
                <Input
                  id="reference-country"
                  name="country"
                  defaultValue={edit.record?.country}
                  required
                  disabled={pending}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="reference-parent">
                  {edit.kind === "sub-regions" ? "Region" : "Territory"}
                </label>
                <select
                  id="reference-parent"
                  name={
                    edit.kind === "sub-regions" ? "regionId" : "subRegionId"
                  }
                  required={edit.kind === "sub-regions"}
                  disabled={pending}
                  defaultValue={
                    edit.record?.region?.id || edit.record?.subRegion?.id || ""
                  }
                  className="border-gp-border-default flex h-10 w-full rounded-md border bg-white px-3 text-sm"
                >
                  <option value="">
                    {edit.kind === "sub-regions"
                      ? "Select a region"
                      : "No territory assigned"}
                  </option>
                  {data[
                    edit.kind === "sub-regions" ? "regions" : "sub-regions"
                  ].map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                onClick={() => setEdit(null)}
              >
                Cancel
              </Button>
              <Button disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </FormDrawer>
    </section>
  );
}
