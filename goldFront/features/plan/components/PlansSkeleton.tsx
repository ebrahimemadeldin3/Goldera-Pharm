import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function PlansSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 bg-slate-200" />
          <Skeleton className="h-4 w-80 bg-slate-100" />
        </div>
      </div>

      {/* Plans Section Container Skeleton */}
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        {/* Tab Strip Skeleton */}
        <div className="flex flex-col gap-4 border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-36 bg-slate-200" />
          <div className="flex gap-2 bg-[#F6F8FB] p-1 rounded-[12px] border border-[#E5E8EF]">
            <Skeleton className="h-8 w-24 rounded-[9px] bg-slate-200" />
            <Skeleton className="h-8 w-20 rounded-[9px] bg-slate-100" />
            <Skeleton className="h-8 w-24 rounded-[9px] bg-slate-100" />
          </div>
        </div>

        {/* Plan Cards List Skeleton */}
        <div className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Skeleton className="size-10 rounded-[10px] bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-5 w-48 bg-slate-200" />
                      <Skeleton className="h-5 w-20 rounded-md bg-slate-100" />
                      <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                    </div>
                    <Skeleton className="h-4 w-60 bg-slate-100" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24 rounded-[10px] bg-slate-200" />
                  <Skeleton className="h-9 w-20 rounded-[10px] bg-slate-100" />
                </div>
              </div>

              <div className="h-10 rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] px-3.5 flex items-center gap-6">
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-4 w-32 bg-slate-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Skeleton className="h-12 rounded-md bg-slate-50" />
                <Skeleton className="h-12 rounded-md bg-slate-50" />
                <Skeleton className="h-12 rounded-md bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
