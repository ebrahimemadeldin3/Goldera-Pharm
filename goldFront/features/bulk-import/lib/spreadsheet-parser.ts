import type { BulkImportParsedRow, BulkImportParsedSheet } from "./types";

type ZipEntry = {
  fileName: string;
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
};

const TEXT_DECODER = new TextDecoder("utf-8");
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function cleanCell(value: string) {
  return value.replace(/\uFEFF/g, "").trim();
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
): BulkImportParsedSheet {
  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => cleanCell(cell)),
  );

  if (headerRowIndex < 0) {
    return { fileName, headers: [], rows: [] };
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

  return { fileName, headers, rows: parsedRows };
}

function parseDelimitedText(text: string, delimiter: string, fileName: string) {
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

  return rowsToSheet(rows, fileName);
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

function textContent(element: Element | null) {
  return element?.textContent ?? "";
}

function parseSharedStrings(xml: string) {
  if (!xml) return [];

  const document = parseXml(xml);
  return Array.from(document.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t"))
      .map((text) => text.textContent ?? "")
      .join(""),
  );
}

function getFirstWorksheetPath(workbookXml: string, relsXml: string) {
  if (!workbookXml || !relsXml) return "xl/worksheets/sheet1.xml";

  const workbook = parseXml(workbookXml);
  const rels = parseXml(relsXml);
  const firstSheet = workbook.getElementsByTagName("sheet")[0];
  const relationshipId = firstSheet?.getAttribute("r:id");

  if (!relationshipId) return "xl/worksheets/sheet1.xml";

  const relationship = Array.from(rels.getElementsByTagName("Relationship")).find(
    (item) => item.getAttribute("Id") === relationshipId,
  );
  const target = relationship?.getAttribute("Target");

  if (!target) return "xl/worksheets/sheet1.xml";

  return target.startsWith("/")
    ? target.slice(1)
    : `xl/${target.replace(/^\/?xl\//, "")}`;
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

  return Array.from(document.getElementsByTagName("row")).map((rowElement) => {
    const row: string[] = [];

    Array.from(rowElement.getElementsByTagName("c")).forEach(
      (cellElement, fallbackIndex) => {
        const columnIndex = columnIndexFromCellRef(
          cellElement.getAttribute("r"),
          fallbackIndex,
        );
        const type = cellElement.getAttribute("t");
        let value = "";

        if (type === "s") {
          const sharedIndex = Number(textContent(cellElement.querySelector("v")));
          value = Number.isFinite(sharedIndex)
            ? (sharedStrings[sharedIndex] ?? "")
            : "";
        } else if (type === "inlineStr") {
          value = Array.from(cellElement.getElementsByTagName("t"))
            .map((text) => text.textContent ?? "")
            .join("");
        } else {
          value = textContent(cellElement.querySelector("v"));
        }

        row[columnIndex] = value;
      },
    );

    return row;
  });
}

async function parseXlsx(file: File): Promise<BulkImportParsedSheet> {
  const buffer = await file.arrayBuffer();
  const entries = readZipEntries(buffer);
  const getEntry = (path: string) =>
    entries.find((entry) => entry.fileName === path);

  const workbookXml = await readZipText(buffer, getEntry("xl/workbook.xml"));
  const relsXml = await readZipText(
    buffer,
    getEntry("xl/_rels/workbook.xml.rels"),
  );
  const worksheetPath = getFirstWorksheetPath(workbookXml, relsXml);
  const worksheetXml = await readZipText(buffer, getEntry(worksheetPath));

  if (!worksheetXml) {
    throw new Error("The workbook does not contain a readable first worksheet.");
  }

  const sharedStrings = parseSharedStrings(
    await readZipText(buffer, getEntry("xl/sharedStrings.xml")),
  );

  return rowsToSheet(parseWorksheetRows(worksheetXml, sharedStrings), file.name);
}

export async function parseSpreadsheetFile(
  file: File,
): Promise<BulkImportParsedSheet> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".xlsx") || file.type === XLSX_MIME) {
    return parseXlsx(file);
  }

  const text = await file.text();

  if (lowerName.endsWith(".tsv")) {
    return parseDelimitedText(text, "\t", file.name);
  }

  return parseDelimitedText(text, ",", file.name);
}
