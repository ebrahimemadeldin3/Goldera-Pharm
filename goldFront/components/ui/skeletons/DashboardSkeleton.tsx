import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { TableSkeleton } from "./TableSkeleton";

export function DashboardSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      <PageHeaderSkeleton hasAction={false} />
      <StatCardSkeleton count={3} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ChartSkeleton height="h-80" />
        </div>
        <div className="lg:col-span-4 rounded-[16px] border border-[#E5E8EF] bg-white p-5 space-y-4">
          <div className="h-6 w-36 bg-slate-200 rounded" />
          <TableSkeleton columns={2} rows={5} />
        </div>
      </div>
    </PageContainer>
  );
}
