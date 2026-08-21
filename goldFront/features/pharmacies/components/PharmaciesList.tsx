"use client";

import { useMemo, useState } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { PharmacyApiResponse } from "../lib/types";
import Pagination from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PharmaciesListProps {
  pharmacies: PharmacyApiResponse[];
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
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [q, setQ] = useState("");

  const regions = useMemo(() => {
    const set = new Set(pharmacies.map((p) => p.region).filter(Boolean));
    return ["All Regions", ...Array.from(set)];
  }, [pharmacies]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return pharmacies.filter((p) => {
      if (regionFilter !== "All Regions" && p.region !== regionFilter)
        return false;
      if (!term) return true;
      return (
        p.name?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term) ||
        p.subRegion?.toLowerCase().includes(term) ||
        p.region?.toLowerCase().includes(term) ||
        p.country?.toLowerCase().includes(term)
      );
    });
  }, [pharmacies, regionFilter, q]);

  const hasActiveFilters = Boolean(q.trim() || regionFilter !== "All Regions");

  const handleResetFilters = () => {
    setQ("");
    setRegionFilter("All Regions");
  };

  // Record bounds for footer summary
  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <section className="border-secondary-light mt-6 rounded-xl border bg-white p-5 sm:p-6">
      {/* Directory Toolbar Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-xl font-semibold text-black">Pharmacy Directory</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="border-secondary-light h-9 w-44 cursor-pointer rounded-md border bg-white px-3 text-sm font-medium">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Search Input */}
          <div className="relative w-full sm:w-70 md:w-80">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#717182]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter page by name, city..."
              className="h-9 w-full rounded-md border border-slate-200 bg-white pr-8 pl-9 text-sm"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 cursor-pointer gap-1.5 text-xs text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw size={14} />
              Reset Filters
            </Button>
          )}
        </div>
      </header>

      {/* Scope-Honest Filter Info Pill */}
      {hasActiveFilters && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-700">
          <span>
            Filtering currently loaded page slice
            {regionFilter !== "All Regions" && (
              <> (Region: <strong>&quot;{regionFilter}&quot;</strong>)</>
            )}
            {q.trim() !== "" && (
              <> for <strong>&quot;{q}&quot;</strong></>
            )}. Showing {filtered.length} of {pharmacies.length} loaded records.
          </span>
          <button
            onClick={handleResetFilters}
            className="font-medium underline hover:text-blue-900"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-secondary-light bg-slate-50/60 border-b text-left">
              <th className="py-3 pr-4 pl-3 font-semibold text-slate-700">#</th>
              <th className="py-3 pr-4 font-semibold text-slate-700">Pharmacy Name</th>
              <th className="py-3 pr-4 font-semibold text-slate-700">City</th>
              <th className="py-3 pr-4 font-semibold text-slate-700">Sub-Region</th>
              <th className="py-3 pr-4 font-semibold text-slate-700">Region</th>
              <th className="py-3 pr-4 font-semibold text-slate-700">Country</th>
              <th className="py-3 pr-3 font-semibold text-slate-700">Added Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((pharmacy, index) => (
              <tr
                key={pharmacy.id}
                className="border-secondary-light border-b transition-colors last:border-0 hover:bg-slate-50/80"
              >
                <td className="py-3.5 pr-4 pl-3 text-xs text-[#717182]">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="py-3.5 pr-4 font-medium text-black">
                  {pharmacy.name || "Unnamed Pharmacy"}
                </td>
                <td className="py-3.5 pr-4 text-[#334155]">
                  {pharmacy.city ? (
                    pharmacy.city
                  ) : (
                    <span className="italic text-slate-400 text-xs">No city specified</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-[#334155]">
                  {pharmacy.subRegion ? (
                    pharmacy.subRegion
                  ) : (
                    <span className="italic text-slate-400 text-xs">No sub-region specified</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-[#334155]">
                  {pharmacy.region ? (
                    pharmacy.region
                  ) : (
                    <span className="italic text-slate-400 text-xs">No region specified</span>
                  )}
                </td>
                <td className="py-3.5 pr-4 text-[#334155]">
                  {pharmacy.country || "Saudi Arabia"}
                </td>
                <td className="py-3.5 pr-3 text-[#717182]">
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
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <p className="text-secondary-dark text-xs font-normal">
          Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
          <span className="font-medium text-slate-700">{endItem}</span> of{" "}
          <span className="font-medium text-slate-700">{totalCount}</span> pharmacies
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </footer>
    </section>
  );
}
