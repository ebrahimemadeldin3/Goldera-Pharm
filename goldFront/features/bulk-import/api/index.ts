"use server";
import { apiFetch } from "@/services/http";
import { revalidatePath } from "next/cache";
import type { BulkImportEntity } from "../lib/types";
export async function importRecordsAction(
  entity: BulkImportEntity,
  records: object[],
) {
  if (
    !["doctor", "pharmacy"].includes(entity) ||
    records.length < 1 ||
    records.length > 1000
  )
    return { success: false, error: "Choose between 1 and 1000 records." };
  try {
    const result = await apiFetch<{ imported: number }>(
      `/api/${entity === "doctor" ? "doctors" : "pharmacies"}/bulk-import`,
      { method: "POST", body: JSON.stringify({ records }) },
    );
    for (const role of ["manager", "supervisor", "rep"])
      revalidatePath(
        `/${role}/${entity === "doctor" ? "doctors" : "pharmacies"}`,
      );
    return { success: true, imported: result.imported };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : (error as { message?: string }).message ||
            "Could not import records. Please try again.",
    };
  }
}
