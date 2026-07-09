"use client";

import { eachDayOfInterval, isSameDay } from "date-fns";
import { Card } from "@/components/ui/card";
import VisitCard from "@/features/visits/components/shared/VisitCard";
import { Visit } from "@/features/visits/lib/types/ui";
import {
  formatDateOnly,
  formatSaudiDateDisplay,
  formatSaudiWeekday,
} from "@/lib/utils";

export default function WeekVisitsPanel({
  range,
  visits,
  reportBasePath,
}: {
  range: { start: Date; end: Date };
  visits: Visit[];
  reportBasePath?: string;
}) {
  const days = eachDayOfInterval(range);

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayVisits = visits.filter((v) => isSameDay(v.date, day));
        return (
          <Card
            key={formatDateOnly(day)}
            className="overflow-hidden p-0 shadow-none"
          >
            <div className="bg-system-primary flex items-center justify-between rounded-t-[10px] p-4 text-white">
              <p className="text-base/6 font-semibold">
                {formatSaudiWeekday(day)}, {formatSaudiDateDisplay(day)}
              </p>
              <span className="text-sm/[21px] font-normal">
                {dayVisits.length} visits
              </span>
            </div>
            {dayVisits.length === 0 ? (
              <div className="text-secondary-dark pb-5 text-center text-sm/[21px] font-normal">
                No visits scheduled
              </div>
            ) : (
              <div className="space-y-4 p-4">
                {dayVisits.map((v) => (
                  <VisitCard
                    key={v.id}
                    visit={v}
                    reportBasePath={reportBasePath}
                  />
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
