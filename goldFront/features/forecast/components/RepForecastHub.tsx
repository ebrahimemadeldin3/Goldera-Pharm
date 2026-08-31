"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablePaginationFooter } from "@/components/ui/table-pagination-footer";
import { Forecast } from "../lib/types";
import { getPeriodBadge, getStatusBadge } from "../lib/utils/history";

interface RepForecastHubProps {
  forecasts: Forecast[];
  page?: number;
  limit?: number;
  totalCount?: number;
}

export function RepForecastHub({
  forecasts,
  page = 1,
  limit = 10,
  totalCount = 0,
}: RepForecastHubProps) {
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

  const latestForecast = forecasts.length > 0 ? forecasts[0] : null;

  return (
    <div className="space-y-6">
      {/* Current / Latest Forecast Workspace Summary Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#182033] uppercase tracking-wider">
            Latest Forecast Submission
          </h2>
          <Link href="/rep/forecast/new">
            <span className="text-xs font-bold text-[#168557] hover:underline flex items-center gap-1">
              <Plus className="size-3.5" /> Submit Another Forecast
            </span>
          </Link>
        </div>

        {!latestForecast ? (
          <div className="rounded-[14px] border border-dashed border-[#CBEFDD] bg-[#E9F8F1]/20 p-8 text-center">
            <TrendingUp className="mx-auto size-10 text-[#168557] mb-3" />
            <h3 className="text-base font-bold text-[#182033]">
              No Forecast Submitted Yet
            </h3>
            <p className="text-xs text-[#667085] mt-1 max-w-md mx-auto">
              Plan your product distribution across doctors in your territory for the
              upcoming month or quarter.
            </p>
            <Link href="/rep/forecast/new" className="mt-4 inline-block">
              <Button className="h-10 rounded-[10px] bg-gp-rep-primary px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] hover:bg-gp-rep-primary-hover">
                <Plus className="mr-1.5 size-4" />
                Create New Forecast
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-[14px] border border-[#CBEFDD] bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EEF1F6] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h3 className="text-xl font-bold text-[#182033]">
                    {latestForecast.period}
                  </h3>
                  {getStatusBadge(latestForecast.status)}
                  {getPeriodBadge(latestForecast.periodType)}
                </div>
                <p className="text-xs text-[#667085] flex items-center gap-1">
                  <Clock className="size-3.5 text-[#98A2B3]" />
                  Submitted on{" "}
                  {format(new Date(latestForecast.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
                  Total Planned Allocation
                </p>
                <p className="text-2xl font-bold text-[#168557]">
                  {latestForecast.totalDistribution.toLocaleString()} units
                </p>
              </div>
            </div>

            {/* Core Summary Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-3.5">
                <p className="text-xs text-[#667085] flex items-center gap-1.5 font-medium">
                  <Users size={16} className="text-[#168557]" />
                  Doctors Covered
                </p>
                <p className="text-lg font-bold text-[#182033] mt-1">
                  {latestForecast.doctorsCovered} doctors
                </p>
              </div>
              <div className="rounded-[10px] border border-[#E5E8EF] bg-[#F9FAFB] p-3.5">
                <p className="text-xs text-[#667085] flex items-center gap-1.5 font-medium">
                  <Package size={16} className="text-[#168557]" />
                  Products Distributed
                </p>
                <p className="text-lg font-bold text-[#182033] mt-1">
                  {latestForecast.productsUsed} products
                </p>
              </div>
            </div>

            {latestForecast.notes && (
              <div className="rounded-[10px] border border-[#E9DDB8] bg-[#FFF8E5] p-3.5 text-xs text-[#8A6515]">
                <span className="font-bold">Notes: </span>
                {latestForecast.notes}
              </div>
            )}

            {latestForecast.supervisorFeedback && (
              <div className="rounded-[10px] border border-[#CBEFDD] bg-[#E9F8F1] p-3.5 text-xs text-[#168557]">
                <span className="font-bold">Supervisor Feedback: </span>
                {latestForecast.supervisorFeedback}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Forecast History Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-[#182033] uppercase tracking-wider">
          Forecast History
        </h2>

        {forecasts.length === 0 ? (
          <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-8 text-center text-xs text-[#667085]">
            No forecast history records found.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {forecasts.map((forecast) => {
                const isExpanded = expandedForecasts.has(forecast.id);

                return (
                  <div
                    key={forecast.id}
                    className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 space-y-3.5 transition-colors hover:border-[#CBEFDD] shadow-xs flex flex-col justify-between"
                  >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-[#182033]">
                          {forecast.period}
                        </h3>
                        {getStatusBadge(forecast.status)}
                        {getPeriodBadge(forecast.periodType)}
                      </div>
                      <p className="text-xs text-[#667085]">
                        Submitted on{" "}
                        {format(new Date(forecast.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#667085]">Distribution</p>
                      <p className="text-base font-bold text-[#182033]">
                        {forecast.totalDistribution.toLocaleString()} units
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#F9FAFB] rounded-[10px] p-3 border border-[#EEF1F6]">
                    <div>
                      <span className="text-[#667085]">Doctors:</span>{" "}
                      <span className="font-bold text-[#182033]">
                        {forecast.doctorsCovered}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#667085]">Products:</span>{" "}
                      <span className="font-bold text-[#182033]">
                        {forecast.productsUsed}
                      </span>
                    </div>
                  </div>

                  {forecast.distributions && forecast.distributions.length > 0 && (
                    <div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {(isExpanded
                          ? forecast.distributions
                          : forecast.distributions.slice(0, 2)
                        ).map((dist, idx) => (
                          <div
                            key={`${forecast.id}-${dist.doctorId}-${idx}`}
                            className="rounded-[8px] border border-[#EEF1F6] bg-white p-2.5 text-xs flex items-center justify-between"
                          >
                            <span className="font-medium text-[#182033] truncate max-w-[180px]">
                              {dist.doctorName}
                            </span>
                            <span className="font-bold text-[#168557]">
                              {dist.allocations.reduce(
                                (s, a) => s + a.units,
                                0
                              )}{" "}
                              units
                            </span>
                          </div>
                        ))}
                      </div>

                      {forecast.distributions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(forecast.id)}
                          className="mt-2 text-xs font-semibold text-[#168557] hover:underline inline-flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp className="size-3" />
                            </>
                          ) : (
                            <>
                              Show {forecast.distributions.length - 2} More
                              Doctors <ChevronDown className="size-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
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
        )}
      </section>
    </div>
  );
}
