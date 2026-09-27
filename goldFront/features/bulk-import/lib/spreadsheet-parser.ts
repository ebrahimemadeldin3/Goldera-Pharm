import type {
  BulkImportParsedRow,
  BulkImportParsedSheet,
  SpreadsheetFileType,
} from "./types";

type ZipEntry = {
  fileName: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

type WorkbookSheetRef = {
  name: string;
  relationshipId: string;
  path: string;
};

const TEXT_DECODER = new TextDecoder("utf-8");
const OFFICE_RELATIONSHIP_NS =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/tab-separated-values",
  "application/csv",
  "application/vnd.ms-excel",
]);
export const BULK_IMPORT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const BULK_IMPORT_MAX_ROWS = 1000;

type DetectedSpreadsheetFile = {
  type: SpreadsheetFileType;
  extension: string;
  delimiter?: string;
  warning?: string;
};

function cleanCell(value: string) {
  return value
    .replace(/\uFEFF/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureUniqueHeader(header: string, index: number, seen: Set<string>) {
  const base = cleanCell(header) || `Column ${index + 1}`;
  let candidate = base;
  let suffix = 2;

  while (seen.has(candidate.toLowerCase())) {
    candidate = `${base} ${suffix}`;
    suffix += 1;
  }

  seen.add(candidate.toLowerCase());
  return candidate;
}

function rowsToSheet(
  rows: string[][],
  fileName: string,
  detectedType: SpreadsheetFileType,
  warnings: string[] = [],
): BulkImportParsedSheet {
  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => cleanCell(cell)),
  );

  if (headerRowIndex < 0) {
    return { fileName, detectedType, warnings, headers: [], rows: [] };
  }

  const seen = new Set<string>();
  const headers = rows[headerRowIndex].map((header, index) =>
    ensureUniqueHeader(header, index, seen),
  );

  const parsedRows: BulkImportParsedRow[] = rows
    .slice(headerRowIndex + 1)
    .map((row, index) => {
      const values = headers.reduce<Record<string, string>>(
        (accumulator, header, columnIndex) => {
          accumulator[header] = cleanCell(row[columnIndex] ?? "");
          return accumulator;
        },
        {},
      );

      return {
        rowNumber: headerRowIndex + index + 2,
        values,
      };
    })
    .filter((row) =>
      Object.values(row.values).some((value) => cleanCell(value) !== ""),
    );

  return { fileName, detectedType, warnings, headers, rows: parsedRows };
}

function enforceSheetLimits(sheet: BulkImportParsedSheet) {
  if (sheet.rows.length > BULK_IMPORT_MAX_ROWS) {
    throw new Error(
      `This file contains ${sheet.rows.length.toLocaleString()} data rows. The current import limit is ${BULK_IMPORT_MAX_ROWS.toLocaleString()} rows per batch.`,
    );
  }

  return sheet;
}

function parseDelimitedText(
  text: string,
  delimiter: string,
  fileName: string,
  detectedType: SpreadsheetFileType,
  warnings: string[] = [],
) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return enforceSheetLimits(rowsToSheet(rows, fileName, detectedType, warnings));
}

function countDelimiterOutsideQuotes(line: string, delimiter: string) {
  let count = 0;
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectDelimiter(text: string) {
  const sampleLines = text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (sampleLines.length === 0) return null;

  const candidates = [",", "\t", ";"];
  const scores = candidates
    .map((delimiter) => {
      const counts = sampleLines.map((line) =>
        countDelimiterOutsideQuotes(line, delimiter),
      );
      const populatedLines = counts.filter((count) => count > 0).length;

      return {
        delimiter,
        score: counts.reduce((total, count) => total + count, 0),
        populatedLines,
      };
    })
    .sort((left, right) => {
      if (right.populatedLines !== left.populatedLines) {
        return right.populatedLines - left.populatedLines;
      }

      return right.score - left.score;
    });

  return scores[0] && scores[0].score > 0 ? scores[0].delimiter : null;
}

function decodeTextBuffer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);

  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes);
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes);
  }

  return TEXT_DECODER.decode(bytes);
}

function getFileExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? `.${match[1]}` : "";
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

function looksLikeZip(bytes: Uint8Array) {
  return (
    startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
    startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]) ||
    startsWith(bytes, [0x50, 0x4b, 0x07, 0x08])
  );
}

function looksLikeLegacyXls(bytes: Uint8Array) {
  return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
}

function looksLikeText(bytes: Uint8Array) {
  if (bytes.length === 0) return true;

  const sampleLength = Math.min(bytes.length, 2048);
  let controlCharacters = 0;

  for (let index = 0; index < sampleLength; index += 1) {
    const byte = bytes[index];
    if (byte === 0) return false;
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) {
      controlCharacters += 1;
    }
  }

  return controlCharacters / sampleLength < 0.02;
}

function getTypeForDelimiter(delimiter: string): SpreadsheetFileType {
  return delimiter === "\t" ? "tsv" : delimiter === "," ? "csv" : "delimited-text";
}

export function detectSpreadsheetFileType(
  file: File,
  buffer: ArrayBuffer,
): DetectedSpreadsheetFile {
  const bytes = new Uint8Array(buffer);
  const extension = getFileExtension(file.name);
  const extensionType: SpreadsheetFileType =
    extension === ".xlsx"
      ? "xlsx"
      : extension === ".xls"
        ? "xls"
        : extension === ".csv"
          ? "csv"
          : extension === ".tsv"
            ? "tsv"
            : extension === ".txt"
              ? "delimited-text"
              : "unsupported";

  if (looksLikeZip(bytes)) {
    return {
      type: "xlsx",
      extension,
      warning:
        extensionType !== "xlsx"
          ? "The file extension does not match its contents. It was detected as an Excel workbook and parsed as Excel."
          : undefined,
    };
  }

  if (looksLikeLegacyXls(bytes)) {
    return {
      type: "xls",
      extension,
      warning:
        extensionType !== "xls"
          ? "The file extension does not match its contents. It was detected as a legacy Excel workbook."
          : undefined,
    };
  }

  const textAllowedByHint =
    TEXT_MIME_TYPES.has(file.type) ||
    [".csv", ".tsv", ".txt", ".xlsx"].includes(extension);

  if (!looksLikeText(bytes) || !textAllowedByHint) {
    return { type: "unsupported", extension };
  }

  const text = decodeTextBuffer(buffer);
  const delimiter =
    extension === ".tsv"
      ? "\t"
      : extension === ".csv" && detectDelimiter(text) === null
        ? ","
        : detectDelimiter(text);

  if (!delimiter) {
    return {
      type: extension === ".txt" ? "delimited-text" : extensionType,
      extension,
    };
  }

  const detectedType = getTypeForDelimiter(delimiter);

  return {
    type: detectedType,
    extension,
    delimiter,
    warning:
      extensionType !== "unsupported" && extensionType !== detectedType
        ? `The file extension does not match its contents. It was detected as ${detectedType.toUpperCase()} text and parsed successfully.`
        : undefined,
  };
}

function getUint16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function getUint32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function findEndOfCentralDirectory(view: DataView) {
  const minOffset = Math.max(0, view.byteLength - 65557);

  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (getUint32(view, offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error("This .xlsx file could not be read.");
}

function readZipEntries(buffer: ArrayBuffer): ZipEntry[] {
  const view = new DataView(buffer);
  const endOffset = findEndOfCentralDirectory(view);
  const entryCount = getUint16(view, endOffset + 10);
  let centralDirectoryOffset = getUint32(view, endOffset + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (getUint32(view, centralDirectoryOffset) !== 0x02014b50) {
      throw new Error("This .xlsx file has an invalid directory.");
    }

    const compressionMethod = getUint16(view, centralDirectoryOffset + 10);
    const compressedSize = getUint32(view, centralDirectoryOffset + 20);
    const fileNameLength = getUint16(view, centralDirectoryOffset + 28);
    const extraLength = getUint16(view, centralDirectoryOffset + 30);
    const commentLength = getUint16(view, centralDirectoryOffset + 32);
    const localHeaderOffset = getUint32(view, centralDirectoryOffset + 42);
    const fileNameStart = centralDirectoryOffset + 46;
    const fileName = TEXT_DECODER.decode(
      new Uint8Array(buffer, fileNameStart, fileNameLength),
    );

    entries.push({
      fileName,
      compressionMethod,
      compressedSize,
      localHeaderOffset,
    });

    centralDirectoryOffset =
      fileNameStart + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function inflateRaw(data: Uint8Array) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "This browser cannot read compressed .xlsx files. Save the template as CSV and try again.",
    );
  }

  const dataCopy = new Uint8Array(data);
  const stream = new Blob([dataCopy.buffer as ArrayBuffer]).stream().pipeThrough(
    new DecompressionStream("deflate-raw"),
  );
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipText(
  buffer: ArrayBuffer,
  entry: ZipEntry | undefined,
) {
  if (!entry) return "";

  const view = new DataView(buffer);
  const localOffset = entry.localHeaderOffset;

  if (getUint32(view, localOffset) !== 0x04034b50) {
    throw new Error("This .xlsx file has an invalid file entry.");
  }

  const fileNameLength = getUint16(view, localOffset + 26);
  const extraLength = getUint16(view, localOffset + 28);
  const dataOffset = localOffset + 30 + fileNameLength + extraLength;
  const compressedData = new Uint8Array(
    buffer,
    dataOffset,
    entry.compressedSize,
  );

  if (entry.compressionMethod === 0) {
    return TEXT_DECODER.decode(compressedData);
  }

  if (entry.compressionMethod === 8) {
    return TEXT_DECODER.decode(await inflateRaw(compressedData));
  }

  throw new Error("This .xlsx compression format is not supported.");
}

function parseXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const parseError = document.querySelector("parsererror");

  if (parseError) {
    throw new Error("This .xlsx file contains invalid XML.");
  }

  return document;
}

function getElementsByLocalName(root: ParentNode, localName: string) {
  return Array.from(root.querySelectorAll("*")).filter(
    (element) => element.localName === localName,
  );
}

function firstElementByLocalName(root: ParentNode, localName: string) {
  return getElementsByLocalName(root, localName)[0] ?? null;
}

function textContent(element: Element | null) {
  return element?.textContent ?? "";
}

function parseSharedStrings(xml: string) {
  if (!xml) return [];

  const document = parseXml(xml);
  return getElementsByLocalName(document, "si").map((item) =>
    getElementsByLocalName(item, "t")
      .map((text) => text.textContent ?? "")
      .join(""),
  );
}

function getRelationshipId(element: Element) {
  return (
    element.getAttribute("r:id") ??
    element.getAttributeNS(OFFICE_RELATIONSHIP_NS, "id") ??
    Array.from(element.attributes).find((attribute) =>
      attribute.name.endsWith(":id"),
    )?.value ??
    ""
  );
}

function normalizeZipPath(path: string) {
  const segments: string[] = [];

  path.split("/").forEach((segment) => {
    if (!segment || segment === ".") return;
    if (segment === "..") {
      segments.pop();
      return;
    }
    segments.push(segment);
  });

  return segments.join("/");
}

function resolveWorkbookTarget(target: string) {
  if (target.startsWith("/")) return normalizeZipPath(target.slice(1));

  return normalizeZipPath(
    target.startsWith("xl/") ? target : `xl/${target}`,
  );
}

function getWorkbookSheets(workbookXml: string, relsXml: string) {
  if (!workbookXml || !relsXml) return [];

  const workbook = parseXml(workbookXml);
  const rels = parseXml(relsXml);
  const relationshipTargets = new Map<string, string>();

  getElementsByLocalName(rels, "Relationship").forEach((relationship) => {
    const id = relationship.getAttribute("Id");
    const target = relationship.getAttribute("Target");
    if (id && target) {
      relationshipTargets.set(id, resolveWorkbookTarget(target));
    }
  });

  return getElementsByLocalName(workbook, "sheet")
    .map<WorkbookSheetRef | null>((sheet, index) => {
      const relationshipId = getRelationshipId(sheet);
      const path = relationshipTargets.get(relationshipId);

      if (!relationshipId || !path) return null;

      return {
        name: sheet.getAttribute("name")?.trim() || `Worksheet ${index + 1}`,
        relationshipId,
        path,
      };
    })
    .filter((sheet): sheet is WorkbookSheetRef => Boolean(sheet));
}

function columnIndexFromCellRef(cellRef: string | null, fallback: number) {
  const letters = (cellRef ?? "").match(/[A-Z]+/i)?.[0];
  if (!letters) return fallback;

  return letters
    .toUpperCase()
    .split("")
    .reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function parseWorksheetRows(xml: string, sharedStrings: string[]) {
  const document = parseXml(xml);

  return getElementsByLocalName(document, "row").map((rowElement) => {
    const row: string[] = [];

    getElementsByLocalName(rowElement, "c").forEach(
      (cellElement, fallbackIndex) => {
        const columnIndex = columnIndexFromCellRef(
          cellElement.getAttribute("r"),
          fallbackIndex,
        );
        const type = cellElement.getAttribute("t");
        let value = "";

        if (type === "s") {
          const sharedIndex = Number(
            textContent(firstElementByLocalName(cellElement, "v")),
          );
          value = Number.isFinite(sharedIndex)
            ? (sharedStrings[sharedIndex] ?? "")
            : "";
        } else if (type === "inlineStr") {
          value = getElementsByLocalName(cellElement, "t")
            .map((text) => text.textContent ?? "")
            .join("");
        } else if (type === "str") {
          value = textContent(firstElementByLocalName(cellElement, "v"));
        } else if (type === "b") {
          value =
            textContent(firstElementByLocalName(cellElement, "v")) === "1"
              ? "TRUE"
              : "FALSE";
        } else {
          value = textContent(firstElementByLocalName(cellElement, "v"));
        }

        row[columnIndex] = value;
      },
    );

    return row;
  });
}

function hasMeaningfulCells(rows: string[][]) {
  return rows.some((row) => row.some((cell) => cleanCell(cell)));
}

async function parseXlsx(
  fileName: string,
  buffer: ArrayBuffer,
  warnings: string[] = [],
): Promise<BulkImportParsedSheet> {
  const entries = readZipEntries(buffer);
  const getEntry = (path: string) =>
    entries.find((entry) => entry.fileName === path);

  if (!getEntry("xl/workbook.xml")) {
    throw new Error(
      "Unsupported file format. Upload an Excel, CSV, TSV, or supported delimited text file.",
    );
  }

  const workbookXml = await readZipText(buffer, getEntry("xl/workbook.xml"));
  const relsXml = await readZipText(
    buffer,
    getEntry("xl/_rels/workbook.xml.rels"),
  );
  const sharedStrings = parseSharedStrings(
    await readZipText(buffer, getEntry("xl/sharedStrings.xml")),
  );
  const sheetRefs = getWorkbookSheets(workbookXml, relsXml);

  if (sheetRefs.length === 0) {
    throw new Error("No importable worksheet was found in this workbook.");
  }

  for (const sheetRef of sheetRefs) {
    const worksheetXml = await readZipText(buffer, getEntry(sheetRef.path));
    if (!worksheetXml) continue;

    const rows = parseWorksheetRows(worksheetXml, sharedStrings);

    if (hasMeaningfulCells(rows)) {
      return enforceSheetLimits(rowsToSheet(rows, fileName, "xlsx", warnings));
    }
  }

  throw new Error("No importable worksheet was found in this workbook.");
}

export function parseDelimitedSpreadsheet(
  text: string,
  fileName = "import.csv",
  delimiter = detectDelimiter(text) ?? ",",
  detectedType: SpreadsheetFileType = getTypeForDelimiter(delimiter),
  warnings: string[] = [],
) {
  return parseDelimitedText(text, delimiter, fileName, detectedType, warnings);
}

export async function parseSpreadsheetFile(
  file: File,
): Promise<BulkImportParsedSheet> {
  const lowerName = file.name.toLowerCase();

  if (file.size > BULK_IMPORT_MAX_FILE_SIZE_BYTES) {
    throw new Error(
      "File exceeds the 10 MB upload limit.",
    );
  }

  const buffer = await file.arrayBuffer();
  const detection = detectSpreadsheetFileType(file, buffer);
  const warnings = detection.warning ? [detection.warning] : [];

  if (detection.type === "xlsx") {
    return parseXlsx(file.name, buffer, warnings);
  }

  if (detection.type === "xls") {
    throw new Error(
      "Legacy .xls workbooks are detected but cannot be parsed by the current frontend spreadsheet reader. Save the file as .xlsx, .csv, .tsv, or delimited .txt and upload it again.",
    );
  }

  if (detection.type === "unsupported") {
    throw new Error(
      "Unsupported file format. Upload an Excel, CSV, TSV, or supported delimited text file.",
    );
  }

  const text = decodeTextBuffer(buffer);
  const delimiter = detection.delimiter ?? detectDelimiter(text);

  if (!delimiter) {
    if (lowerName.endsWith(".txt")) {
      throw new Error(
        "Unable to determine the column delimiter in this text file.",
      );
    }

    throw new Error("The uploaded file does not contain delimited tabular data.");
  }

  return parseDelimitedSpreadsheet(
    text,
    file.name,
    delimiter,
    detection.type,
    warnings,
  );
}
