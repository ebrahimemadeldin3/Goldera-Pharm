"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function VisitsErrorState({
  title = "Unable to load visits data",
  message,
}: {
  title?: string;
  message?: string;
}) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-[#FECDCA] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#FECDCA] bg-[#FEF3F2] text-[#B42318]">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#182033]">{title}</h2>
            <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
              {message || "We couldn't retrieve the required visits data."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#101D36] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,29,54,0.16)] transition-[background-color,transform] duration-[170ms] hover:-translate-y-px hover:bg-[#101D36]/95 focus-visible:ring-3 focus-visible:ring-[#C9A44C]/20 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <RefreshCw className="size-4 text-[#C9A44C]" aria-hidden="true" />
          Try Again
        </button>
      </div>
    </section>
  );
}
