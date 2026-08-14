"use client";

import { format } from "date-fns";
import { ChevronDown, ChevronUp, Package, Users } from "lucide-react";
import { useState } from "react";
import Pagination from "@/components/ui/Pagination";
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
    new Set(),
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
      <div className="border-secondary-light flex flex-col items-center justify-center rounded-[14px] border-[0.8px] bg-white p-12 text-center">
        <p className="text-secondary-dark text-base/6 font-normal">
          No forecast history found
        </p>
        <p className="text-secondary-dark mt-2 text-sm/5 font-normal">
          Create your first forecast to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {forecasts.map((forecast) => (
        <div
          key={forecast.id}
          className="border-secondary-light rounded-[14px] border-[0.8px] bg-white p-6"
        >
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h3 className="text-lg/6 font-normal text-black">
                  {forecast.period}
                </h3>
                {getStatusBadge(forecast.status)}
                {getPeriodBadge(forecast.periodType)}
              </div>
              <p className="text-secondary-dark text-sm/5 font-normal">
                Submitted on{" "}
                {format(new Date(forecast.createdAt), "MMMM dd, yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-secondary-text text-sm/5 font-normal">
                Total Distribution
              </p>
              <p className="text-xl/7 font-normal text-black">
                {forecast.totalDistribution} units
              </p>
            </div>
          </header>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border-secondary-light bg-secondary-very-light rounded-[10px] border p-3">
              <p className="text-secondary-text flex items-center gap-1 text-xs/5 font-normal">
                <Users size={16} className="" />
                Doctors Covered
              </p>
              <p className="text-lg/7 font-normal text-black">
                {forecast.doctorsCovered} doctors
              </p>
            </div>
            <div className="border-secondary-light bg-secondary-very-light rounded-[10px] border p-3">
              <p className="text-secondary-text flex items-center gap-1 text-xs/5 font-normal">
                <Package size={16} className="" />
                Products Distributed
              </p>
              <p className="text-lg/7 font-normal text-black">
                {forecast.productsUsed} products
              </p>
            </div>
          </div>
          {forecast.notes && (
            <p className="bg-light-warning mb-4 rounded-[10px] border border-[#FDE68A] p-4 text-sm/4 font-semibold text-[#92400E]">
              <span className="font-bold">Notes: </span>
              {forecast.notes}
            </p>
          )}
          {forecast.supervisorFeedback && (
            <p className="mb-4 rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm/4 font-semibold text-[#166534]">
              <span className="font-bold">Supervisor Feedback: </span>
              {forecast.supervisorFeedback}
            </p>
          )}
          {forecast.distributions && forecast.distributions.length > 0 && (
            <>
              <p className="text-secondary-dark border-secondary-light mb-3 border-t-[0.8px] pt-4 text-sm/5 font-normal">
                Distribution Details:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(expandedForecasts.has(forecast.id)
                  ? forecast.distributions
                  : forecast.distributions.slice(0, 4)
                ).map((dist, index) => (
                  <div
                    key={`${forecast.id}-${dist.doctorId}-${index}`}
                    className="border-secondary-light text-secondary-text flex items-center justify-start rounded-lg border bg-[#F8FAFC] p-2 text-sm/5 font-normal"
                  >
                    <p className="">{dist.doctorName}</p>
                    <p className="">{dist.specialty}</p>
                    <p className="ml-auto text-black">
                      {dist.allocations.reduce(
                        (sum, alloc) => sum + alloc.units,
                        0,
                      )}{" "}
                      units
                    </p>
                  </div>
                ))}
              </div>
              {forecast.distributions.length > 4 && (
                <button
                  onClick={() => toggleExpanded(forecast.id)}
                  className="text-system-primary mt-3 flex w-full items-center justify-center gap-1 text-sm/5 font-medium transition-colors hover:opacity-80"
                >
                  {expandedForecasts.has(forecast.id) ? (
                    <>
                      Show Less
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show {forecast.distributions.length - 4} More Doctors
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      ))}
      <Pagination page={page} limit={limit} totalCount={totalCount} />
    </div>
  );
}
