import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton({
  hasAction = true,
  hasMetadata = true,
}: {
  hasAction?: boolean;
  hasMetadata?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60 bg-slate-200" />
        <Skeleton className="h-4 w-96 max-w-full bg-slate-100" />
        {hasMetadata && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
            <Skeleton className="h-6 w-32 rounded-full bg-slate-100" />
          </div>
        )}
      </div>
      {hasAction && (
        <Skeleton className="h-10 w-36 rounded-[10px] bg-slate-200 shrink-0" />
      )}
    </div>
  );
}
