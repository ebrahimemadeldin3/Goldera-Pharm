"use client";

import { UseFormReturn } from "react-hook-form";
import { Doctor, Product } from "../lib/types";
import { CreateForecastFormValues } from "../lib/schemas";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Package,
  Users,
  Edit3,
  AlertCircle,
  FileText,
  CheckCircle2,
  Building2,
} from "lucide-react";

interface ForecastReviewStepProps {
  form: UseFormReturn<CreateForecastFormValues>;
  selectedProducts: Product[];
  doctors: Doctor[];
  allocations: Record<string, Record<string, number>>;
  onGoToStep: (step: 1 | 2 | 3) => void;
  isPending?: boolean;
  validationError?: string;
}

export function ForecastReviewStep({
  form,
  selectedProducts,
  doctors,
  allocations,
  onGoToStep,
  isPending = false,
  validationError,
}: ForecastReviewStepProps) {
  const periodType = form.watch("periodType");
  const month = form.watch("month");
  const quarter = form.watch("quarter");
  const year = form.watch("year");

  const formattedPeriod =
    periodType === "MONTHLY" && month
      ? `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`
      : `${quarter || "Q1"} ${year}`;

  const allocatedDoctorsList = doctors.filter((doc) => {
    const docAlloc = allocations[doc.id] || {};
    return Object.values(docAlloc).some((units) => units > 0);
  });

  const totalUnitsPlanned = Object.values(allocations).reduce(
    (sum, docAlloc) =>
      sum + Object.values(docAlloc).reduce((s, u) => s + u, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Review Summary Hero Banner */}
      <div className="rounded-[14px] border border-[#CBEFDD] bg-[#E9F8F1]/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#168557]">
              Review Your Forecast
            </span>
            <h2 className="text-xl font-extrabold text-[#182033] mt-0.5">
              {formattedPeriod}
            </h2>
            <p className="text-xs font-semibold text-[#667085] mt-1 flex flex-wrap items-center gap-2">
              <span>{selectedProducts.length} Products</span>
              <span>•</span>
              <span>{allocatedDoctorsList.length} Doctors Covered</span>
              <span>•</span>
              <span className="text-[#168557] font-bold">
                {totalUnitsPlanned.toLocaleString()} Total Units
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#168557] border border-[#CBEFDD] shadow-2xs">
              <CheckCircle2 className="size-4 text-[#168557]" />
              Everything Ready
            </span>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2.5 rounded-[10px] border border-[#FECDCA] bg-[#FEF3F2] p-4 text-xs font-semibold text-[#D92D20]">
          <AlertCircle className="size-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 2. Structured Layout: Main Column (~65%) + Side Column (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6">
        {/* Left Column (~65%): Products & Allocations */}
        <div className="space-y-6">
          {/* Selected Products Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-2">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-[#168557]" />
                <h3 className="text-sm font-bold text-[#182033]">
                  Selected Products ({selectedProducts.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(2)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#168557] hover:underline"
              >
                <Edit3 className="size-3" /> Edit Products
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#182033]"
                >
                  <span className="size-2 rounded-full bg-[#168557]" />
                  <span>{product.name}</span>
                  {product.category && (
                    <span className="text-[10px] text-[#667085] font-normal">
                      ({product.category})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Breakdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-[#168557]" />
                <h3 className="text-sm font-bold text-[#182033]">
                  Doctor Allocation Breakdown ({allocatedDoctorsList.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(3)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#168557] hover:underline"
              >
                <Edit3 className="size-3" /> Edit Allocations
              </button>
            </div>

            {allocatedDoctorsList.length === 0 ? (
              <p className="text-xs text-[#667085] py-3">
                No doctor allocations specified. Click Edit Allocations to assign units.
              </p>
            ) : (
              <div className="space-y-2">
                {allocatedDoctorsList.map((doc) => {
                  const docAlloc = allocations[doc.id] || {};
                  const activeProducts = Object.entries(docAlloc).filter(
                    ([, u]) => u > 0
                  );
                  const docTotal = activeProducts.reduce((sum, [, u]) => sum + u, 0);

                  return (
                    <div
                      key={doc.id}
                      className="rounded-[10px] border border-[#E5E8EF] bg-white p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#182033]">{doc.name}</p>
                          <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-0.5">
                            <Building2 className="size-3 text-[#98A2B3]" />
                            {doc.hospital || "Unassigned"} • {doc.specialty}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#168557] bg-[#E9F8F1] px-2.5 py-1 rounded-full border border-[#CBEFDD]">
                          {docTotal.toLocaleString()} units
                        </span>
                      </div>

                      {/* Product breakdown tags per doctor */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EEF1F6]">
                        {activeProducts.map(([prodId, units]) => {
                          const prodObj = selectedProducts.find((p) => p.id === prodId);
                          return (
                            <span
                              key={prodId}
                              className="inline-flex items-center gap-1 rounded-[6px] bg-[#F4F6FA] px-2 py-0.5 text-[11px] font-medium text-[#344054]"
                            >
                              <span>{prodObj?.name || prodId}:</span>
                              <span className="font-bold text-[#182033]">{units}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (~35%): Setup Details & Strategy Notes */}
        <div className="space-y-6">
          {/* Setup Details */}
          <div className="rounded-[12px] border border-[#E5E8EF] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-[#168557]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Setup Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onGoToStep(1)}
                className="text-xs font-bold text-[#168557] hover:underline"
              >
                Edit Setup
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#667085]">Period</span>
                <span className="font-bold text-[#182033]">{formattedPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Type</span>
                <span className="font-bold text-[#182033] capitalize">
                  {periodType.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Year</span>
                <span className="font-bold text-[#182033]">{year}</span>
              </div>
            </div>
          </div>

          {/* Strategy Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-[#168557]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                Notes / Strategy (Optional)
              </h3>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isPending}
                      rows={4}
                      placeholder="Add any notes about your forecast strategy..."
                      className="rounded-[10px] border border-[#DDE3EE] bg-white p-3 text-xs text-[#182033] placeholder:text-[#98A2B3] outline-none focus:border-[#168557]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
