import type {
  BulkImportConfig,
  BulkImportIssue,
  BulkImportParsedSheet,
  BulkImportReviewRow,
} from "./types";
import { resolveBulkImportTerritory } from "./territory-resolver";

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeDuplicateValue(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getSourceValue(
  source: Record<string, string>,
  headerMap: Map<string, string>,
  labels: string[],
) {
  for (const label of labels) {
    const sourceHeader = headerMap.get(normalizeHeader(label));
    if (sourceHeader) {
      return source[sourceHeader] ?? "";
    }
  }

  return "";
}

function getStatus(issues: BulkImportIssue[]) {
  if (issues.some((issue) => issue.severity === "error")) return "invalid";
  if (issues.some((issue) => issue.severity === "warning")) return "warning";
  return "ready";
}

function buildHeaderMap(headers: string[]) {
  return headers.reduce<Map<string, string>>((map, header) => {
    map.set(normalizeHeader(header), header);
    return map;
  }, new Map());
}

function addDuplicateIssues<TExisting, TPayload extends object>({
  rows,
  existingRecords,
  config,
}: {
  rows: BulkImportReviewRow<TPayload>[];
  existingRecords: TExisting[];
  config: BulkImportConfig<TExisting, TPayload>;
}) {
  config.duplicateChecks.forEach((check) => {
    const existingValues = new Map<string, string>();

    existingRecords.forEach((record) => {
      const normalized = normalizeDuplicateValue(check.getExistingValue(record));
      if (normalized) {
        existingValues.set(normalized, config.getExistingLabel(record));
      }
    });

    const sheetValues = new Map<string, number[]>();

    rows.forEach((row) => {
      const normalized = normalizeDuplicateValue(
        check.getPayloadValue(row.draft),
      );
      if (!normalized) return;

      sheetValues.set(normalized, [
        ...(sheetValues.get(normalized) ?? []),
        row.rowNumber,
      ]);

      const existingLabel = existingValues.get(normalized);
      if (existingLabel) {
        row.issues.push({
          field: check.field,
          severity: "warning",
          message: `${check.label} already exists in CRM: ${existingLabel}.`,
        });
      }
    });

    rows.forEach((row) => {
      const normalized = normalizeDuplicateValue(
        check.getPayloadValue(row.draft),
      );
      const duplicateRows = normalized ? (sheetValues.get(normalized) ?? []) : [];

      if (duplicateRows.length > 1) {
        row.issues.push({
          field: check.field,
          severity: "error",
          message: `${check.label} is duplicated in this file on rows ${duplicateRows.join(", ")}.`,
        });
      }
    });
  });
}

export function validateBulkImportSheet<
  TExisting,
  TPayload extends object,
>({
  sheet,
  existingRecords,
  config,
}: {
  sheet: BulkImportParsedSheet;
  existingRecords: TExisting[];
  config: BulkImportConfig<TExisting, TPayload>;
}): BulkImportReviewRow<TPayload>[] {
  const headerMap = buildHeaderMap(sheet.headers);

  const rows = sheet.rows.map<BulkImportReviewRow<TPayload>>((parsedRow) => {
    const issues: BulkImportIssue[] = [];
    const draft: Partial<TPayload> = {};

    config.columns.forEach((column) => {
      const value = getSourceValue(parsedRow.values, headerMap, [
        column.label,
        column.key,
        ...(column.aliases ?? []),
      ]);
      const parsedValue = column.parse ? column.parse(value) : value.trim();

      if (column.required && String(parsedValue ?? "").trim() === "") {
        issues.push({
          field: column.key,
          severity: "error",
          message: `${column.label} is required.`,
        });
      }

      const customIssue = column.validate?.(parsedValue, draft, parsedRow.values);
      if (customIssue) {
        issues.push({
          field: column.key,
          severity: "error",
          message: customIssue,
        });
      }

      if (String(parsedValue ?? "").trim() !== "") {
        (draft as Record<string, unknown>)[column.key] = parsedValue;
      }
    });

    const draftRecord = draft as Record<string, unknown>;
    const territoryResult = resolveBulkImportTerritory({
      district: String(draftRecord.district ?? ""),
      region: String(draftRecord.region ?? ""),
      territory: String(draftRecord.subRegion ?? draftRecord.territory ?? ""),
    });
    issues.push(...territoryResult.issues);

    const payload = config.buildPayload(draft, territoryResult.territory);

    if (!payload && !issues.some((issue) => issue.severity === "error")) {
      issues.push({
        field: "row",
        severity: "error",
        message: "This row could not be converted into an import payload.",
      });
    }

    return {
      id: `${config.entity}-${parsedRow.rowNumber}`,
      rowNumber: parsedRow.rowNumber,
      status: getStatus(issues),
      source: parsedRow.values,
      payload,
      draft,
      territory: territoryResult.territory,
      issues,
      selected: false,
    };
  });

  addDuplicateIssues({ rows, existingRecords, config });

  return rows.map((row) => {
    const status = getStatus(row.issues);
    return {
      ...row,
      status,
      selected: status === "ready",
    };
  });
}

export function summarizeBulkImportRows<TPayload extends object>(
  rows: BulkImportReviewRow<TPayload>[],
) {
  return rows.reduce(
    (summary, row) => ({
      total: summary.total + 1,
      ready: summary.ready + (row.status === "ready" ? 1 : 0),
      warnings: summary.warnings + (row.status === "warning" ? 1 : 0),
      invalid: summary.invalid + (row.status === "invalid" ? 1 : 0),
      selected: summary.selected + (row.selected ? 1 : 0),
    }),
    {
      total: 0,
      ready: 0,
      warnings: 0,
      invalid: 0,
      selected: 0,
    },
  );
}
