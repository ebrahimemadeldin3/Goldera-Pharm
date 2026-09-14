import { ClipboardList } from "lucide-react";
import { NewAppraisalDialog } from "./NewAppraisalDialog";

export function AppraisalHeader() {
  return (
    <header className="appraisal-section-enter relative py-0.5">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="appraisal-eyebrow text-gp-gold-600 flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase">
            <span
              className="appraisal-eyebrow-line bg-gp-gold-500 inline-block h-px w-6"
              aria-hidden="true"
            />
            <ClipboardList className="size-3.5" aria-hidden="true" />
            Appraisal / Performance Management
          </p>
          <h1 className="appraisal-header-title text-gp-navy-900 mt-2 text-[26px] leading-tight font-semibold sm:text-[30px]">
            Performance Appraisals
          </h1>
          <p className="appraisal-header-subtitle text-gp-text-muted mt-1 max-w-2xl text-sm leading-6 font-medium">
            Review employee performance, track ratings and manage appraisal
            cycles.
          </p>
        </div>
        <div className="appraisal-header-action w-full shrink-0 sm:w-auto">
          <NewAppraisalDialog />
        </div>
      </div>
    </header>
  );
}
