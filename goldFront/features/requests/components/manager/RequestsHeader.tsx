import { ClipboardCheck } from "lucide-react";

export function RequestsHeader() {
  return (
    <header className="requests-section-enter relative overflow-hidden py-0.5">
      <span
        className="pointer-events-none absolute inset-x-0 -bottom-8 h-16 bg-[linear-gradient(100deg,rgba(201,164,76,0.14)_0%,rgba(201,164,76,0)_42%,rgba(16,29,54,0.06)_100%)]"
        aria-hidden="true"
      />
      <p className="requests-eyebrow text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
        <span
          className="requests-eyebrow-line bg-gp-gold-500 inline-block h-px w-6"
          aria-hidden="true"
        />
        <ClipboardCheck className="size-3.5" aria-hidden="true" />
        Workflow / Request Management
      </p>
      <h1 className="requests-header-title text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
        Requests Review &amp; Approval
      </h1>
      <p className="requests-header-subtitle text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
        Review submitted requests, inspect supporting details, and manage
        approval decisions.
      </p>
    </header>
  );
}
