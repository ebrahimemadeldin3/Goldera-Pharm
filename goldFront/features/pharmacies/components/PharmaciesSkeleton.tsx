import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function PharmaciesSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-slate-200" />
          <Skeleton className="h-4 w-80 bg-slate-100" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-28 rounded-full bg-slate-100" />
            <Skeleton className="h-6 w-32 rounded-full bg-slate-100" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-[10px] bg-slate-200" />
      </div>

      {/* Table Section Container Skeleton */}
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EEF1F6] bg-[#FBFCFE]/60 px-5 py-4">
          <Skeleton className="h-6 w-40 bg-slate-200" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-44 rounded-[10px] bg-slate-100" />
            <Skeleton className="h-10 w-60 rounded-[10px] bg-slate-100" />
          </div>
        </div>

        {/* Table Skeletons */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E8EF]">
              <tr>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="py-3 px-4 text-left">
                    <Skeleton className="h-4 w-20 bg-slate-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F6] bg-white">
              {Array.from({ length: 10 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-6 bg-slate-100" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 bg-slate-200" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-100" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-100" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-100" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-100" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-100" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
