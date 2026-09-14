import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorsSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="bg-gp-gold-100 h-3 w-32" />
          <Skeleton className="h-8 w-64 bg-slate-200" />
          <Skeleton className="h-4 w-full max-w-xl bg-slate-100" />
        </div>
        <Skeleton className="h-11 w-36 rounded-[12px] bg-slate-200" />
      </div>

      <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[14px] border p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-[10px] bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-24 bg-slate-100" />
                <Skeleton className="h-6 w-16 bg-slate-200" />
                <Skeleton className="h-3 w-32 bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
        <header className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 bg-slate-200" />
              <Skeleton className="h-4 w-36 bg-slate-100" />
            </div>
            <Skeleton className="h-11 w-full rounded-[12px] bg-slate-100 lg:w-[380px]" />
          </div>

          <div className="mt-4 hidden md:block">
            <Skeleton className="mb-2 h-3 w-20 bg-slate-100" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-gp-border-subtle bg-gp-surface-subtle p-2">
                <Skeleton className="h-11 w-[230px] rounded-[12px] bg-slate-100" />
                <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                <Skeleton className="h-11 w-[205px] rounded-[12px] bg-slate-100" />
                <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                <Skeleton className="h-11 w-[170px] rounded-[12px] bg-slate-100" />
              </div>
              <Skeleton className="h-11 w-[190px] rounded-[12px] bg-slate-100" />
              <Skeleton className="h-11 w-[230px] rounded-[12px] bg-slate-100" />
              <Skeleton className="h-11 w-[170px] rounded-[12px] bg-slate-100" />
            </div>
          </div>
        </header>

        <div className="bg-gp-surface-subtle/40 grid grid-cols-1 gap-4 p-4 sm:p-5 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="border-gp-border-default bg-gp-surface-card shadow-gp-card min-h-[286px] rounded-[16px] border p-4"
            >
              <div className="flex items-start gap-3.5">
                <Skeleton className="size-12 shrink-0 rounded-[12px] bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-48 bg-slate-200" />
                  <Skeleton className="h-4 w-32 bg-slate-100" />
                  <div className="flex gap-1.5">
                    <Skeleton className="h-6 w-24 rounded-full bg-slate-100" />
                    <Skeleton className="h-6 w-28 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <Skeleton
                    key={cellIndex}
                    className="h-[66px] rounded-[10px] bg-slate-100"
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-gp-border-subtle pt-3">
                <Skeleton className="h-10 w-32 rounded-[10px] bg-slate-100" />
                <Skeleton className="h-10 w-28 rounded-[10px] bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
