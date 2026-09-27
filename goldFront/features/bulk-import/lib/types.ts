export type BulkImportEntity = "doctor" | "pharmacy";

export type BulkImportSeverity = "error" | "warning";

export type BulkImportRowStatus = "ready" | "warning" | "invalid";

export type SpreadsheetFileType =
  | "xlsx"
  | "xls"
  | "csv"
  | "tsv"
  | "delimited-text"
  | "unsupported";

export type BulkImportIssue = {
  field: string;
  value?: string;
  message: string;
  severity: BulkImportSeverity;
};

export type BulkImportParsedRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type BulkImportParsedSheet = {
  fileName: string;
  detectedType: SpreadsheetFileType;
  warnings: string[];
  headers: string[];
  rows: BulkImportParsedRow[];
};

export type TerritoryResolution = {
  district: string;
  region: string;
  territory: string;
};

export type BulkImportColumn<TPayload extends object> = {
  key: keyof TPayload & string;
  label: string;
  aliases?: string[];
  required?: boolean;
  example?: string;
  parse?: (value: string) => unknown;
  validate?: (
    value: unknown,
    row: Partial<TPayload>,
    source: Record<string, string>,
  ) => string | null;
};

export type BulkImportDuplicateCheck<TExisting, TPayload> = {
  label: string;
  field: keyof TPayload & string;
  getExistingValue: (record: TExisting) => string | null | undefined;
  getPayloadValue: (payload: Partial<TPayload>) => string | null | undefined;
  normalizeValue?: (value?: string | null) => string;
};

export type BulkImportConfig<TExisting, TPayload extends object> = {
  entity: BulkImportEntity;
  title: string;
  description: string;
  templateFileName: string;
  columns: BulkImportColumn<TPayload>[];
  duplicateChecks: BulkImportDuplicateCheck<TExisting, TPayload>[];
  validateRow?: (row: Partial<TPayload>) => BulkImportIssue[];
  buildPayload: (
    row: Partial<TPayload>,
    territory: TerritoryResolution | null,
  ) => TPayload | null;
  getExistingLabel: (record: TExisting) => string;
  getPayloadLabel: (payload: Partial<TPayload>) => string;
};

export type BulkImportReviewRow<TPayload extends object> = {
  id: string;
  rowNumber: number;
  status: BulkImportRowStatus;
  source: Record<string, string>;
  payload: TPayload | null;
  draft: Partial<TPayload>;
  territory: TerritoryResolution | null;
  issues: BulkImportIssue[];
  selected: boolean;
};

export type BulkImportSummary = {
  total: number;
  ready: number;
  warnings: number;
  invalid: number;
  selected: number;
};
