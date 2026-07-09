"use client";

import { useMemo, useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
  format,
} from "date-fns";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DayVisitsPanel from "@/features/visits/components/panels/DayVisitsPanel";
import WeekVisitsPanel from "@/features/visits/components/panels/WeekVisitsPanel";
 import { Visit } from "@/features/visits/lib/types/ui";

type VisitsPlannerProps = {
  visits: Visit[];
  reportBasePath?: string;
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function VisitsPlanner({
  visits,
  reportBasePath,
}: VisitsPlannerProps) {
  const [mode, setMode] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState<Date>(new Date());

  const dayVisits = useMemo<Visit[]>(() => {
    return visits
      .filter((v) => isSameDay(v.date, selected))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selected, visits]);

  const weekRange = useMemo(() => {
    const start = startOfWeek(selected, { weekStartsOn: 6 }); // Saturday start (adjust if needed)
    const end = endOfWeek(selected, { weekStartsOn: 6 });
    return { start, end };
  }, [selected]);

  const weekVisits = useMemo<Visit[]>(() => {
    return visits
      .filter((v) =>
        isWithinInterval(v.date, {
          start: weekRange.start,
          end: weekRange.end,
        }),
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [weekRange, visits]);

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4">
      {/* Left: calendar + toggle */}
      <div className="flex flex-col gap-6">



        <div className="flex w-full items-center gap-4 text-sm/5 font-medium *:flex-1">
          


          <Button
            size="sm"
            variant={mode === "day" ? "default" : "outline"}
            className={`h-9 cursor-pointer rounded-[8px] ${mode === "day" ? "bg-system-primary hover:bg-system-primary text-white" : "border-secondary-light border bg-white text-gray-700 hover:bg-gray-50"}`}
            onClick={() => setMode("day")}
          >
            Day
          </Button>
          <Button
            size="sm"
            variant={mode === "week" ? "default" : "outline"}
            className={`h-9 cursor-pointer rounded-[8px] ${mode === "week" ? "bg-system-primary hover:bg-system-primary text-white" : "border-secondary-light border bg-white text-gray-700 hover:bg-gray-50"}`}
            onClick={() => setMode("week")}
          >
            Week
          </Button>
        </div>

        


        <Card className="relative h-fit p-4 shadow-none">
          <p className="text-start text-lg/[27px] font-semibold">
            {mode === "day"
              ? format(selected, "d MMMM yyyy")
              : `${format(weekRange.start, "MMM d")} - ${format(
                  weekRange.end,
                  "MMM d, yyyy",
                )}`}
          </p>
          <ShadCalendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            className="-mt-2 rounded-md *:ring-0 *:outline-none"
            classNames={{
              today: "bg-system-primary-stroke rounded-md",
              selected:
                "*:bg-system-primary! rounded-md *:ring-0! *:outline-none!",
              day: "*:cursor-pointer *:hover:bg-system-primary-hover/50 *:rounded-md",
            }}
          />
          <div className="border-secondary-light w-full self-start border-t-[.8px] pt-4">
            <p className="mb-2 text-sm/5 font-semibold text-black">
              Visit Status
            </p>
            <ul className="text-secondary-dark space-y-3 text-sm/5 font-normal">
              <li className="flex items-center gap-2">
                <span className="bg-dashboard-green h-2 w-2 rounded-full" />{" "}
                Completed
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-dashboard-blue h-2 w-2 rounded-full" /> In
                Progress
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-dashboard-orange h-2 w-2 rounded-full" />{" "}
                Scheduled
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-dashboard-red h-2 w-2 rounded-full" />{" "}
                Cancelled
              </li>
            </ul>
          </div>
        </Card>
      </div>


      {/* Right: data view */}
      <div className="space-y-4">
        {mode === "day" ? (
          <DayVisitsPanel
            date={selected}
            visits={dayVisits}
            reportBasePath={reportBasePath}
          />
        ) : (
          <WeekVisitsPanel
            range={weekRange}
            visits={weekVisits}
            reportBasePath={reportBasePath}
          />
        )}

      </div>        

    </div>
  );
}
