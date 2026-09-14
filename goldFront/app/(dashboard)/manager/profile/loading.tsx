import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerProfileLoading() {
  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5">
        <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="size-28 rounded-full sm:size-[124px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-4 w-full max-w-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-[10px]" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[14px] border p-5"
            >
              <Skeleton className="size-10 rounded-[10px]" />
              <Skeleton className="mt-5 h-6 w-24" />
              <Skeleton className="mt-3 h-3 w-28" />
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,72fr)_minmax(300px,28fr)]">
          <div className="space-y-5">
            {[0, 1].map((section) => (
              <section
                key={section}
                className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-[12px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full max-w-sm" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton key={index} className="h-16 rounded-[12px]" />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="space-y-5">
            {[0, 1].map((section) => (
              <section
                key={section}
                className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5"
              >
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-4 w-full" />
                <div className="mt-5 space-y-3">
                  <Skeleton className="h-12 rounded-[12px]" />
                  <Skeleton className="h-12 rounded-[12px]" />
                  <Skeleton className="h-12 rounded-[12px]" />
                </div>
              </section>
            ))}
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
