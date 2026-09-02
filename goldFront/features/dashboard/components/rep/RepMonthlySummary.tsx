import Link from "next/link";
import { ArrowUpRight, DollarSign } from "lucide-react";

type RepMonthlySummaryProps = {
  targetAchievement?: string;
  coverage?: string;
  totalSales?: number;
};

export function RepMonthlySummary({
  targetAchievement = "0%",
  coverage = "0%",
  totalSales = 0,
}: RepMonthlySummaryProps) {
  const parsePercent = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : Math.min(Math.max(num, 0), 100);
  };

  const targetPercent = parsePercent(targetAchievement);
  const coveragePercent = parsePercent(coverage);

  const formattedSales = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalSales);

  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5">
      <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3">
        <h2 className="text-base font-semibold text-[#182033]">
          Monthly Performance
        </h2>
        <Link
          href="/rep/sales"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#168557] hover:underline"
        >
          <span>Sales</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Total Sales Metric */}
        <div className="rounded-[12px] bg-[#F6F8FB] border border-[#E5E8EF] p-3.5 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085] flex items-center gap-1.5">
            <DollarSign size={13} className="text-[#168557]" />
            Personal Sales (MTD)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-[#182033]">
              SAR {formattedSales}
            </span>
          </div>
        </div>

        {/* Target Achievement Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#344054]">Target Progress</span>
            <span className="font-semibold text-[#168557]">{targetAchievement}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E9F8F1]">
            <div
              className="h-full rounded-full bg-[#168557]"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#344054]">Field Coverage</span>
            <span className="font-semibold text-[#3972D5]">{coverage}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDF4FF]">
            <div
              className="h-full rounded-full bg-[#3972D5]"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
