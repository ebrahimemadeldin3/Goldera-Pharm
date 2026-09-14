import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function PharmaciesSkeleton() {
  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="bg-gp-gold-100 h-3 w-32" />
          <Skeleton className="h-8 w-72 bg-slate-200" />
          <Skeleton className="h-4 w-full max-w-xl bg-slate-100" />
        </div>
        <Skeleton className="h-11 w-40 rounded-[12px] bg-slate-200" />
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
                <Skeleton className="h-3 w-28 bg-slate-100" />
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
              <Skeleton className="h-6 w-44 bg-slate-200" />
              <Skeleton className="h-4 w-48 bg-slate-100" />
            </div>
            <Skeleton className="h-11 w-full rounded-[12px] bg-slate-100 lg:w-[380px]" />
          </div>

          <div className="mt-4 hidden md:block">
            <Skeleton className="mb-2 h-3 w-20 bg-slate-100" />
            <div className="flex flex-wrap items-center gap-2">
              <div className="border-gp-border-subtle bg-gp-surface-subtle flex flex-wrap items-center gap-2 rounded-[14px] border p-2">
                <Skeleton className="h-11 w-[230px] rounded-[12px] bg-slate-100" />
                <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                <Skeleton className="h-11 w-[205px] rounded-[12px] bg-slate-100" />
                <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
                <Skeleton className="h-11 w-[170px] rounded-[12px] bg-slate-100" />
              </div>
              <Skeleton className="h-11 w-[170px] rounded-[12px] bg-slate-100" />
              <Skeleton className="h-11 w-[175px] rounded-[12px] bg-slate-100" />
            </div>
          </div>
        </header>

        <div className="bg-gp-surface-subtle/40 p-4 sm:p-5">
          <div className="border-gp-border-subtle hidden overflow-hidden rounded-[14px] border bg-white lg:block">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-gp-border-subtle border-b bg-[#F9FAFB]">
                <tr>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <th key={index} className="px-4 py-3">
                      <Skeleton className="h-3 w-20 bg-slate-200" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-gp-border-subtle divide-y bg-white">
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="px-4 py-3.5">
                      <Skeleton className="h-4 w-6 bg-slate-100" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-[10px] bg-slate-200" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-44 bg-slate-200" />
                          <Skeleton className="h-3 w-20 bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: 6 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-24 bg-slate-100" />
                      </td>
                    ))}
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-9 w-28 rounded-[10px] bg-slate-200" />
                        <Skeleton className="size-9 rounded-[10px] bg-slate-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[14px] border p-4"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-[10px] bg-slate-200" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 bg-slate-200" />
                    <Skeleton className="h-3 w-20 bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, tileIndex) => (
                    <Skeleton
                      key={tileIndex}
                      className="h-[58px] rounded-[10px] bg-slate-100"
                    />
                  ))}
                </div>
                <div className="border-gp-border-subtle mt-4 flex justify-between border-t pt-3">
                  <Skeleton className="h-4 w-28 bg-slate-100" />
                  <Skeleton className="h-9 w-28 rounded-[10px] bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
