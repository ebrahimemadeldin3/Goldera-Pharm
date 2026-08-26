import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { FilterBarSkeleton } from "./FilterBarSkeleton";

export function SalesSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      <PageHeaderSkeleton hasAction />
      <StatCardSkeleton count={3} />
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        <FilterBarSkeleton />
        <TableSkeleton columns={7} rows={8} />
      </div>
    </PageContainer>
  );
}
