import type {
  BulkImportConfig,
  BulkImportReviewRow,
  BulkImportRowStatus,
} from "./types";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadTextFile(fileName: string, text: string, mimeType: string) {
  const blob = new Blob([`\uFEFF${text}`], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function toBulkImportCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

export function buildBulkImportTemplateCsv<TExisting, TPayload extends object>(
  config: BulkImportConfig<TExisting, TPayload>,
) {
  const headers = config.columns.map((column) => column.label);

  return toBulkImportCsv([headers]);
}

export function downloadBulkImportTemplate<
  TExisting,
  TPayload extends object,
>(config: BulkImportConfig<TExisting, TPayload>) {
  downloadTextFile(
    config.templateFileName,
    buildBulkImportTemplateCsv(config),
    "text/csv;charset=utf-8",
  );
}

export function downloadBulkImportErrorReport<
  TExisting,
  TPayload extends object,
>(
  rows: BulkImportReviewRow<TPayload>[],
  config: BulkImportConfig<TExisting, TPayload>,
) {
  const reportRows = rows.flatMap((row) =>
    row.issues.map((issue) => [
      row.rowNumber,
      config.getPayloadLabel(row.draft),
      issue.field,
      issue.value ?? "",
      row.status,
      issue.severity,
      issue.message,
    ]),
  );

  downloadTextFile(
    `${config.entity}-import-validation-report.csv`,
    toBulkImportCsv(
      [
        ["Row", "Entity", "Field", "Value", "Status", "Severity", "Error"],
        ...reportRows,
      ],
    ),
    "text/csv;charset=utf-8",
  );
}

function getBatchCell<TPayload extends object>(
  row: BulkImportReviewRow<TPayload>,
  key: keyof TPayload & string,
) {
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const draft = row.draft as Record<string, unknown>;

  if (key === "district") {
    return row.territory?.district ?? draft[key] ?? "";
  }

  if (key === "region") {
    return row.territory?.region ?? draft[key] ?? "";
  }

  if (key === "subRegion" || key === "territory") {
    return row.territory?.territory ?? payload[key] ?? draft[key] ?? "";
  }

  return payload[key] ?? draft[key] ?? "";
}

export function getBulkImportSelectableRows<TPayload extends object>(
  rows: BulkImportReviewRow<TPayload>[],
) {
  return rows.filter((row) => row.selected && row.status !== "invalid");
}

export function prepareBulkImportBatch<TPayload extends object>(
  rows: BulkImportReviewRow<TPayload>[],
) {
  return getBulkImportSelectableRows(rows)
    .filter((row) => row.payload)
    .map((row) => ({
      sourceRow: row.rowNumber,
      status: row.status,
      payload: row.payload as TPayload,
      territory: row.territory,
      warnings: row.issues
        .filter((issue) => issue.severity === "warning")
        .map((issue) => ({
          field: issue.field,
          value: issue.value ?? "",
          message: issue.message,
        })),
    }));
}

export function buildBulkImportValidatedBatchCsv<
  TExisting,
  TPayload extends object,
>(
  rows: BulkImportReviewRow<TPayload>[],
  config: BulkImportConfig<TExisting, TPayload>,
) {
  const selectedRows = getBulkImportSelectableRows(rows);
  const headers = [
    "Source Row",
    "Status",
    ...config.columns.map((column) => column.label),
  ];
  const csvRows = selectedRows.map((row) => [
    row.rowNumber,
    row.status.toUpperCase() as Uppercase<BulkImportRowStatus>,
    ...config.columns.map((column) => getBatchCell(row, column.key)),
  ]);

  return toBulkImportCsv([headers, ...csvRows]);
}

export function downloadBulkImportValidatedBatch<
  TExisting,
  TPayload extends object,
>(
  rows: BulkImportReviewRow<TPayload>[],
  config: BulkImportConfig<TExisting, TPayload>,
) {
  downloadTextFile(
    `${config.entity}-validated-import-batch.csv`,
    buildBulkImportValidatedBatchCsv(rows, config),
    "text/csv;charset=utf-8",
  );
}
