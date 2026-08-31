import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

type RepDashboardHeaderProps = {
  userName: string;
  location?: string | null;
};

export function RepDashboardHeader({ userName, location }: RepDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-[#182033] sm:text-3xl">
            Welcome back, Dr/ {userName}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <p className="text-sm font-medium text-[#667085]">
            Here&apos;s your personal field workspace for today.
          </p>
          {location && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gp-rep-primary-border bg-gp-rep-primary-soft px-2.5 py-0.5 text-xs font-semibold text-gp-rep-primary">
              <MapPin size={12} className="stroke-[2.5]" />
              {location}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/rep/visits/add"
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-gp-rep-primary px-4 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(22,133,87,0.22)] transition-all duration-170 hover:-translate-y-px hover:bg-gp-rep-primary-hover hover:shadow-[0_8px_20px_rgba(22,133,87,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-rep-primary/30"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>Add Visit</span>
        </Link>
      </div>
    </div>
  );
}
