const OPEN_APPRAISAL_DIALOG_EVENT = "goldera:open-appraisal-dialog";

/**
 * Dispatches a window event that requests the New Appraisal dialog to open.
 * Used by the empty state so the page header keeps a single source of truth
 * for the dialog trigger.
 */
export function openAppraisalDialog(): void {
  window.dispatchEvent(new CustomEvent(OPEN_APPRAISAL_DIALOG_EVENT));
}

export { OPEN_APPRAISAL_DIALOG_EVENT };