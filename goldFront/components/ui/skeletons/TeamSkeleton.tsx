import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

type TeamSkeletonProps = {
  showOverview?: boolean;
  showAction?: boolean;
  showTabs?: boolean;
};

export function TeamSkeleton({
  showOverview = true,
  showAction = true,
  showTabs = true,
}: TeamSkeletonProps) {
  return (
    <PageContainer className="bg-gp-surface-page min-h-[calc(100vh-80px)] space-y-5 overflow-x-hidden">
      <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="bg-gp-gold-300 h-px w-8 rounded-full" />
            <Skeleton className="h-3 w-24 bg-slate-200" />
          </div>
          <Skeleton className="h-8 w-60 max-w-full bg-slate-200" />
          <Skeleton className="h-4 w-96 max-w-full bg-slate-100" />
        </div>
        {showAction && (
          <Skeleton className="h-11 w-full shrink-0 rounded-[10px] bg-slate-200 sm:w-40" />
        )}
      </header>

      {showOverview && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-gp-border-default shadow-gp-card flex min-h-[124px] flex-col rounded-[14px] border bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="size-11 rounded-[12px] bg-slate-100" />
                <Skeleton className="bg-gp-gold-100 mt-1 h-1.5 w-12 rounded-full" />
              </div>
              <div className="mt-4 min-w-0 space-y-2">
                <Skeleton className="h-3 w-28 bg-slate-200" />
                <Skeleton className="h-7 w-16 bg-slate-300" />
                <Skeleton className="h-3 w-36 bg-slate-100" />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="border-gp-border-default shadow-gp-card overflow-hidden rounded-[16px] border bg-white">
        <div className="border-gp-border-subtle bg-gp-surface-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-[10px] bg-slate-100" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-slate-200" />
                <Skeleton className="h-5 w-36 bg-slate-200" />
                <Skeleton className="h-4 w-64 max-w-full bg-slate-100" />
                <Skeleton className="h-6 w-56 max-w-full rounded-full bg-white" />
              </div>
            </div>
            <div
              className={
                showTabs
                  ? "grid w-full gap-3 md:grid-cols-[minmax(0,360px)_minmax(240px,340px)] xl:w-auto"
                  : "w-full xl:w-[340px]"
              }
            >
              {showTabs && (
                <Skeleton className="h-11 rounded-[13px] bg-slate-100" />
              )}
              <Skeleton className="h-11 rounded-[12px] bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="border-gp-border-default shadow-gp-card relative rounded-[14px] border bg-white p-4"
            >
              <span className="bg-gp-gold-100 absolute inset-y-0 left-0 w-[3px] rounded-r-full" />
              <div className="flex items-start gap-4">
                <Skeleton className="size-[60px] shrink-0 rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-slate-200" />
                  <Skeleton className="h-6 w-36 rounded-full bg-slate-100" />
                  <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="border-gp-border-subtle mt-4 space-y-3 border-t pt-3">
                <div className="flex items-start gap-3 px-1 py-1">
                  <Skeleton className="size-4 rounded-full bg-slate-100" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-14 bg-slate-100" />
                    <Skeleton className="h-4 w-3/4 bg-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="flex items-start gap-3 px-1 py-1"
                    >
                      <Skeleton className="size-4 rounded-full bg-slate-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3 w-12 bg-slate-100" />
                        <Skeleton className="h-4 w-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Skeleton className="mt-3 h-10 rounded-[9px] bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
