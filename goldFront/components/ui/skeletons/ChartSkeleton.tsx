import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = "h-72" }: { height?: string }) {
  return (
    <div className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-44 bg-slate-200" />
        <Skeleton className="h-8 w-28 rounded-[8px] bg-slate-100" />
      </div>
      <Skeleton className={`w-full rounded-[12px] bg-slate-100 ${height}`} />
    </div>
  );
}
