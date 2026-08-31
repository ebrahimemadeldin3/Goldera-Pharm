import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[14px] border border-[#E5E8EF] bg-white p-4 space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* List Container Skeleton */}
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-[9px]" />
          <Skeleton className="h-8 w-32 rounded-[9px]" />
          <Skeleton className="h-8 w-24 rounded-[9px]" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-[14px]" />
        ))}
      </div>
    </PageContainer>
  );
}
