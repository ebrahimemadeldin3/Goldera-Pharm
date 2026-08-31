import Link from "next/link";
import { CalendarPlus, TrendingUp, FileText, PackageSearch } from "lucide-react";

export function RepQuickActions() {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#E5E8EF] bg-white p-5">
      <h2 className="text-base font-semibold text-[#182033] border-b border-[#EEF1F6] pb-3">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-2 pt-1">
        {/* Primary Rep Action */}
        <Link
          href="/rep/visits/add"
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#168557] px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all hover:bg-[#107349]"
        >
          <CalendarPlus size={16} />
          <span>Schedule New Visit</span>
        </Link>

        {/* Secondary Outline Actions */}
        <Link
          href="/rep/forecast/new"
          className="flex h-9 w-full cursor-pointer items-center justify-start gap-2.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3.5 text-xs font-semibold text-[#182033] hover:bg-[#F9FAFB] transition-colors"
        >
          <TrendingUp size={15} className="text-[#667085]" />
          <span>Submit Forecast</span>
        </Link>

        <Link
          href="/rep/requests"
          className="flex h-9 w-full cursor-pointer items-center justify-start gap-2.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3.5 text-xs font-semibold text-[#182033] hover:bg-[#F9FAFB] transition-colors"
        >
          <FileText size={15} className="text-[#667085]" />
          <span>Submit Leave / Expense Request</span>
        </Link>

        <Link
          href="/rep/products"
          className="flex h-9 w-full cursor-pointer items-center justify-start gap-2.5 rounded-[10px] border border-[#E5E8EF] bg-white px-3.5 text-xs font-semibold text-[#182033] hover:bg-[#F9FAFB] transition-colors"
        >
          <PackageSearch size={15} className="text-[#667085]" />
          <span>View Product Catalog & Samples</span>
        </Link>
      </div>
    </div>
  );
}
