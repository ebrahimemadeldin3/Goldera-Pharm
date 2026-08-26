"use client";

import { useMemo, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { PharmacyApiResponse } from "../lib/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SearchInput } from "@/components/ui/SearchInput";
import { ScopeInfoBanner } from "@/components/ui/ScopeInfoBanner";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";

interface PharmaciesListProps {
  pharmacies?: PharmacyApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

export default function PharmaciesList({
  pharmacies = [],
  page = 1,
  limit = 10,
  totalCount = 0,
}: PharmaciesListProps) {
  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState("All Regions");

  // Derive unique regions for filter dropdown
  const regions = useMemo(() => {
    const set = new Set<string>();
    pharmacies.forEach((p) => {
      if (p.region) set.add(p.region);
    });
    return ["All Regions", ...Array.from(set)];
  }, [pharmacies]);

  // Client-side filtering over currently loaded page records
  const filtered = useMemo(() => {
    return pharmacies.filter((p) => {
      // Region filter
      if (regionFilter !== "All Regions" && p.region !== regionFilter) {
        return false;
      }
      // Text search (name, city, subRegion)
      if (q.trim()) {
        const query = q.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(query);
        const cityMatch = p.city?.toLowerCase().includes(query);
        const subRegionMatch = p.subRegion?.toLowerCase().includes(query);
        return Boolean(nameMatch || cityMatch || subRegionMatch);
      }
      return true;
    });
  }, [pharmacies, regionFilter, q]);

  const handleResetFilters = () => {
    setQ("");
    setRegionFilter("All Regions");
  };

  const hasActiveFilters = Boolean(q.trim() || regionFilter !== "All Regions");

  return (
    <SectionContainer className="mt-6 p-0 overflow-hidden border border-[#E5E8EF] rounded-[16px] bg-white shadow-none">
      {/* Directory Toolbar Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-base font-semibold text-[#182033]">Pharmacy Directory</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#8A94A6] shrink-0" />
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-10 w-44 cursor-pointer rounded-[10px] border border-[#DDE3EE] bg-white px-3 text-xs font-semibold text-[#182033] hover:border-[#E9DDB8] focus-visible:ring-2 focus-visible:ring-[#C9A44C]/30">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {regions.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs font-medium cursor-pointer">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Search Input */}
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Filter page by name, city..."
          />

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 cursor-pointer gap-1.5 text-xs font-semibold text-[#667085] hover:bg-[#F9FAFB] hover:text-[#182033] px-3 rounded-[10px]"
            >
              <RotateCcw size={14} />
              Reset Filters
            </Button>
          )}
        </div>
      </header>

      {/* Scope-Honest Filter Info Banner */}
      {hasActiveFilters && (
        <div className="px-5 pt-4">
          <ScopeInfoBanner onReset={handleResetFilters}>
            Filtering currently loaded page slice
            {regionFilter !== "All Regions" && (
              <> (Region: <strong className="text-[#182033] font-semibold">&quot;{regionFilter}&quot;</strong>)</>
            )}
            {q.trim() !== "" && (
              <> for <strong className="text-[#182033] font-semibold">&quot;{q}&quot;</strong></>
            )}. Showing {filtered.length} of {pharmacies.length} loaded records.
          </ScopeInfoBanner>
        </div>
      )}

      {/* Enterprise Table Section */}
      <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
        <table className="w-full min-w-160 text-xs text-[#182033]">
          <thead className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E8EF] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
            <tr className="text-left">
              <th className="py-3 px-4 font-semibold text-[#667085]">#</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">Pharmacy Name</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">City</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">Sub-Region</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">Region</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">Country</th>
              <th className="py-3 px-4 font-semibold text-[#667085]">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF1F6] bg-white">
            {filtered.map((pharmacy, index) => (
              <tr
                key={pharmacy.id}
                className="transition-colors duration-150 hover:bg-[#FFFDF7]"
              >
                <td className="py-3.5 px-4 text-xs text-[#8A94A6] font-medium">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="py-3.5 px-4 font-semibold text-[#182033]">
                  {pharmacy.name || "Unnamed Pharmacy"}
                </td>
                <td className="py-3.5 px-4 text-[#344054]">
                  {pharmacy.city ? (
                    pharmacy.city
                  ) : (
                    <span className="italic text-[#8A94A6] text-xs">No city specified</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-[#344054]">
                  {pharmacy.subRegion ? (
                    pharmacy.subRegion
                  ) : (
                    <span className="italic text-[#8A94A6] text-xs">No sub-region specified</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-[#344054]">
                  {pharmacy.region ? (
                    pharmacy.region
                  ) : (
                    <span className="italic text-[#8A94A6] text-xs">No region specified</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-[#344054]">
                  {pharmacy.country || "Saudi Arabia"}
                </td>
                <td className="py-3.5 px-4 text-[#667085] font-medium">
                  {pharmacy.createdAt ? (
                    format(new Date(pharmacy.createdAt), "MMM d, yyyy")
                  ) : (
                    <span className="italic text-[#8A94A6] text-xs">No date recorded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Distinct Empty States */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#E5E8EF] bg-[#F9FAFB] m-5 p-10 text-center">
            <p className="text-sm font-semibold text-[#182033]">
              {q.trim()
                ? `No pharmacies matching "${q}" found on page ${page}.`
                : regionFilter !== "All Regions"
                ? `No pharmacies found in region "${regionFilter}".`
                : "No pharmacies found in the database."}
            </p>
            {q.trim() && (
              <p className="text-xs text-[#667085]">
                Matching pharmacies may exist on another server page or region.
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 gap-1.5 text-xs font-semibold rounded-[10px]"
              >
                <RotateCcw size={14} />
                Reset Active Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Pagination */}
      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount}
        itemLabel="pharmacies"
        ariaLabel="Pharmacies directory pagination"
      />
    </SectionContainer>
  );
}
