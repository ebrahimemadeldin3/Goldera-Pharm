import type { ProductApiResponse } from "./types";

export function extractProducts(raw: unknown): ProductApiResponse[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  const record = raw as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as ProductApiResponse[];
  }

  if (Array.isArray(record.products)) {
    return record.products as ProductApiResponse[];
  }

  if (Array.isArray(raw)) {
    return raw as ProductApiResponse[];
  }

  return [];
}
