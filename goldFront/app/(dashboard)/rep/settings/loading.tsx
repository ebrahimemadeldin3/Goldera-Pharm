import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Settings Sections Skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-[14px] border border-[#E5E8EF] bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-[10px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-[10px]" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
