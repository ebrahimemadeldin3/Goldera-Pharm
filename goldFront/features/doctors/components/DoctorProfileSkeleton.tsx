import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function DoctorProfileSkeleton() {
  return (
    <PageContainer className="flex flex-col gap-5 min-h-[calc(100vh-80px)]">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-[10px] bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-slate-200" />
            <Skeleton className="h-4 w-36 bg-slate-100" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-[10px] bg-slate-200 shrink-0" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Sidebar Skeletons */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 space-y-3">
            <Skeleton className="h-4 w-32 bg-slate-200" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-40 bg-slate-100" />
              <Skeleton className="h-4 w-44 bg-slate-100" />
              <Skeleton className="h-4 w-36 bg-slate-100" />
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-4.5 space-y-3">
            <Skeleton className="h-4 w-36 bg-slate-200" />
            <Skeleton className="h-12 w-full rounded-[10px] bg-slate-100" />
          </div>
        </div>

        {/* Recent Visits Main Skeleton */}
        <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EEF1F6] pb-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 bg-slate-200" />
              <Skeleton className="h-3.5 w-64 bg-slate-100" />
            </div>
            <Skeleton className="h-9 w-32 rounded-[9px] bg-slate-100" />
          </div>

          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-[10px] border border-[#EEF1F6] bg-[#FBFCFE] p-3.5"
              >
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 bg-slate-200" />
                  <Skeleton className="h-3.5 w-48 bg-slate-100" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
