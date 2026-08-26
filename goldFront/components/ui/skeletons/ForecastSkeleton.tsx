import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { TableSkeleton } from "./TableSkeleton";

export function ForecastSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      <PageHeaderSkeleton hasAction />
      <StatCardSkeleton count={3} />
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#EEF1F6]">
          <div className="h-6 w-44 bg-slate-200 rounded" />
          <div className="h-9 w-32 bg-slate-100 rounded-[10px]" />
        </div>
        <TableSkeleton columns={6} rows={6} />
      </div>
    </PageContainer>
  );
}
