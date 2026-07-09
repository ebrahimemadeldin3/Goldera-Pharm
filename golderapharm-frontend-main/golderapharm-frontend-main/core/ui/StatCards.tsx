"use client";

import type { StatCardConfig, StatCardData } from "./stat-card-types";

type StatCardsProps = {
  stats: StatCardConfig[];
  data: StatCardData;
};

export function StatCards({ stats, data }: StatCardsProps) {
  return (
    <section className="mt-6 grid grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="flex w-[254px] items-center justify-between rounded-lg border-[.8px] border-[#E6EEF8] bg-white p-6"
          >
            <div className="flex flex-col items-start justify-between">
              <h3 className="text-secondary-dark text-base/6 font-normal text-nowrap">
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
