"use client";

import type { StatCardConfig, StatCardData } from "./stat-card-types";

type StatCardsProps = {
  stats: StatCardConfig[];
  data: StatCardData;
};

export function StatCards({ stats, data }: StatCardsProps) {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="flex w-full min-w-0 items-center justify-between rounded-lg border-[.8px] border-[#E6EEF8] bg-white p-6"
          >
            <div className="flex min-w-0 flex-1 flex-col items-start justify-between">
              <h3 className="text-secondary-dark max-w-full truncate text-base/6 font-normal">
                {stat.label}
              </h3>
              <p className="text-lg/6 font-medium text-black">
                {data[stat.dataKey]}
              </p>
            </div>
            <div
              className={`${stat.bgColor} flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white`}
            >
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </section>
  );
}
