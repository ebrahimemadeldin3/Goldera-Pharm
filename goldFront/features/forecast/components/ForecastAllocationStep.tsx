"use client";

import { useMemo, useState } from "react";
import { Doctor, Product } from "../lib/types";
import { Search, Building2, UserRound, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ForecastAllocationStepProps {
  doctors: Doctor[];
  selectedProducts: Product[];
  allocations: Record<string, Record<string, number>>;
  onAllocationChange: (doctorId: string, productId: string, units: number) => void;
  isPending?: boolean;
}

export function ForecastAllocationStep({
  doctors,
  selectedProducts,
  allocations,
  onAllocationChange,
  isPending = false,
}: ForecastAllocationStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const specialties = useMemo(() => {
    const specs = Array.from(new Set(doctors.map((d) => d.specialty))).sort();
    return ["all", ...specs];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesQuery =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.hospital.toLowerCase().includes(query);

      const matchesSpec =
        specialtyFilter === "all" || doctor.specialty === specialtyFilter;

      return matchesQuery && matchesSpec;
    });
  }, [doctors, searchQuery, specialtyFilter]);

  // Compute live metrics
  const totals = useMemo(() => {
    let totalUnits = 0;
    const doctorsCoveredSet = new Set<string>();
    const productsAllocatedSet = new Set<string>();

    Object.entries(allocations).forEach(([docId, doctorAlloc]) => {
      Object.entries(doctorAlloc).forEach(([prodId, units]) => {
        if (units > 0) {
          totalUnits += units;
          doctorsCoveredSet.add(docId);
          productsAllocatedSet.add(prodId);
        }
      });
    });

    return {
      totalUnitsPlanned: totalUnits,
      doctorsCovered: doctorsCoveredSet.size,
      productsAllocated: productsAllocatedSet.size,
    };
  }, [allocations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#182033]">Doctor Allocations</h2>
          <p className="text-xs text-[#667085]">
            Assign planned units for each selected product to your target doctors.
          </p>
        </div>

        {/* Live Allocation Summary Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-3 py-1 text-xs font-bold text-[#168557]">
            {totals.totalUnitsPlanned.toLocaleString()} Units Planned
          </span>
          <span className="inline-flex items-center rounded-full bg-[#F6F8FB] border border-[#E5E8EF] px-3 py-1 text-xs font-semibold text-[#344054]">
            {totals.doctorsCovered} Doctors
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctor or hospital..."
            className="h-10 w-full rounded-[10px] border border-[#DDE3EE] bg-[#F9FAFB] pr-3 pl-9 text-sm font-medium text-[#182033] placeholder:text-[#98A2B3] outline-none transition-colors focus:border-[#168557] focus:ring-2 focus:ring-[#168557]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {specialties.map((spec) => {
            const isActive = specialtyFilter === spec;
            const label = spec === "all" ? "All Specialties" : spec;

            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSpecialtyFilter(spec)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors border",
                  isActive
                    ? "bg-[#E9F8F1] text-[#168557] border-[#CBEFDD]"
                    : "bg-white text-[#667085] border-[#E5E8EF] hover:bg-[#F9FAFB] hover:text-[#182033]"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allocation List / Table */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#DDE3EE] bg-[#F9FAFB] p-8 text-center">
          <UserRound className="mx-auto size-8 text-[#98A2B3] mb-2" />
          <p className="text-sm font-semibold text-[#344054]">
            No doctors match your filter
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Try adjusting doctor search query or specialty.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDoctors.map((doctor) => {
            const doctorAlloc = allocations[doctor.id] || {};
            const doctorTotal = Object.values(doctorAlloc).reduce(
              (sum, v) => sum + (v || 0),
              0
            );

            return (
              <div
                key={doctor.id}
                className={cn(
                  "rounded-[14px] border p-4 transition-colors bg-white",
                  doctorTotal > 0
                    ? "border-[#CBEFDD] bg-[#E9F8F1]/10"
                    : "border-[#E5E8EF]"
                )}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  {/* Doctor Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#182033] truncate">
                        {doctor.name}
                      </p>
                      <span className="inline-flex items-center rounded-md bg-[#F4F6FA] border border-[#E5E8EF] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
                        {doctor.specialty}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] flex items-center gap-1 mt-1">
                      <Building2 className="size-3 text-[#98A2B3]" />
                      <span>{doctor.hospital}</span>
                    </p>
                  </div>

                  {/* Doctor Allocations Control per Selected Product */}
                  <div className="flex flex-wrap items-center gap-3">
                    {selectedProducts.map((product) => {
                      const units = doctorAlloc[product.id] || 0;

                      return (
                        <div
                          key={product.id}
                          className="flex items-center gap-1.5 rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-1.5"
                        >
                          <span className="text-xs font-semibold text-[#344054] max-w-[110px] truncate px-1">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={units <= 0 || isPending}
                              onClick={() =>
                                onAllocationChange(
                                  doctor.id,
                                  product.id,
                                  Math.max(0, units - 10)
                                )
                              }
                              className="inline-flex size-7 items-center justify-center rounded-[6px] border border-[#DDE3EE] bg-white text-[#344054] hover:bg-[#F4F6FA] disabled:opacity-40 transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <Input
                              type="number"
                              min="0"
                              value={units || ""}
                              placeholder="0"
                              disabled={isPending}
                              onChange={(e) =>
                                onAllocationChange(
                                  doctor.id,
                                  product.id,
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="h-7 w-16 text-center text-xs font-bold text-[#182033] rounded-[6px] border-[#DDE3EE] bg-white shadow-none focus-visible:border-[#168557]"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                onAllocationChange(
                                  doctor.id,
                                  product.id,
                                  units + 10
                                )
                              }
                              className="inline-flex size-7 items-center justify-center rounded-[6px] border border-[#DDE3EE] bg-white text-[#344054] hover:bg-[#F4F6FA] disabled:opacity-40 transition-colors"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
