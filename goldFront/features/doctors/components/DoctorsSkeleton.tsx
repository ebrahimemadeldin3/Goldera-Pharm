import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function DoctorsSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 bg-slate-200" />
          <Skeleton className="h-4 w-96 bg-slate-100" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
            <Skeleton className="h-6 w-32 rounded-full bg-slate-100" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-[10px] bg-slate-200" />
      </div>

      {/* Directory Section Container Skeleton */}
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4">
          <Skeleton className="h-6 w-36 bg-slate-200" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-44 rounded-[10px] bg-slate-100" />
            <Skeleton className="h-10 w-60 rounded-[10px] bg-slate-100" />
          </div>
        </div>

        {/* 2-Column Doctor Card Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-[10px] bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-slate-200" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-24 rounded-md bg-slate-100" />
                    <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                    <Skeleton className="h-5 w-20 rounded-md bg-slate-100" />
                  </div>
                </div>
              </div>

              <div className="h-16 rounded-[10px] bg-[#F9FAFB] border border-[#EEF1F6] p-2.5 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32 bg-slate-200" />
                  <Skeleton className="h-4 w-40 bg-slate-200" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 bg-slate-100" />
                  <Skeleton className="h-4 w-24 bg-slate-100" />
                </div>
              </div>

              <div className="h-9 rounded-[8px] bg-[#FBFCFE] border border-[#E5E8EF] px-3 flex items-center">
                <Skeleton className="h-4 w-44 bg-slate-200" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF1F6]">
                <Skeleton className="h-9 w-24 rounded-[10px] bg-slate-100" />
                <Skeleton className="h-9 w-32 rounded-[10px] bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
