import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { FilterBarSkeleton } from "./FilterBarSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      <PageHeaderSkeleton hasAction />
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        <FilterBarSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 rounded-[14px] border border-[#E5E8EF] bg-white p-4"
            >
              <Skeleton className="h-40 w-full rounded-[10px] bg-slate-100" />
              <Skeleton className="h-5 w-3/4 bg-slate-200" />
              <Skeleton className="h-4 w-1/2 bg-slate-100" />
              <div className="flex justify-between items-center pt-2 border-t border-[#EEF1F6]">
                <Skeleton className="h-5 w-16 bg-slate-200" />
                <Skeleton className="h-7 w-20 rounded-[8px] bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
