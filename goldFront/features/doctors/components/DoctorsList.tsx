"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DoctorCard from "./DoctorCard";
import { DoctorCardData } from "../lib/types";
import { DoctorApiResponse } from "../lib/types/api";
import { mapToDoctorCard } from "../lib/utils/mappers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import Pagination from "@/components/ui/Pagination";

interface DoctorsListProps {
  doctors?: DoctorApiResponse[];
  page?: number;
  limit?: number;
  totalCount?: number;
  selectedSubRegion?: string;
}

export default function DoctorsList({
  doctors = [],
  page = 1,
  limit = 10,
  totalCount = 0,
  selectedSubRegion = "",
}: DoctorsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState("");

  // Map API response to UI data format using mapper
  const doctorsData: DoctorCardData[] = useMemo(() => {
    return doctors.map(mapToDoctorCard);
  }, [doctors]);

  // Handle Sub-Region change via URL parameters
  const handleSubRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value === "ALL" || value === "All Sub-Regions") {
      params.delete("subRegion");
    } else {
      params.set("subRegion", value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subRegion");
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const activeSubRegion = selectedSubRegion || "ALL";

  // Available sub-regions (known options + currently active)
  const subRegionOptions = [
    { value: "ALL", label: "All Sub-Regions" },
    { value: "Riyadh 1", label: "Riyadh 1" },
    { value: "Riyadh 2", label: "Riyadh 2" },
    { value: "Jeddah 1", label: "Jeddah 1" },
    { value: "Jeddah 2", label: "Jeddah 2" },
    { value: "Eastern 1", label: "Eastern 1" },
    { value: "Eastern 2", label: "Eastern 2" },
    { value: "Southern 1", label: "Southern 1" },
    { value: "Northern 1", label: "Northern 1" },
  ];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return doctorsData;

    return doctorsData.filter((d) => {
      if (d.nameEN?.toLowerCase().includes(term)) return true;
      if (d.nameAR?.toLowerCase().includes(term)) return true;
      if (d.specialty?.toLowerCase().includes(term)) return true;
      if (d.accountName?.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [q, doctorsData]);

  const hasActiveFilters = Boolean(q.trim() || selectedSubRegion);

  const startItem = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <section className="border-secondary-light mt-6 rounded-[14px] border-[.8px] bg-white p-6">
      {/* Header & Controls */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-black">Doctor Directory</h2>
          {isPending && (
            <span className="text-xs font-normal text-slate-400">Loading...</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-Region Selector */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <Select
              value={activeSubRegion}
              onValueChange={handleSubRegionChange}
              disabled={isPending}
            >
              <SelectTrigger className="border-secondary-light h-9 w-44 cursor-pointer rounded-md border bg-white px-3 text-sm font-medium">
                <SelectValue placeholder="All Sub-Regions" />
              </SelectTrigger>
              <SelectContent>
                {subRegionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#717182]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter page by name, specialty..."
              className="h-9 w-full rounded-md border border-slate-200 bg-white pr-8 pl-9 text-sm focus:border-blue-500 focus:outline-none"
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

          {/* Clear Filters Button */}
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

      {/* Honest Search Info Pill */}
      {q.trim() !== "" && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-700">
          <span>
            Filtering currently loaded page slice for &quot;<strong>{q}</strong>&quot;.
            Showing {filtered.length} of {doctors.length} loaded records.
          </span>
          <button
            onClick={() => setQ("")}
            className="font-medium underline hover:text-blue-900"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Doctors List */}
      <section className="flex flex-col gap-4">
        {filtered.map((d) => (
          <DoctorCard key={d.id} data={d} />
        ))}

        {/* Empty States */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              {q.trim()
                ? `No doctors matching "${q}" found on page ${page}.`
                : selectedSubRegion
                ? `No doctors found in sub-region "${selectedSubRegion}".`
                : "No doctors found in the database."}
            </p>
            {q.trim() && (
              <p className="text-xs text-slate-500">
                Matching doctors may exist on another server page or sub-region.
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
      </section>

      {/* Bottom Footer Pagination */}
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 font-normal">
          Showing <span className="font-medium text-slate-700">{startItem}</span> to{" "}
          <span className="font-medium text-slate-700">{endItem}</span> of{" "}
          <span className="font-medium text-slate-700">{totalCount}</span> doctors
        </p>
        <Pagination page={page} limit={limit} totalCount={totalCount} />
      </footer>
    </section>
  );
}
