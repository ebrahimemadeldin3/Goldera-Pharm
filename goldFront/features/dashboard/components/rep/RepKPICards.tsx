import { Target, MapPin, Clock } from "lucide-react";

type RepKPICardsProps = {
  targetAchievement?: string;
  coverage?: string;
  pendingRequestsCount?: number;
};

export function RepKPICards({
  targetAchievement = "0%",
  coverage = "0%",
  pendingRequestsCount = 0,
}: RepKPICardsProps) {
  // Parse numeric values safely for progress bars
  const parsePercent = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 100);
  };

  const targetPercent = parsePercent(targetAchievement);
  const coveragePercent = parsePercent(coverage);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* 1. Target Achievement Card */}
      <div className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none transition-shadow hover:border-[#D8DEE8]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
            Target Achievement
          </span>
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#E9F8F1] text-[#168557]">
            <Target size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-[#182033]">
              {targetAchievement}
            </span>
            <span className="text-xs font-medium text-[#667085]">Monthly Target</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E9F8F1]">
            <div
              className="h-full rounded-full bg-[#168557] transition-all duration-500"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Visits Coverage Card */}
      <div className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none transition-shadow hover:border-[#D8DEE8]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
            Visits Coverage
          </span>
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#EDF4FF] text-[#3972D5]">
            <MapPin size={18} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-[#182033]">
              {coverage}
            </span>
            <span className="text-xs font-medium text-[#667085]">Planned vs Visited</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDF4FF]">
            <div
              className="h-full rounded-full bg-[#3972D5] transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Pending Requests Card */}
      <div className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4 shadow-none transition-shadow hover:border-[#D8DEE8]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
            Pending Requests
          </span>
          <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#FFF8E5] text-[#8A6515]">
            <Clock size={18} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-[#182033]">
              {pendingRequestsCount}
            </span>
            <span className="text-xs font-medium text-[#8A6515]">
              {pendingRequestsCount > 0 ? "Action Required" : "All Clear"}
            </span>
          </div>
          <p className="text-xs text-[#667085]">Awaiting supervisor review</p>
        </div>
      </div>
    </div>
  );
}
