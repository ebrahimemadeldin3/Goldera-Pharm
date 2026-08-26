import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex min-h-[112px] items-start justify-between gap-4 rounded-[14px] border border-[#E5E8EF] bg-white p-5 shadow-none"
        >
          <div className="space-y-2 min-w-0 flex-1">
            <Skeleton className="h-3.5 w-24 bg-slate-200" />
            <Skeleton className="h-7 w-20 bg-slate-300" />
            <Skeleton className="h-3.5 w-32 bg-slate-100" />
          </div>
          <Skeleton className="size-10 rounded-[10px] bg-slate-100 shrink-0" />
        </div>
      ))}
    </div>
  );
}
