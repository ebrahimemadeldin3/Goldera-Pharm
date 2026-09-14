export function AppraisalPageSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className="bg-gp-border-control h-px w-6 animate-pulse" />
          <span className="bg-gp-border-control h-3 w-44 animate-pulse rounded" />
        </div>
        <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="bg-gp-border-control block h-7 w-64 animate-pulse rounded-md" />
            <span className="bg-gp-border-subtle mt-2 block h-4 w-96 max-w-full animate-pulse rounded" />
          </div>
          <span className="bg-gp-border-control h-10 w-40 animate-pulse rounded-[10px]" />
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-gp-border-default bg-gp-surface-card shadow-gp-card relative flex min-h-[112px] items-center gap-4 overflow-hidden rounded-[14px] border p-5"
          >
            <span className="bg-gp-border-control absolute top-0 bottom-0 left-0 w-[3px] animate-pulse" />
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="bg-gp-border-control block h-6 w-44 animate-pulse rounded-md" />
              <span className="bg-gp-border-subtle mt-1.5 block h-3.5 w-72 animate-pulse rounded" />
            </div>
            <span className="bg-gp-border-control inline-flex h-6 w-auto items-center gap-1 rounded-full px-2.5">
              <span className="size-3 animate-pulse rounded-full bg-gp-gold-500/70" />
              <span className="bg-gp-border-control h-3 w-16 animate-pulse rounded" />
            </span>
          </div>
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
                <span className="bg-gp-navy-800/25 size-10 animate-pulse rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="bg-gp-border-control h-5 w-56 animate-pulse rounded" />
                    <div className="flex items-center gap-2">
                      <span className="bg-gp-border-subtle h-5 w-24 animate-pulse rounded-full" />
                      <span className="bg-gp-border-subtle h-5 w-20 animate-pulse rounded-full" />
                    </div>
                  </div>
                  <span className="bg-gp-border-subtle mt-3 block h-3.5 w-72 animate-pulse rounded" />
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, cell) => (
                      <span
                        key={cell}
                        className="bg-gp-border-subtle block h-9 animate-pulse rounded-[8px]"
                      />
                    ))}
                  </div>
                  <span className="bg-gp-border-control mt-4 block h-9 w-44 animate-pulse rounded-[10px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}