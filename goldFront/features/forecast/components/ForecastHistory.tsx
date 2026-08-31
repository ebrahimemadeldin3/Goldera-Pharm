"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronUp, Package, Users, Activity } from "lucide-react";
import { useState } from "react";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { Forecast } from "../lib/types";
import { getPeriodBadge, getStatusBadge } from "../lib/utils/history";

export default function ForecastHistory({
  forecasts,
  page,
  limit,
  totalCount,
}: {
  forecasts: Forecast[];
  page: number;
  limit: number;
  totalCount: number;
}) {
  const [expandedForecasts, setExpandedForecasts] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (forecastId: string) => {
    setExpandedForecasts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(forecastId)) {
        newSet.delete(forecastId);
      } else {
        newSet.add(forecastId);
      }
      return newSet;
    });
  };

  if (forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-[#E5E8EF] bg-white p-12 text-center">
        <p className="text-base font-semibold text-[#182033]">
          No forecast history found
        </p>
        <p className="mt-1 text-xs text-[#667085]">
          Create your first forecast submission to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {forecasts.map((forecast) => {
          return (
            <div
              key={forecast.id}
              className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#CBEFDD]"
            >
              <div>
                {/* Header: Period, Status, Type */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF1F6] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#182033]">
                      {forecast.period}
                    </h3>
                    <p className="text-[11px] font-medium text-[#667085] mt-0.5">
                      Submitted on{" "}
                      {format(new Date(forecast.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(forecast.status)}
                    {getPeriodBadge(forecast.periodType)}
                  </div>
                </div>

                {/* Compact Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-3">
                  <div className="rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1">
                      <Activity className="size-3 text-[#168557]" />
                      Units
                    </p>
                    <p className="text-sm font-bold text-[#182033] mt-0.5 truncate">
                      {forecast.totalDistribution}
                    </p>
                  </div>

                  <div className="rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1">
                      <Users className="size-3 text-[#168557]" />
                      Doctors
                    </p>
                    <p className="text-sm font-bold text-[#182033] mt-0.5 truncate">
                      {forecast.doctorsCovered}
                    </p>
                  </div>

                  <div className="rounded-[8px] border border-[#E5E8EF] bg-[#F9FAFB] p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1">
                      <Package className="size-3 text-[#168557]" />
                      Products
                    </p>
                    <p className="text-sm font-bold text-[#182033] mt-0.5 truncate">
                      {forecast.productsUsed}
                    </p>
                  </div>
                </div>

                {/* Notes & Feedback */}
                {forecast.notes && (
                  <p className="mt-2 rounded-[8px] border border-[#E9DDB8] bg-[#FFF8E5] p-2.5 text-xs text-[#8A6515]">
                    <span className="font-bold">Notes: </span>
                    {forecast.notes}
                  </p>
                )}

                {forecast.supervisorFeedback && (
                  <p className="mt-2 rounded-[8px] border border-[#CBEFDD] bg-[#E9F8F1] p-2.5 text-xs text-[#168557]">
                    <span className="font-bold">Supervisor Feedback: </span>
                    {forecast.supervisorFeedback}
                  </p>
                )}

                {/* Distribution Details Preview */}
                {forecast.distributions && forecast.distributions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#EEF1F6]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#667085] mb-2">
                      Allocations Preview:
                    </p>
                    <div className="space-y-1.5">
                      {(expandedForecasts.has(forecast.id)
                        ? forecast.distributions
                        : forecast.distributions.slice(0, 3)
                      ).map((dist, index) => (
                        <div
                          key={`${forecast.id}-${dist.doctorId}-${index}`}
                          className="flex items-center justify-between rounded-[6px] border border-[#E5E8EF] bg-[#F9FAFB] px-2.5 py-1.5 text-xs"
                        >
                          <div className="min-w-0 truncate pr-2">
                            <span className="font-bold text-[#182033]">
                              {dist.doctorName}
                            </span>
                            <span className="text-[#667085] ml-1.5 font-medium">
                              ({dist.specialty})
                            </span>
                          </div>
                          <span className="shrink-0 font-bold text-[#168557] bg-[#E9F8F1] px-2 py-0.5 rounded-full text-[10px]">
                            {dist.allocations.reduce(
                              (sum, alloc) => sum + alloc.units,
                              0
                            )}{" "}
                            units
                          </span>
                        </div>
                      ))}
                    </div>

                    {forecast.distributions.length > 3 && (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(forecast.id)}
                        className="mt-2.5 flex w-full items-center justify-center gap-1 text-xs font-bold text-[#168557] hover:underline"
                      >
                        {expandedForecasts.has(forecast.id) ? (
                          <>
                            Show Less <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            Show {forecast.distributions.length - 3} More Doctors{" "}
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalCount={totalCount || forecasts.length}
        itemLabel="forecasts"
        ariaLabel="Forecasts pagination"
        pageNavAriaLabel="Forecast pages"
      />
    </div>
  );
}
