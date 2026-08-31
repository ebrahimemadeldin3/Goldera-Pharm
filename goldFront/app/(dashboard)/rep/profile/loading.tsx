import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="flex flex-col gap-6">
      {/* Profile Hero Skeleton */}
      <div className="rounded-[14px] border border-[#E5E8EF] bg-white p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="size-28 rounded-full shrink-0" />
          <div className="space-y-3 w-full text-center sm:text-left">
            <Skeleton className="h-5 w-32 rounded-full mx-auto sm:mx-0" />
            <Skeleton className="h-9 w-64 rounded-lg mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-80 rounded-md mx-auto sm:mx-0" />
          </div>
        </div>
      </div>

      {/* Profile Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-[14px]" />
        <Skeleton className="h-64 rounded-[14px]" />
      </div>
    </PageContainer>
  );
}
