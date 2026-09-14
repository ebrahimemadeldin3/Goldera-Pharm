import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerHRLoading() {
  return (
    <PageContainer
      className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5"
      aria-label="Loading human resources"
      aria-busy="true"
    >
      <header>
        <div className="flex items-center gap-2">
          <Skeleton className="h-px w-6" />
          <Skeleton className="h-3 w-20 rounded-[4px]" />
        </div>
        <Skeleton className="mt-2 h-9 w-56 rounded-[10px]" />
        <Skeleton className="mt-2 h-5 w-full max-w-lg rounded-[8px]" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card relative overflow-hidden rounded-[14px] border p-5"
          >
            <div className="absolute top-0 left-0 h-full w-[3px] bg-gp-border-control" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-28 rounded-[4px]" />
                <Skeleton className="mt-3 h-7 w-16 rounded-[7px]" />
                <Skeleton className="mt-3 h-3 w-32 rounded-[4px]" />
              </div>
              <Skeleton className="size-10 rounded-[10px]" />
            </div>
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card overflow-hidden rounded-[16px] border">
        <div className="border-gp-border-subtle border-b p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Skeleton className="h-6 w-28 rounded-[7px]" />
              <Skeleton className="mt-2 h-4 w-52 rounded-[6px]" />
            </div>
            <Skeleton className="h-11 w-full rounded-[12px] lg:w-80" />
          </div>
          <Skeleton className="mt-4 h-10 w-full max-w-md rounded-[10px]" />
        </div>
        <div className="space-y-3.5 p-4 sm:p-5">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="size-14 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-40 rounded-[6px]" />
                    <Skeleton className="h-6 w-36 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-3 h-4 w-64 rounded-[5px]" />
                  <div className="mt-3 grid grid-cols-2 gap-3 lg:flex lg:items-center lg:gap-12">
                    <Skeleton className="h-4 w-36 rounded-[5px]" />
                    <Skeleton className="h-4 w-36 rounded-[5px]" />
                    <Skeleton className="h-4 w-36 rounded-[5px]" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t border-transparent pt-0">
                <Skeleton className="h-10 w-32 rounded-[10px]" />
                <Skeleton className="size-10 rounded-[10px]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}