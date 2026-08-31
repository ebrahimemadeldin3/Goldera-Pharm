import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[10px] bg-[#FBFCFE] border border-[#EEF1F6]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-[14px] lg:col-span-2" />
        <Skeleton className="h-64 rounded-[14px]" />
      </div>
    </PageContainer>
  );
}
