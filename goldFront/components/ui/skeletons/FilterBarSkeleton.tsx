import { Skeleton } from "@/components/ui/skeleton";

export function FilterBarSkeleton({
  hasSearch = true,
  hasSelect = true,
}: {
  hasSearch?: boolean;
  hasSelect?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4">
      <Skeleton className="h-6 w-36 bg-slate-200" />
      <div className="flex flex-wrap items-center gap-3">
        {hasSelect && <Skeleton className="h-10 w-44 rounded-[10px] bg-slate-100" />}
        {hasSearch && <Skeleton className="h-10 w-60 rounded-[10px] bg-slate-100" />}
      </div>
    </div>
  );
}
