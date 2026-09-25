import type {
  BulkImportConfig,
  BulkImportReviewRow,
} from "./types";
import { getBulkImportTerritoryTemplateRows } from "./territory-resolver";

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

function toCsv(rows: unknown[][]) {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

export function downloadBulkImportTemplate<
  TExisting,
  TPayload extends object,
>(config: BulkImportConfig<TExisting, TPayload>) {
  const territoryRows = getBulkImportTerritoryTemplateRows();
  const headers = config.columns.map((column) => column.label);
  const exampleRows = territoryRows.slice(0, 3).map((territory, index) =>
    config.columns.map((column) => {
      if (column.key === "district") return territory.district;
      if (column.key === "region") return territory.region;
      if (column.key === "subRegion" || column.key === "territory") {
        return territory.territory;
      }
      return column.example ?? (index === 0 ? column.label : "");
    }),
  );

  downloadTextFile(
    config.templateFileName,
    toCsv([headers, ...exampleRows]),
    "text/csv;charset=utf-8",
  );
}

export function downloadBulkImportErrorReport<
  TPayload extends object,
>(rows: BulkImportReviewRow<TPayload>[], entity: string) {
  const reportRows = rows.flatMap((row) => {
    if (row.issues.length === 0) {
      return [
        [
          row.rowNumber,
          row.status,
          "",
          "",
          "No validation issues.",
        ],
      ];
    }

    return row.issues.map((issue) => [
      row.rowNumber,
      row.status,
      issue.severity,
      issue.field,
      issue.message,
    ]);
  });

  downloadTextFile(
    `${entity}-import-validation-report.csv`,
    toCsv([["Row", "Status", "Severity", "Field", "Message"], ...reportRows]),
    "text/csv;charset=utf-8",
  );
}
