"use client";

import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import VisitCard from "../shared/VisitCard";
import { Calendar } from "lucide-react";
import { Visit } from "@/features/visits/lib/types/ui";

export default function DayVisitsPanel({
  date,
  visits,
  reportBasePath,
}: {
  date: Date;
  visits: Visit[];
  reportBasePath?: string;
}) {
  return (
    <Card className="overflow-hidden border-none bg-transparent p-0 shadow-none">
      <div className="from-system-gradient-from to-system-gradient-to flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-linear-to-b px-5 py-5 text-white">
        <div className="flex min-w-0 items-center gap-1 text-lg/6 font-semibold text-white">
          {" "}
          <Calendar size={20} className="shrink-0" /> {format(date, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="text-sm/5 font-semibold">{visits.length} visits</div>
      </div>

      <div className="space-y-4">
        {visits.length === 0 ? (
          <div className="text-secondary-dark border-secondary-light flex h-[390px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-[0.8px] bg-white">
            <Calendar className="text-secondary-light" size={48} />
            <p className="text-base/6 font-normal">
              No visits scheduled for this date
            </p>
          </div>
        ) : (
          visits.map((v) => (
            <VisitCard key={v.id} visit={v} reportBasePath={reportBasePath} />
          ))
        )}
      </div>
    </Card>
  );
}
