import type { SaleApiResponse } from "../types";

/**
 * Extract sales array from API response (handles different response shapes)
 */
export function extractSales(raw: unknown): SaleApiResponse[] {
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;

  if (
    r.data &&
    typeof r.data === "object" &&
    Array.isArray((r.data as Record<string, unknown>).sales)
  ) {
    return (r.data as { sales: SaleApiResponse[] }).sales;
  }

  if (
    r.data &&
    typeof r.data === "object" &&
    Array.isArray((r.data as Record<string, unknown>).data)
  ) {
    return (r.data as { data: SaleApiResponse[] }).data;
  }

  if (Array.isArray(r.data)) return r.data as SaleApiResponse[];
  if (Array.isArray(r.sales)) return r.sales as SaleApiResponse[];
  if (Array.isArray(raw)) return raw as SaleApiResponse[];
  return [];
}
