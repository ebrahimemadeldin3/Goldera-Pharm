"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import { parseSpreadsheetFile } from "../lib/spreadsheet-parser";
import {
  downloadBulkImportErrorReport,
  downloadBulkImportTemplate,
} from "../lib/export";
import {
  summarizeBulkImportRows,
  validateBulkImportSheet,
} from "../lib/validation";
import type {
  BulkImportConfig,
  BulkImportParsedSheet,
  BulkImportReviewRow,
  BulkImportRowStatus,
} from "../lib/types";

const BACKEND_SUPPORT_MESSAGE =
  "Bulk commit requires backend support — excluded from current frontend-only scope.";

type FilterValue = "all" | BulkImportRowStatus;

type BulkImportDialogProps<
  TExisting,
  TPayload extends object,
> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingRecords: TExisting[];
  config: BulkImportConfig<TExisting, TPayload>;
};

const statusConfig: Record<
  BulkImportRowStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  ready: {
    label: "Ready",
    className: "border-gp-success/20 bg-gp-success/10 text-gp-success",
    icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    className: "border-gp-warning-border bg-gp-warning-soft text-gp-gold-700",
    icon: AlertTriangle,
  },
  invalid: {
    label: "Invalid",
    className: "border-gp-danger-border bg-gp-danger-soft text-gp-danger",
    icon: XCircle,
  },
};

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function StatusBadge({ status }: { status: BulkImportRowStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border px-3 py-2",
        tone === "success" && "border-gp-success/20 bg-gp-success/10",
        tone === "warning" && "border-gp-warning-border bg-gp-warning-soft",
        tone === "danger" && "border-gp-danger-border bg-gp-danger-soft",
        tone === "default" && "border-gp-border-subtle bg-white",
      )}
    >
      <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
        {label}
      </p>
      <p className="text-gp-navy-900 mt-1 text-lg leading-none font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function Stepper({
  hasFile,
  hasRows,
  commitBlocked,
}: {
  hasFile: boolean;
  hasRows: boolean;
  commitBlocked: boolean;
}) {
  const steps = [
    { label: "Upload", active: true, complete: hasFile },
    { label: "Validate", active: hasFile, complete: hasRows },
    { label: "Preview / Resolve", active: hasRows, complete: hasRows },
    { label: "Confirm Import", active: hasRows, complete: commitBlocked },
    { label: "Results", active: false, complete: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={cn(
            "rounded-[10px] border px-3 py-2 text-xs font-semibold",
            step.complete
              ? "border-gp-gold-300 bg-gp-gold-50 text-gp-navy-900"
              : step.active
                ? "border-gp-border-control bg-white text-gp-navy-900"
                : "border-gp-border-subtle bg-gp-surface-subtle text-gp-text-placeholder",
          )}
        >
          <span className="text-gp-gold-700 mr-1">
            {String(index + 1).padStart(2, "0")}
          </span>
          {step.label}
        </div>
      ))}
    </div>
  );
}

export function BulkImportDialog<
  TExisting,
  TPayload extends object,
>({
  open,
  onOpenChange,
  existingRecords,
  config,
}: BulkImportDialogProps<TExisting, TPayload>) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [sheet, setSheet] = useState<BulkImportParsedSheet | null>(null);
  const [rows, setRows] = useState<BulkImportReviewRow<TPayload>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [commitBlocked, setCommitBlocked] = useState(false);
  const [parseError, setParseError] = useState("");

  const summary = useMemo(() => summarizeBulkImportRows(rows), [rows]);

  const visibleRows = useMemo(() => {
    const searchKey = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!searchKey) return true;

      const text = [
        config.getPayloadLabel(row.draft),
        row.territory?.district,
        row.territory?.region,
        row.territory?.territory,
        ...Object.values(row.source),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(searchKey);
    });
  }, [config, filter, rows, search]);

  const eligibleVisibleRows = visibleRows.filter(
    (row) => row.status !== "invalid",
  );
  const allEligibleVisibleSelected =
    eligibleVisibleRows.length > 0 &&
    eligibleVisibleRows.every((row) => row.selected);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setIsParsing(true);
    setParseError("");
    setCommitBlocked(false);

    try {
      const parsedSheet = await parseSpreadsheetFile(file);

      if (parsedSheet.rows.length === 0 || parsedSheet.headers.length === 0) {
        throw new Error("The uploaded file does not contain importable rows.");
      }

      setSheet(parsedSheet);
      setRows(
        validateBulkImportSheet({
          sheet: parsedSheet,
          existingRecords,
          config,
        }),
      );
      toast.success({
        title: "File validated",
        description: `${parsedSheet.rows.length.toLocaleString()} row(s) parsed from ${file.name}.`,
      });
    } catch (error) {
      const message =
        (error as Error)?.message ||
        "Unable to parse this file. Use the downloaded template and try again.";
      setSheet(null);
      setRows([]);
      setParseError(message);
      toast.error({ title: "Import validation failed", description: message });
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function updateRowSelection(rowId: string, selected: boolean) {
    setCommitBlocked(false);
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId && row.status !== "invalid"
          ? { ...row, selected }
          : row,
      ),
    );
  }

  function updateVisibleSelection(selected: boolean) {
    setCommitBlocked(false);
    const visibleIds = new Set(eligibleVisibleRows.map((row) => row.id));
    setRows((currentRows) =>
      currentRows.map((row) =>
        visibleIds.has(row.id) ? { ...row, selected } : row,
      ),
    );
  }

  function handleConfirmImport() {
    setCommitBlocked(true);
    toast.warning({
      title: "Backend support required",
      description: BACKEND_SUPPORT_MESSAGE,
    });
  }

  function resetImport() {
    setSheet(null);
    setRows([]);
    setSearch("");
    setFilter("all");
    setParseError("");
    setCommitBlocked(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-[1120px]">
        <DialogHeader className="border-gp-border-subtle border-b px-5 py-4 pr-12">
          <div className="flex items-start gap-3">
            <span className="border-gp-gold-300 bg-gp-gold-50 text-gp-gold-700 flex size-10 shrink-0 items-center justify-center rounded-[10px] border">
              <FileSpreadsheet className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-gp-navy-900 text-xl">
                {config.title}
              </DialogTitle>
              <DialogDescription className="text-gp-text-muted mt-1 font-medium">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gp-surface-page flex max-h-[calc(92vh-76px)] min-h-0 flex-col overflow-hidden">
          <div className="space-y-4 px-5 py-4">
            <Stepper
              hasFile={Boolean(sheet)}
              hasRows={rows.length > 0}
              commitBlocked={commitBlocked}
            />

            <div className="border-gp-border-subtle grid gap-3 rounded-[14px] border bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-gp-navy-900 text-sm font-semibold">
                  {sheet ? sheet.fileName : "Upload Excel file"}
                </p>
                <p className="text-gp-text-muted mt-1 text-xs font-medium">
                  Supported files: .xlsx, .csv, .tsv. Templates download as CSV
                  and open directly in Excel.
                </p>
                {parseError && (
                  <p className="text-gp-danger mt-2 text-xs font-semibold">
                    {parseError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadBulkImportTemplate(config)}
                  className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Template
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 rounded-[10px] text-sm font-semibold text-white"
                >
                  <Upload className="text-gp-gold-500 size-4" aria-hidden="true" />
                  {isParsing ? "Validating..." : "Upload File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv,.tsv"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </div>
            </div>

            {rows.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  <StatPill label="Rows" value={summary.total} />
                  <StatPill label="Ready" value={summary.ready} tone="success" />
                  <StatPill
                    label="Warnings"
                    value={summary.warnings}
                    tone="warning"
                  />
                  <StatPill
                    label="Invalid"
                    value={summary.invalid}
                    tone="danger"
                  />
                  <StatPill label="Selected" value={summary.selected} />
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="border-gp-border-subtle flex flex-wrap gap-1 rounded-[12px] border bg-white p-1">
                    {(["all", "ready", "warning", "invalid"] as FilterValue[]).map(
                      (item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFilter(item)}
                          className={cn(
                            "h-8 rounded-[8px] px-3 text-xs font-semibold transition-colors",
                            filter === item
                              ? "bg-gp-navy-900 text-white"
                              : "text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-navy-900",
                          )}
                        >
                          {item === "all" ? "All" : statusConfig[item].label}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search
                        className="text-gp-text-placeholder absolute top-1/2 left-3 size-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search rows"
                        className="border-gp-border-default h-10 rounded-[10px] bg-white pl-9 text-sm font-medium"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        downloadBulkImportErrorReport(rows, config.entity)
                      }
                      className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Error Report
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {rows.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
              <div className="border-gp-border-subtle overflow-hidden rounded-[14px] border bg-white">
                <div className="border-gp-border-subtle flex flex-col gap-3 border-b bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gp-navy-900">
                    <Checkbox
                      checked={allEligibleVisibleSelected}
                      disabled={eligibleVisibleRows.length === 0}
                      onCheckedChange={(checked) =>
                        updateVisibleSelection(checked === true)
                      }
                      className="rounded-[4px]"
                    />
                    Select eligible visible rows
                  </label>
                  <p className="text-gp-text-muted text-xs font-medium">
                    Invalid rows stay locked until the file is corrected.
                  </p>
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[980px] border-collapse text-left">
                    <thead className="bg-gp-surface-subtle">
                      <tr>
                        <th className="w-12 px-3 py-3" />
                        <th className="text-gp-text-muted px-3 py-3 text-xs font-semibold tracking-[0.08em] uppercase">
                          Row
                        </th>
                        <th className="text-gp-text-muted px-3 py-3 text-xs font-semibold tracking-[0.08em] uppercase">
                          Status
                        </th>
                        {config.columns.slice(0, 7).map((column) => (
                          <th
                            key={column.key}
                            className="text-gp-text-muted min-w-[150px] px-3 py-3 text-xs font-semibold tracking-[0.08em] uppercase"
                          >
                            {column.label}
                          </th>
                        ))}
                        <th className="text-gp-text-muted min-w-[260px] px-3 py-3 text-xs font-semibold tracking-[0.08em] uppercase">
                          Issues
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-gp-border-subtle border-t align-top"
                        >
                          <td className="px-3 py-3">
                            <Checkbox
                              checked={row.selected}
                              disabled={row.status === "invalid"}
                              onCheckedChange={(checked) =>
                                updateRowSelection(row.id, checked === true)
                              }
                              className="rounded-[4px]"
                            />
                          </td>
                          <td className="text-gp-navy-900 px-3 py-3 text-sm font-semibold">
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                          {config.columns.slice(0, 7).map((column) => (
                            <td
                              key={column.key}
                              className="text-gp-navy-900 px-3 py-3 text-sm font-medium"
                            >
                              {formatValue(row.draft[column.key])}
                            </td>
                          ))}
                          <td className="px-3 py-3">
                            {row.issues.length > 0 ? (
                              <div className="space-y-1.5">
                                {row.issues.map((issue, index) => (
                                  <p
                                    key={`${row.id}-${issue.field}-${index}`}
                                    className={cn(
                                      "text-xs font-medium",
                                      issue.severity === "error"
                                        ? "text-gp-danger"
                                        : "text-gp-gold-700",
                                    )}
                                  >
                                    {issue.message}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gp-text-muted text-xs font-medium">
                                No issues
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-gp-border-subtle divide-y md:hidden">
                  {visibleRows.map((row) => (
                    <article key={row.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-gp-navy-900 text-sm font-semibold">
                            Row {row.rowNumber}
                          </p>
                          <p className="text-gp-text-muted mt-1 text-xs font-medium">
                            {config.getPayloadLabel(row.draft)}
                          </p>
                        </div>
                        <Checkbox
                          checked={row.selected}
                          disabled={row.status === "invalid"}
                          onCheckedChange={(checked) =>
                            updateRowSelection(row.id, checked === true)
                          }
                          className="rounded-[4px]"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={row.status} />
                        {row.territory && (
                          <span className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted rounded-full border px-2 py-1 text-[11px] font-semibold">
                            {row.territory.region} / {row.territory.territory}
                          </span>
                        )}
                      </div>
                      {row.issues.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {row.issues.map((issue, index) => (
                            <p
                              key={`${row.id}-mobile-${issue.field}-${index}`}
                              className={cn(
                                "text-xs font-medium",
                                issue.severity === "error"
                                  ? "text-gp-danger"
                                  : "text-gp-gold-700",
                              )}
                            >
                              {issue.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {visibleRows.length === 0 && (
                  <div className="px-4 py-10 text-center">
                    <p className="text-gp-navy-900 text-sm font-semibold">
                      No rows match the current filter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-gp-border-subtle flex flex-col gap-3 border-t bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {commitBlocked ? (
                <div className="border-gp-warning-border bg-gp-warning-soft text-gp-gold-700 flex items-start gap-2 rounded-[12px] border px-3 py-2 text-sm font-semibold">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{BACKEND_SUPPORT_MESSAGE}</span>
                </div>
              ) : (
                <p className="text-gp-text-muted text-xs font-medium">
                  {rows.length > 0
                    ? `${summary.selected.toLocaleString()} row(s) selected for the pending backend bulk endpoint.`
                    : "Download the template or upload a file to begin validation."}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetImport}
                disabled={rows.length === 0 && !sheet && !parseError}
                className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] px-4 text-sm font-semibold"
              >
                Reset
              </Button>
              <Button
                type="button"
                disabled={summary.selected === 0}
                onClick={handleConfirmImport}
                className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 rounded-[10px] px-4 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-60"
              >
                <CheckCircle2
                  className="text-gp-gold-500 size-4"
                  aria-hidden="true"
                />
                Confirm Import
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { BACKEND_SUPPORT_MESSAGE };
