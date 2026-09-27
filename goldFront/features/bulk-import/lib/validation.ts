import type {
  BulkImportConfig,
  BulkImportIssue,
  BulkImportColumn,
  BulkImportParsedSheet,
  BulkImportReviewRow,
} from "./types";
import { resolveBulkImportTerritory } from "./territory-resolver";

export function normalizeImportHeader(value: string) {
  return value
    .replace(/\uFEFF/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

function getColumnLabels<TPayload extends object>(
  column: BulkImportColumn<TPayload>,
) {
  return [column.label, column.key, ...(column.aliases ?? [])];
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
    const sourceHeader = headerMap.get(normalizeImportHeader(label));
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
    map.set(normalizeImportHeader(header), header);
    return map;
  }, new Map());
}

export function analyzeBulkImportHeaders<TExisting, TPayload extends object>({
  sheet,
  config,
}: {
  sheet: BulkImportParsedSheet;
  config: BulkImportConfig<TExisting, TPayload>;
}) {
  const headerMap = buildHeaderMap(sheet.headers);
  const recognizedHeaders = new Set<string>();
  const missingRequiredHeaders: string[] = [];

  config.columns.forEach((column) => {
    const matchedHeader = getColumnLabels(column)
      .map((label) => headerMap.get(normalizeImportHeader(label)))
      .find(Boolean);

    if (matchedHeader) {
      recognizedHeaders.add(matchedHeader);
    } else if (column.required) {
      missingRequiredHeaders.push(column.label);
    }
  });

  return {
    detectedHeaders: sheet.headers,
    recognizedHeaders: sheet.headers.filter((header) =>
      recognizedHeaders.has(header),
    ),
    unknownHeaders: sheet.headers.filter(
      (header) => !recognizedHeaders.has(header),
    ),
    missingRequiredHeaders,
  };
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
    const normalizeValue = check.normalizeValue ?? normalizeDuplicateValue;

    existingRecords.forEach((record) => {
      const normalized = normalizeValue(check.getExistingValue(record));
      if (normalized) {
        existingValues.set(normalized, config.getExistingLabel(record));
      }
    });

    const sheetValues = new Map<string, number[]>();

    rows.forEach((row) => {
      const normalized = normalizeValue(check.getPayloadValue(row.draft));
      if (!normalized) return;

      sheetValues.set(normalized, [
        ...(sheetValues.get(normalized) ?? []),
        row.rowNumber,
      ]);

      const existingLabel = existingValues.get(normalized);
      if (existingLabel) {
        row.issues.push({
          field: check.field,
          value: check.getPayloadValue(row.draft) ?? "",
          severity: "warning",
          message: `${check.label} already exists in CRM: ${existingLabel}.`,
        });
      }
    });

    rows.forEach((row) => {
      const normalized = normalizeValue(check.getPayloadValue(row.draft));
      const duplicateRows = normalized ? (sheetValues.get(normalized) ?? []) : [];

      if (duplicateRows.length > 1) {
        row.issues.push({
          field: check.field,
          value: check.getPayloadValue(row.draft) ?? "",
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
        ...getColumnLabels(column),
      ]);
      const parsedValue = column.parse ? column.parse(value) : value.trim();
      const rawEmpty = value.trim() === "";
      const parsedEmpty =
        parsedValue === undefined ||
        parsedValue === null ||
        (typeof parsedValue === "string" && parsedValue.trim() === "");
      const parsedNumber =
        typeof parsedValue === "number" && Number.isFinite(parsedValue);

      if (column.required && (rawEmpty || parsedEmpty) && !parsedNumber) {
        issues.push({
          field: column.key,
          value,
          severity: "error",
          message: `${column.label} is required.`,
        });
      }

      const customIssue = column.validate?.(parsedValue, draft, parsedRow.values);
      if (customIssue) {
        issues.push({
          field: column.key,
          value,
          severity: "error",
          message: customIssue,
        });
      }

      if (
        parsedNumber ||
        (typeof parsedValue === "string" && parsedValue.trim() !== "") ||
        (parsedValue !== undefined &&
          parsedValue !== null &&
          typeof parsedValue !== "string" &&
          typeof parsedValue !== "number")
      ) {
        (draft as Record<string, unknown>)[column.key] = parsedValue;
      }
    });

    issues.push(...(config.validateRow?.(draft) ?? []));

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
        value: "",
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
      selected: status !== "invalid",
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
