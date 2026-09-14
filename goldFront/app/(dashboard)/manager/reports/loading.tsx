import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagerReportsLoading() {
  return (
    <PageContainer className="bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <header className="space-y-2 py-0.5">
        <Skeleton className="bg-gp-gold-100 h-4 w-44 rounded-full" />
        <Skeleton className="bg-gp-border-subtle h-8 w-56 rounded-[10px]" />
        <Skeleton className="bg-gp-border-subtle h-5 w-full max-w-xl rounded-[10px]" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card shadow-gp-card min-h-[96px] rounded-[14px] border p-5"
          >
            <Skeleton className="bg-gp-border-subtle size-10 rounded-[10px]" />
            <Skeleton className="bg-gp-border-subtle mt-4 h-3 w-28 rounded-full" />
            <Skeleton className="bg-gp-border-subtle mt-2 h-7 w-16 rounded-full" />
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
        <div className="border-gp-border-subtle border-b p-5">
          <Skeleton className="bg-gp-border-subtle h-6 w-36 rounded-full" />
          <Skeleton className="bg-gp-border-subtle mt-2 h-4 w-44 rounded-full" />
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Skeleton className="bg-gp-border-subtle h-11 rounded-[12px]" />
            <Skeleton className="bg-gp-border-subtle h-11 rounded-[10px]" />
          </div>
        </div>
        <div className="space-y-3.5 p-5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="bg-gp-border-subtle h-44 rounded-[14px]"
            />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
