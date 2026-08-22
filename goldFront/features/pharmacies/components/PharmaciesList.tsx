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
import { ResultsFooter } from "@/components/ui/ResultsFooter";

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
    <SectionContainer className="mt-6">
      {/* Directory Toolbar Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Pharmacy Directory</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="border-secondary-light h-8.5 w-44 cursor-pointer rounded-md border bg-white px-3 text-xs font-medium">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">
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
              className="h-8.5 cursor-pointer gap-1.5 text-xs text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw size={14} />
              Reset Filters
            </Button>
          )}
        </div>
      </header>

      {/* Scope-Honest Filter Info Banner */}
      {hasActiveFilters && (
        <ScopeInfoBanner onReset={handleResetFilters}>
          Filtering currently loaded page slice
          {regionFilter !== "All Regions" && (
            <> (Region: <strong className="text-slate-700 font-medium">&quot;{regionFilter}&quot;</strong>)</>
          )}
          {q.trim() !== "" && (
            <> for <strong className="text-slate-700 font-medium">&quot;{q}&quot;</strong></>
          )}. Showing {filtered.length} of {pharmacies.length} loaded records.
        </ScopeInfoBanner>
      )}

      {/* Enterprise Table Section */}
      <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto rounded-lg border border-slate-200 shadow-2xs">
        <table className="w-full min-w-160 text-xs text-slate-700">
          <thead className="sticky top-0 z-10 bg-slate-100/90 backdrop-blur-xs border-b border-slate-200 text-xs font-semibold text-slate-700">
            <tr className="text-left">
              <th className="py-3 px-4 font-semibold text-slate-900">#</th>
              <th className="py-3 px-4 font-semibold text-slate-900">Pharmacy Name</th>
              <th className="py-3 px-4 font-semibold text-slate-900">City</th>
              <th className="py-3 px-4 font-semibold text-slate-900">Sub-Region</th>
              <th className="py-3 px-4 font-semibold text-slate-900">Region</th>
              <th className="py-3 px-4 font-semibold text-slate-900">Country</th>
              <th className="py-3 px-4 font-semibold text-slate-900">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((pharmacy, index) => (
              <tr
                key={pharmacy.id}
                className="transition-colors duration-150 hover:bg-slate-50/90"
              >
                <td className="py-3 px-4 text-xs text-slate-400 font-medium">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {pharmacy.name || "Unnamed Pharmacy"}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {pharmacy.city ? (
                    pharmacy.city
                  ) : (
                    <span className="italic text-slate-400 text-xs">No city specified</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {pharmacy.subRegion ? (
                    pharmacy.subRegion
                  ) : (
                    <span className="italic text-slate-400 text-xs">No sub-region specified</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {pharmacy.region ? (
                    pharmacy.region
                  ) : (
                    <span className="italic text-slate-400 text-xs">No region specified</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700">
                  {pharmacy.country || "Saudi Arabia"}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {pharmacy.createdAt ? (
                    format(new Date(pharmacy.createdAt), "MMM d, yyyy")
                  ) : (
                    <span className="italic text-slate-400 text-xs">No date recorded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Distinct Empty States */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              {q.trim()
                ? `No pharmacies matching "${q}" found on page ${page}.`
                : regionFilter !== "All Regions"
                ? `No pharmacies found in region "${regionFilter}".`
                : "No pharmacies found in the database."}
            </p>
            {q.trim() && (
              <p className="text-xs text-slate-500">
                Matching pharmacies may exist on another server page or region.
              </p>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-2 gap-1.5 text-xs"
              >
                <RotateCcw size={14} />
                Reset Active Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Pagination */}
      <ResultsFooter page={page} limit={limit} totalCount={totalCount} />
    </SectionContainer>
  );
}
