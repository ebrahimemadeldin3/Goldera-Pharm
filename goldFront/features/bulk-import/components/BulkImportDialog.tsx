"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  ListChecks,
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
import { KSA_TERRITORY_STRUCTURE } from "@/features/plan/lib/territory";
import {
  BULK_IMPORT_MAX_FILE_SIZE_BYTES,
  BULK_IMPORT_MAX_ROWS,
  parseSpreadsheetFile,
} from "../lib/spreadsheet-parser";
import {
  downloadBulkImportErrorReport,
  downloadBulkImportTemplate,
  downloadBulkImportValidatedBatch,
  getBulkImportSelectableRows,
  prepareBulkImportBatch,
} from "../lib/export";
import {
  analyzeBulkImportHeaders,
  summarizeBulkImportRows,
  validateBulkImportSheet,
} from "../lib/validation";
import type {
  BulkImportColumn,
  BulkImportConfig,
  BulkImportParsedSheet,
  BulkImportReviewRow,
  BulkImportRowStatus,
} from "../lib/types";

const BACKEND_SUPPORT_MESSAGE =
  "The frontend validation and import preparation are complete. Database persistence will become available when the bulk-import backend endpoint is connected.";
const BACKEND_SCOPE_MESSAGE =
  "Requires backend change - excluded from current frontend-only scope.";

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

const REVIEW_FILTERS: Array<{
  value: FilterValue;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "warning", label: "Warnings" },
  { value: "invalid", label: "Needs Attention" },
];

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
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "danger";
  active?: boolean;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        "rounded-[10px] border px-3 py-2 text-left transition-colors",
        tone === "success" && "border-gp-success/20 bg-gp-success/10",
        tone === "warning" && "border-gp-warning-border bg-gp-warning-soft",
        tone === "danger" && "border-gp-danger-border bg-gp-danger-soft",
        tone === "default" && "border-gp-border-subtle bg-white",
        interactive &&
          "cursor-pointer hover:border-gp-gold-300 hover:bg-gp-gold-50 focus-visible:ring-gp-gold-500/30 focus-visible:ring-2 focus-visible:outline-none",
        active && "border-gp-navy-900 ring-gp-navy-900/10 ring-2",
      )}
    >
      <p className="text-gp-text-muted text-[11px] font-semibold tracking-[0.08em] uppercase">
        {label}
      </p>
      <p className="text-gp-navy-900 mt-1 text-lg leading-none font-semibold">
        {value.toLocaleString()}
      </p>
    </button>
  );
}

function Stepper({
  hasFile,
  hasRows,
  batchPrepared,
}: {
  hasFile: boolean;
  hasRows: boolean;
  batchPrepared: boolean;
}) {
  const steps = [
    { label: "Upload", active: true, complete: hasFile },
    { label: "Review", active: hasRows, complete: hasRows },
    { label: "Ready to Import", active: batchPrepared, complete: batchPrepared },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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

function getEntityPlural(entity: "doctor" | "pharmacy", count: number) {
  if (entity === "doctor") return count === 1 ? "doctor" : "doctors";
  return count === 1 ? "pharmacy" : "pharmacies";
}

function getIssueLabel(field: string) {
  if (field === "subRegion" || field === "territory") return "Territory";
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function getRawColumnValue<TPayload extends object>(
  row: BulkImportReviewRow<TPayload>,
  column: BulkImportColumn<TPayload>,
) {
  const draftValue = (row.draft as Record<string, unknown>)[column.key];

  if (draftValue !== undefined && draftValue !== null) {
    return String(draftValue);
  }

  const labels = [column.label, column.key, ...(column.aliases ?? [])];

  for (const label of labels) {
    const value = row.source[label];
    if (value !== undefined) return value;
  }

  return "";
}

function rebuildSheetFromReviewRows<TExisting, TPayload extends object>({
  rows,
  sheet,
  config,
}: {
  rows: BulkImportReviewRow<TPayload>[];
  sheet: BulkImportParsedSheet | null;
  config: BulkImportConfig<TExisting, TPayload>;
}): BulkImportParsedSheet {
  const headers = config.columns.map((column) => column.label);

  return {
    fileName: sheet?.fileName ?? "corrected-import",
    detectedType: sheet?.detectedType ?? "delimited-text",
    warnings: sheet?.warnings ?? [],
    headers,
    rows: rows.map((row) => ({
      rowNumber: row.rowNumber,
      values: config.columns.reduce<Record<string, string>>(
        (values, column) => {
          values[column.label] = getRawColumnValue(row, column);
          return values;
        },
        {},
      ),
    })),
  };
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
  const [batchPrepared, setBatchPrepared] = useState(false);
  const [parseError, setParseError] = useState("");
  const [headerWarnings, setHeaderWarnings] = useState<string[]>([]);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  const summary = useMemo(() => summarizeBulkImportRows(rows), [rows]);
  const selectedRows = useMemo(() => getBulkImportSelectableRows(rows), [rows]);
  const issueCount = rows.reduce((total, row) => total + row.issues.length, 0);
  const allRowsAreClean =
    rows.length > 0 && summary.invalid === 0 && summary.warnings === 0;

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

  function getRevalidatedRows(
    nextRows: BulkImportReviewRow<TPayload>[],
    previousReviewRows: BulkImportReviewRow<TPayload>[] = rows,
  ) {
    const previousRows = new Map(previousReviewRows.map((row) => [row.id, row]));
    const correctedSheet = rebuildSheetFromReviewRows({
      rows: nextRows,
      sheet,
      config,
    });

    return validateBulkImportSheet({
      sheet: correctedSheet,
      existingRecords,
      config,
    }).map((row) => {
      const previous = previousRows.get(row.id);

      return {
        ...row,
        selected:
          row.status === "invalid"
            ? false
            : previous?.status === "invalid"
              ? true
              : (previous?.selected ?? true),
      };
    });
  }

  function updateRowDraft(
    rowId: string,
    updates: Record<string, string | number | undefined>,
  ) {
    setBatchPrepared(false);
    setRows((currentRows) => {
      const nextRows = currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              draft: {
                ...row.draft,
                ...updates,
              },
            }
          : row,
      );

      return getRevalidatedRows(nextRows, currentRows);
    });
  }

  function updateFilter(nextFilter: FilterValue) {
    setFilter(nextFilter);
    setReviewExpanded(true);
  }

  function getCorrectionControls(row: BulkImportReviewRow<TPayload>) {
    const draft = row.draft as Record<string, unknown>;
    const issueFields = new Set(row.issues.map((issue) => issue.field));
    const hasGeographyIssue =
      issueFields.has("district") ||
      issueFields.has("region") ||
      issueFields.has("territory") ||
      issueFields.has("subRegion");
    const hasGradeIssue = issueFields.has("grade");
    const selectedDistrict = String(draft.district ?? "");
    const selectedRegion = String(draft.region ?? "");
    const regionOptions =
      KSA_TERRITORY_STRUCTURE.find((district) => district.name === selectedDistrict)
        ?.regions ?? [];
    const territoryOptions =
      regionOptions.find((region) => region.name === selectedRegion)
        ?.territories ?? [];

    if (!hasGeographyIssue && !hasGradeIssue) return null;

    return (
      <div className="mt-3 space-y-3 rounded-[12px] border border-gp-border-subtle bg-gp-surface-subtle p-3">
        {hasGeographyIssue && (
          <div className="grid gap-2 lg:grid-cols-3">
            <label className="space-y-1">
              <span className="text-gp-text-muted text-[11px] font-semibold uppercase">
                District
              </span>
              <select
                value={selectedDistrict}
                onChange={(event) =>
                  updateRowDraft(row.id, {
                    district: event.target.value,
                    region: "",
                    subRegion: "",
                  })
                }
                className="border-gp-border-control text-gp-navy-900 h-9 w-full rounded-[8px] border bg-white px-2 text-xs font-semibold"
              >
                <option value="">Select district</option>
                {KSA_TERRITORY_STRUCTURE.map((district) => (
                  <option key={district.name} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-gp-text-muted text-[11px] font-semibold uppercase">
                Region
              </span>
              <select
                value={selectedRegion}
                disabled={!selectedDistrict}
                onChange={(event) =>
                  updateRowDraft(row.id, {
                    region: event.target.value,
                    subRegion: "",
                  })
                }
                className="border-gp-border-control text-gp-navy-900 h-9 w-full rounded-[8px] border bg-white px-2 text-xs font-semibold disabled:bg-gp-surface-subtle disabled:text-gp-text-placeholder"
              >
                <option value="">Select region</option>
                {regionOptions.map((region) => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-gp-text-muted text-[11px] font-semibold uppercase">
                Territory
              </span>
              <select
                value={String(draft.subRegion ?? draft.territory ?? "")}
                disabled={!selectedRegion}
                onChange={(event) =>
                  updateRowDraft(row.id, {
                    subRegion: event.target.value,
                  })
                }
                className="border-gp-border-control text-gp-navy-900 h-9 w-full rounded-[8px] border bg-white px-2 text-xs font-semibold disabled:bg-gp-surface-subtle disabled:text-gp-text-placeholder"
              >
                <option value="">Select territory</option>
                {territoryOptions.map((territory) => (
                  <option key={territory.name} value={territory.name}>
                    {territory.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {hasGradeIssue && config.entity === "doctor" && (
          <label className="block max-w-[220px] space-y-1">
            <span className="text-gp-text-muted text-[11px] font-semibold uppercase">
              Grade
            </span>
            <select
              value={String(draft.grade ?? "")}
              onChange={(event) =>
                updateRowDraft(row.id, {
                  grade: event.target.value,
                })
              }
              className="border-gp-border-control text-gp-navy-900 h-9 w-full rounded-[8px] border bg-white px-2 text-xs font-semibold"
            >
              <option value="">Select grade</option>
              {["A", "B", "C", "D"].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    );
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setIsParsing(true);
    setParseError("");
    setHeaderWarnings([]);
    setBatchPrepared(false);

    try {
      const parsedSheet = await parseSpreadsheetFile(file);

      if (parsedSheet.headers.length === 0) {
        throw new Error("The uploaded file does not contain a header row.");
      }

      const headerAnalysis = analyzeBulkImportHeaders({
        sheet: parsedSheet,
        config,
      });

      if (headerAnalysis.missingRequiredHeaders.length > 0) {
        console.info("Bulk import header diagnostics", {
          entity: config.entity,
          detectedHeaders: headerAnalysis.detectedHeaders,
          recognizedHeaders: headerAnalysis.recognizedHeaders,
          unknownHeaders: headerAnalysis.unknownHeaders,
          missingRequiredHeaders: headerAnalysis.missingRequiredHeaders,
        });

        throw new Error(
          `Missing required ${headerAnalysis.missingRequiredHeaders.length === 1 ? "column" : "columns"}: ${headerAnalysis.missingRequiredHeaders.join(", ")}.`,
        );
      }

      if (headerAnalysis.unknownHeaders.length > 0) {
        setHeaderWarnings([
          ...parsedSheet.warnings,
          ...headerAnalysis.unknownHeaders.map(
            (header) =>
              `Column "${header}" is not part of the ${config.entity} import template and will be ignored.`,
          ),
        ]);
      } else {
        setHeaderWarnings(parsedSheet.warnings);
      }

      if (parsedSheet.rows.length === 0) {
        throw new Error(
          "The uploaded file has headers but no data rows. Fill at least one row and upload it again.",
        );
      }

      setSheet(parsedSheet);
      const validatedRows = validateBulkImportSheet({
        sheet: parsedSheet,
        existingRecords,
        config,
      });

      setRows(validatedRows);
      setReviewExpanded(validatedRows.some((row) => row.status !== "ready"));
      setFilter(
        validatedRows.some((row) => row.status === "invalid")
          ? "invalid"
          : "all",
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
      setHeaderWarnings([]);
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
    setBatchPrepared(false);
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId && row.status !== "invalid"
          ? { ...row, selected }
          : row,
      ),
    );
  }

  function updateVisibleSelection(selected: boolean) {
    setBatchPrepared(false);
    const visibleIds = new Set(eligibleVisibleRows.map((row) => row.id));
    setRows((currentRows) =>
      currentRows.map((row) =>
        visibleIds.has(row.id) ? { ...row, selected } : row,
      ),
    );
  }

  function handlePrepareBatch() {
    if (batchPrepared || selectedRows.length === 0) return;

    const revalidatedRows = getRevalidatedRows(rows, rows);
    const preparedBatch = prepareBulkImportBatch(revalidatedRows);

    if (preparedBatch.length === 0) {
      toast.error({
        title: "No valid records selected",
        description: "Select at least one ready or warning row before preparing the batch.",
      });
      return;
    }

    setRows(revalidatedRows);
    setBatchPrepared(true);
    toast.success({
      title: "Import file prepared",
      description: `${preparedBatch.length.toLocaleString()} record(s) prepared. ${BACKEND_SUPPORT_MESSAGE}`,
    });
  }

  function resetImport() {
    setSheet(null);
    setRows([]);
    setSearch("");
    setFilter("all");
    setParseError("");
    setHeaderWarnings([]);
    setBatchPrepared(false);
    setReviewExpanded(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetImport();
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[1120px]">
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

        <div className="bg-gp-surface-page flex max-h-[calc(90vh-76px)] min-h-0 flex-col overflow-hidden">
          <div className="space-y-4 px-5 py-4">
            <Stepper
              hasFile={Boolean(sheet)}
              hasRows={rows.length > 0}
              batchPrepared={batchPrepared}
            />

            <div className="border-gp-border-subtle grid gap-3 rounded-[14px] border bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="text-gp-navy-900 text-sm font-semibold">
                  {sheet ? sheet.fileName : "Upload Excel file"}
                </p>
                <p className="text-gp-text-muted mt-1 text-xs font-medium">
                  Supported files: .xlsx, .csv, .tsv and delimited .txt. Legacy
                  .xls is detected and reported if uploaded. Limit{" "}
                  {(BULK_IMPORT_MAX_FILE_SIZE_BYTES / 1024 / 1024).toLocaleString()} MB
                  and {BULK_IMPORT_MAX_ROWS.toLocaleString()} rows per batch.
                  Templates download as blank Excel-friendly CSV.
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
                  accept=".xlsx,.xls,.csv,.tsv,.txt,text/csv,text/plain,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  onChange={(event) => handleFile(event.target.files?.[0])}
                />
              </div>
            </div>

            {rows.length > 0 && (
              <>
                {headerWarnings.length > 0 && (
                  <div className="border-gp-warning-border bg-gp-warning-soft text-gp-gold-700 rounded-[12px] border px-3 py-2 text-xs font-semibold">
                    {headerWarnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                  <StatPill
                    label="Rows"
                    value={summary.total}
                    active={filter === "all"}
                    onClick={() => updateFilter("all")}
                  />
                  <StatPill
                    label="Ready"
                    value={summary.ready}
                    tone="success"
                    active={filter === "ready"}
                    onClick={() => updateFilter("ready")}
                  />
                  <StatPill
                    label="Warnings"
                    value={summary.warnings}
                    tone="warning"
                    active={filter === "warning"}
                    onClick={() => updateFilter("warning")}
                  />
                  <StatPill
                    label="Needs Attention"
                    value={summary.invalid}
                    tone="danger"
                    active={filter === "invalid"}
                    onClick={() => updateFilter("invalid")}
                  />
                  <StatPill label="Selected" value={summary.selected} />
                </div>

                {batchPrepared && (
                  <div className="border-gp-success/20 bg-gp-success/10 rounded-[14px] border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                          <CheckCircle2
                            className="text-gp-success size-4"
                            aria-hidden="true"
                          />
                          Import file prepared
                        </p>
                        <p className="text-gp-text-muted mt-1 text-xs font-medium">
                          {selectedRows.length.toLocaleString()}{" "}
                          {config.entity}
                          {selectedRows.length === 1 ? "" : "s"} passed
                          validation and are ready for database import.
                          Database import is awaiting backend integration.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={selectedRows.length === 0}
                        onClick={() =>
                          downloadBulkImportValidatedBatch(rows, config)
                        }
                        className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold"
                      >
                        <Download className="size-4" aria-hidden="true" />
                        Download Validated File
                      </Button>
                    </div>
                  </div>
                )}

                {allRowsAreClean && !batchPrepared && (
                  <div className="border-gp-success/20 bg-gp-success/10 rounded-[14px] border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-gp-navy-900 flex items-center gap-2 text-sm font-semibold">
                          <CheckCircle2
                            className="text-gp-success size-4"
                            aria-hidden="true"
                          />
                          {summary.ready.toLocaleString()}{" "}
                          {getEntityPlural(config.entity, summary.ready)} ready
                          to import
                        </p>
                        <p className="text-gp-text-muted mt-1 text-xs font-medium">
                          All rows passed validation. You can review the rows or
                          prepare the import file now.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReviewExpanded((current) => !current)}
                          className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold"
                        >
                          <ListChecks className="size-4" aria-hidden="true" />
                          {reviewExpanded ? "Hide Rows" : "Review Rows"}
                        </Button>
                        <Button
                          type="button"
                          disabled={summary.selected === 0 || batchPrepared}
                          onClick={handlePrepareBatch}
                          className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 rounded-[10px] text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-60"
                        >
                          <CheckCircle2
                            className="text-gp-gold-500 size-4"
                            aria-hidden="true"
                          />
                          Prepare Import
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="border-gp-border-subtle flex flex-wrap gap-1 rounded-[12px] border bg-white p-1">
                    {REVIEW_FILTERS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateFilter(item.value)}
                        className={cn(
                          "h-8 rounded-[8px] px-3 text-xs font-semibold transition-colors",
                          filter === item.value
                            ? "bg-gp-navy-900 text-white"
                            : "text-gp-text-muted hover:bg-gp-gold-50 hover:text-gp-navy-900",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
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
                      disabled={issueCount === 0}
                      onClick={() =>
                        downloadBulkImportErrorReport(rows, config)
                      }
                      className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold disabled:pointer-events-none disabled:opacity-60"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Error Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReviewExpanded((current) => !current)}
                      className="border-gp-border-control text-gp-navy-900 hover:border-gp-gold-300 hover:bg-gp-gold-50 h-10 rounded-[10px] text-sm font-semibold"
                    >
                      <ListChecks className="size-4" aria-hidden="true" />
                      {reviewExpanded ? "Hide Rows" : "Review Rows"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {rows.length > 0 && (reviewExpanded || !allRowsAreClean) && (
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
                                    <span className="font-semibold">
                                      {getIssueLabel(issue.field)}:
                                    </span>{" "}
                                    {issue.message}
                                  </p>
                                ))}
                                {getCorrectionControls(row)}
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
                              <span className="font-semibold">
                                {getIssueLabel(issue.field)}:
                              </span>{" "}
                              {issue.message}
                            </p>
                          ))}
                          {getCorrectionControls(row)}
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
              {batchPrepared ? (
                <div className="border-gp-border-subtle bg-gp-surface-subtle text-gp-text-muted flex items-start gap-2 rounded-[12px] border px-3 py-2 text-sm font-semibold">
                  <Info
                    className="mt-0.5 size-4 shrink-0 text-gp-gold-700"
                    aria-hidden="true"
                  />
                  <span className="flex min-w-0 items-start gap-2">
                    {BACKEND_SUPPORT_MESSAGE} {BACKEND_SCOPE_MESSAGE}
                  </span>
                </div>
              ) : (
                <p className="text-gp-text-muted text-xs font-medium">
                  {rows.length > 0
                    ? `${summary.selected.toLocaleString()} row(s) selected. Database saving requires bulk-import backend support.`
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
                disabled={summary.selected === 0 || batchPrepared}
                onClick={handlePrepareBatch}
                className="bg-gp-navy-900 hover:bg-gp-navy-900/95 h-10 rounded-[10px] px-4 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-60"
              >
                <CheckCircle2
                  className="text-gp-gold-500 size-4"
                  aria-hidden="true"
                />
                Prepare Import
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { BACKEND_SUPPORT_MESSAGE };
