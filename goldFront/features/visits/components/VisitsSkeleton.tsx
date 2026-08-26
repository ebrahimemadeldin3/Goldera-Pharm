import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function VisitsSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 bg-slate-200" />
          <Skeleton className="h-4 w-96 bg-slate-100" />
        </div>
        <Skeleton className="h-11 w-32 rounded-[11px] bg-slate-200" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex min-h-[112px] items-start justify-between gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5"
          >
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 bg-slate-200" />
              <Skeleton className="h-7 w-16 bg-slate-300" />
              <Skeleton className="h-3.5 w-32 bg-slate-100" />
            </div>
            <Skeleton className="size-10 rounded-[10px] bg-slate-100 shrink-0" />
          </div>
        ))}
      </div>

      {/* Workspace Calendar + List Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4">
          <Skeleton className="h-6 w-40 bg-slate-200" />
          <Skeleton className="h-64 w-full rounded-xl bg-slate-100" />
        </div>

        <div className="lg:col-span-8 rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#EEF1F6]">
            <Skeleton className="h-6 w-48 bg-slate-200" />
            <Skeleton className="h-9 w-32 rounded-[10px] bg-slate-100" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-[14px] border border-[#E5E8EF] bg-white p-4 space-y-2">
                <Skeleton className="h-5 w-40 bg-slate-200" />
                <Skeleton className="h-4 w-60 bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
