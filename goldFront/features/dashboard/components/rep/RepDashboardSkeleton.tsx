import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function RepDashboardSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 bg-slate-200" />
          <Skeleton className="h-4 w-96 max-w-full bg-slate-100" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[10px] bg-slate-200" />
      </div>

      {/* 3 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 bg-slate-200" />
              <Skeleton className="size-9 rounded-[10px] bg-slate-100" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-20 bg-slate-300" />
              <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Next Visit Banner Skeleton */}
      <div className="h-20 w-full rounded-[14px] border border-[#E5E8EF] bg-slate-50/60 p-4" />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Agenda Column */}
        <div className="lg:col-span-8 space-y-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#EEF1F6]">
            <Skeleton className="h-6 w-44 bg-slate-200" />
            <Skeleton className="h-8 w-28 rounded-[8px] bg-slate-100" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[14px] border border-[#E5E8EF] bg-white p-4 space-y-2">
                <Skeleton className="h-5 w-40 bg-slate-200" />
                <Skeleton className="h-4 w-60 bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-48 rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-3">
            <Skeleton className="h-6 w-32 bg-slate-200" />
            <Skeleton className="h-10 w-full rounded-[10px] bg-slate-100" />
            <Skeleton className="h-9 w-full rounded-[10px] bg-slate-100" />
          </div>
          <div className="h-48 rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-3">
            <Skeleton className="h-6 w-40 bg-slate-200" />
            <Skeleton className="h-16 w-full rounded-[12px] bg-slate-100" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
