import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function PlansSkeleton() {
  return (
    <PageContainer className="space-y-5">
      <header className="space-y-2">
        <Skeleton className="h-4 w-[168px] bg-gp-gold-100" />
        <Skeleton className="h-8 w-60 bg-slate-200" />
        <Skeleton className="h-4 w-full max-w-md bg-slate-100" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card flex items-center gap-3 rounded-[14px] border p-4"
          >
            <Skeleton className="size-10 rounded-[10px] bg-slate-200" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24 bg-slate-100" />
              <Skeleton className="h-6 w-14 bg-slate-200" />
              <Skeleton className="h-3 w-28 bg-slate-100" />
            </div>
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card overflow-hidden rounded-[16px] border">
        <div className="border-gp-border-subtle border-b px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 bg-slate-200" />
              <Skeleton className="h-4 w-48 bg-slate-100" />
            </div>
            <div className="border-gp-border-control bg-gp-surface-control grid min-w-[520px] grid-cols-4 gap-1 rounded-[12px] border p-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 rounded-[9px] bg-slate-100"
                />
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-[10px] bg-slate-100 lg:max-w-md" />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Skeleton className="h-10 w-full rounded-[10px] bg-slate-100 sm:w-56" />
            <Skeleton className="h-10 w-full rounded-[10px] bg-slate-100 sm:w-[168px]" />
            <Skeleton className="h-10 w-full rounded-[10px] bg-slate-100 sm:w-[184px]" />
          </div>
        </div>

        <div className="bg-gp-surface-subtle/40 space-y-3.5 p-4 sm:p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex items-start gap-3.5">
                  <Skeleton className="size-11 rounded-[11px] bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-5 w-52 bg-slate-200" />
                      <Skeleton className="h-6 w-[72px] rounded-full bg-slate-100" />
                      <Skeleton className="h-6 w-[88px] rounded-full bg-slate-100" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-sm bg-slate-100" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-[10px] bg-slate-100" />
                  <Skeleton className="h-9 w-20 rounded-[10px] bg-slate-100" />
                  <Skeleton className="h-9 w-[88px] rounded-[10px] bg-slate-200" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, tileIndex) => (
                  <Skeleton
                    key={tileIndex}
                    className="h-[52px] rounded-[10px] bg-slate-100"
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.46fr)]">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-slate-200" />
                  <Skeleton className="h-4 w-full bg-slate-100" />
                  <Skeleton className="h-4 w-2/3 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36 bg-slate-100" />
                  <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
