export function RequestsPageSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 py-1">
        <div className="flex items-center gap-2">
          <span className="bg-gp-border-control h-px w-6 animate-pulse" />
          <span className="bg-gp-border-control h-3 w-40 animate-pulse rounded" />
        </div>
        <span className="bg-gp-border-control mt-2 h-7 w-64 animate-pulse rounded-md" />
        <span className="bg-gp-border-subtle mt-2 h-4 w-96 max-w-full animate-pulse rounded" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card shadow-gp-card flex min-h-[112px] items-center gap-4 rounded-[14px] border p-5"
          >
            <span className="bg-gp-border-control size-10 animate-pulse rounded-[10px]" />
            <div className="min-w-0 flex-1">
              <span className="bg-gp-border-subtle block h-3 w-24 animate-pulse rounded" />
              <span className="bg-gp-border-control mt-2.5 block h-7 w-12 animate-pulse rounded" />
              <span className="bg-gp-border-subtle mt-2 block h-3 w-28 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </section>

      <section className="border-gp-border-default bg-gp-surface-card shadow-gp-card overflow-hidden rounded-[16px] border">
        <div className="border-gp-border-subtle flex flex-col gap-4 border-b px-4 py-4 sm:px-5">
          <span className="bg-gp-border-control h-6 w-40 animate-pulse rounded-md" />
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className="bg-gp-border-subtle h-9 w-24 animate-pulse rounded-[9px]"
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <span className="bg-gp-border-subtle h-10 w-40 animate-pulse rounded-[10px]" />
              <span className="bg-gp-border-subtle h-10 w-40 animate-pulse rounded-[10px]" />
              <span className="bg-gp-border-subtle h-10 w-72 animate-pulse rounded-[10px]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 p-4 sm:p-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-gp-border-default bg-gp-surface-card rounded-[14px] border p-5"
            >
              <div className="flex items-start gap-3.5">
                <span className="bg-gp-border-control size-10 animate-pulse rounded-[10px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-gp-border-control h-5 w-56 animate-pulse rounded" />
                    <span className="bg-gp-border-subtle h-5 w-24 animate-pulse rounded-full" />
                  </div>
                  <span className="bg-gp-border-subtle mt-3 block h-3.5 w-72 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}