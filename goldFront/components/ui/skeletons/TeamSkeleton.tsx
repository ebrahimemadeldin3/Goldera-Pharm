import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { FilterBarSkeleton } from "./FilterBarSkeleton";
import { TableSkeleton } from "./TableSkeleton";

export function TeamSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      <PageHeaderSkeleton hasAction />
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white overflow-hidden">
        <FilterBarSkeleton />
        <TableSkeleton columns={6} rows={7} />
      </div>
    </PageContainer>
  );
}
