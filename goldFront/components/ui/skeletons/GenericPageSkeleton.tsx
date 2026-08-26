import { PageContainer } from "@/components/layout/page-container";
import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function GenericPageSkeleton({
  title = true,
  hasAction = false,
}: {
  title?: boolean;
  hasAction?: boolean;
}) {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)] space-y-6">
      {title && <PageHeaderSkeleton hasAction={hasAction} />}
      <div className="rounded-[16px] border border-[#E5E8EF] bg-white p-6 space-y-5">
        <Skeleton className="h-6 w-48 bg-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-[12px] bg-slate-100" />
          <Skeleton className="h-24 rounded-[12px] bg-slate-100" />
          <Skeleton className="h-24 rounded-[12px] bg-slate-100" />
          <Skeleton className="h-24 rounded-[12px] bg-slate-100" />
        </div>
      </div>
    </PageContainer>
  );
}
