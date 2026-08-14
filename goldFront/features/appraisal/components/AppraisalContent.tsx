"use client";

import { useState, useMemo } from "react";
import Pagination from "@/components/ui/Pagination";
import { AppraisalFilters } from "./AppraisalFilters";
import { ReviewsList } from "./ReviewsList";
import { StatCards } from "@/core/ui/StatCards";
import { appraisalStatsConfig } from "../lib/constants/stats-config";
import type { Review } from "../lib/types";

type AppraisalContentProps = {
  reviews: Review[];
  page?: number;
  limit?: number;
  totalCount?: number;
  stats: {
    avgScore: number;
    excellentCount: number;
    improvingCount: number;
    totalReviews: number;
  };
};

export function AppraisalContent({
  reviews,
  stats,
  page = 1,
  limit = 10,
  totalCount = 0,
}: AppraisalContentProps) {
  const [period, setPeriod] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [tab, setTab] = useState<"all" | "supervisors" | "reps">("all");
  const [query, setQuery] = useState<string>("");

  const visible = useMemo(() => {
    return reviews.filter((r: Review) => {
      const matchPeriod =
        period === "all"
          ? true
          : r.period === period || r.period === period.toUpperCase();
      const matchLocation = location === "all" ? true : r.location === location;
      const matchTab =
        tab === "all"
          ? true
          : tab === "supervisors"
            ? r.role === "Supervisor"
            : r.role === "Medical Rep";
      const matchQuery =
        query.trim().length === 0
          ? true
          : `${r.name} ${r.location || ""} ${r.role}`
              .toLowerCase()
              .includes(query.toLowerCase());
      return matchPeriod && matchLocation && matchTab && matchQuery;
    });
  }, [reviews, period, location, tab, query]);

  return (
    <>
      <StatCards
        stats={appraisalStatsConfig}
        data={{
          avgScore: `${stats.avgScore}%`,
          excellentCount: stats.excellentCount,
          improvingCount: stats.improvingCount,
          totalReviews: stats.totalReviews,
        }}
      />
      <div className="border-secondary-light flex flex-col gap-8 rounded-[14px] border-[0.8px] bg-white p-6">
        <AppraisalFilters
          period={period}
          location={location}
          tab={tab}
          query={query}
          onChangePeriod={setPeriod}
          onChangeLocation={setLocation}
          onChangeTab={setTab}
          onChangeQuery={setQuery}
        />
        <ReviewsList reviews={visible} />
        <div className="mt-4">
          <Pagination page={page} limit={limit} totalCount={totalCount} />
        </div>
      </div>
    </>
  );
}
