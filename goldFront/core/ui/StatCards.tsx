"use client";

import { cn } from "@/lib/utils";
import type { StatCardConfig, StatCardData } from "./stat-card-types";

type StatCardsProps = {
  stats: StatCardConfig[];
  data: StatCardData;
  className?: string;
  cardClassName?: string;
};

export function StatCards({ stats, data, className, cardClassName }: StatCardsProps) {
  return (
    <section className={cn("mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const hasCustomTextColor = stat.bgColor?.includes("text-");

        return (
          <div
            key={stat.id}
            className={cn(
              "flex w-full min-w-0 items-center justify-between rounded-[12px] border border-[#E5E8EF] bg-white p-5 shadow-none",
              cardClassName
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-1">
              <h3 className="max-w-full truncate text-xs font-semibold text-[#667085]">
                {stat.label}
              </h3>
              <p className="text-xl font-bold text-[#182033]">
                {data[stat.dataKey]}
              </p>
            </div>
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-[10px]",
                stat.bgColor,
                !hasCustomTextColor && "text-white"
              )}
            >
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

