"use server";
import { apiFetch } from "@/services/http";
import { revalidatePath } from "next/cache";
import type { ApiError } from "@/services/api-error";
export type ReferenceKind = "regions" | "sub-regions" | "accounts";
export type ReferenceRecord = {
  id: string;
  name: string;
  country?: string;
  region?: { id: string; name: string };
  subRegion?: { id: string; name: string } | null;
};

export async function getReferenceDataAction() {
  try {
    const [regions, territories, accounts] = await Promise.all(
      ["regions", "sub-regions", "accounts"].map((kind) =>
        apiFetch<{ data: ReferenceRecord[] }>(`/api/${kind}`),
      ),
    );
    return {
      success: true as const,
      data: {
        regions: regions.data,
        "sub-regions": territories.data,
        accounts: accounts.data,
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: {
        message: (error as ApiError).message || "Could not load reference data",
      },
    };
  }
}
export async function saveReferenceAction(
  kind: ReferenceKind,
  id: string | null,
  values: Record<string, string>,
) {
  if (!["regions", "sub-regions", "accounts"].includes(kind))
    return { success: false, error: { message: "Invalid record type" } };
  try {
    await apiFetch(`/api/${kind}${id ? `/${id}` : ""}`, {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(values),
    });
    revalidatePath("/manager/settings");
    revalidatePath("/manager/team");
    revalidatePath("/manager/doctors");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        message: (error as ApiError).message || "Could not save record",
      },
    };
  }
}
export async function deleteReferenceAction(kind: ReferenceKind, id: string) {
  if (!["regions", "sub-regions", "accounts"].includes(kind))
    return { success: false, error: { message: "Invalid record type" } };
  try {
    await apiFetch(`/api/${kind}/${id}`, { method: "DELETE" });
    revalidatePath("/manager/settings");
    revalidatePath("/manager/team");
    revalidatePath("/manager/doctors");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        message: (error as ApiError).message || "Could not delete record",
      },
    };
  }
}
