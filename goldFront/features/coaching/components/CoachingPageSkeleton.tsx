import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function CoachingPageSkeleton() {
  return (
    <PageContainer
      className="bg-gp-surface-page flex flex-col gap-6"
      aria-label="Loading coaching"
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
            <div className="bg-gp-border-control absolute top-0 left-0 h-full w-[3px]" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-28 rounded-[4px]" />
                <Skeleton className="mt-3 h-7 w-16 rounded-[7px]" />
              </div>
              <Skeleton className="size-10 rounded-[10px]" />
            </div>
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card overflow-hidden rounded-[16px] border">
        <div className="border-gp-border-subtle flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <Skeleton className="h-6 w-44 rounded-[7px]" />
            <Skeleton className="mt-2 h-4 w-64 rounded-[6px]" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="border-gp-border-subtle flex items-center gap-1 border-b px-3 py-2.5 sm:px-4">
          <Skeleton className="h-12 w-24 rounded-lg" />
          <Skeleton className="h-12 w-28 rounded-lg" />
          <Skeleton className="h-12 w-20 rounded-lg" />
        </div>
        <div className="p-4 sm:p-5">
          <div className="space-y-3.5">
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
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mt-3 h-4 w-72 rounded-[5px]" />
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <Skeleton className="h-4 w-32 rounded-[5px]" />
                      <Skeleton className="h-4 w-32 rounded-[5px]" />
                    </div>
                  </div>
                  <Skeleton className="size-20 rounded-[10px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
