import type {
  BulkImportConfig,
  TerritoryResolution,
} from "@/features/bulk-import/lib/types";
import type { CreateDoctorDto, DoctorApiResponse } from "./types/api";

export type DoctorImportPayload = CreateDoctorDto & {
  district?: string;
  region?: string;
};

function trim(value: string) {
  return value.trim();
}

function optionalTrim(value: string) {
  return value.trim() || undefined;
}

function parseNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : trimmed;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatValue(value: unknown) {
  return String(value ?? "").trim();
}

function validEmail(value: unknown) {
  const text = formatValue(value);
  if (!text) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
    ? null
    : `Email '${text}' is not a valid email address.`;
}

function validPhone(value: unknown) {
  const text = formatValue(value);
  if (!text) return null;
  return /^[+\d][\d\s().-]{6,}$/.test(text)
    ? null
    : `Phone '${text}' is not a valid phone number.`;
}

function validGrade(value: unknown) {
  const text = formatValue(value).toUpperCase().replace(/^GRADE\s+/, "");
  if (!text) return null;
  return ["A", "B", "C", "D"].includes(text)
    ? null
    : `Grade '${formatValue(value)}' must be A, B, C, or D.`;
}

function validPositiveNumber(value: unknown) {
  if (value === undefined || value === "") return null;
  return isFiniteNumber(value) && value >= 0
    ? null
    : `Avg Patients Per Day '${formatValue(value)}' must be a number 0 or greater.`;
}

function validLatitude(value: unknown) {
  if (value === undefined || value === "") return null;
  return isFiniteNumber(value) && value >= -90 && value <= 90
    ? null
    : `Latitude '${formatValue(value)}' must be between -90 and 90.`;
}

function validLongitude(value: unknown) {
  if (value === undefined || value === "") return null;
  return isFiniteNumber(value) && value >= -180 && value <= 180
    ? null
    : `Longitude '${formatValue(value)}' must be between -180 and 180.`;
}

function normalizePhoneForDuplicate(value?: string | null) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const hasPlus = text.startsWith("+");
  const digits = text.replace(/\D/g, "");
  return digits ? `${hasPlus ? "+" : ""}${digits}` : "";
}

export const doctorImportConfig: BulkImportConfig<
  DoctorApiResponse,
  DoctorImportPayload
> = {
  entity: "doctor",
  title: "Import Doctors",
  description:
    "Upload an Excel file, validate the rows, resolve issues, then prepare a clean bulk import batch.",
  templateFileName: "golderapharm-doctors-import-template.csv",
  columns: [
    {
      key: "nameEN",
      label: "English Name",
      aliases: ["Name EN", "Doctor Name", "Name"],
      required: true,
      example: "Dr. Abdullah Al-Salem",
      parse: trim,
    },
    {
      key: "nameAR",
      label: "Arabic Name",
      aliases: ["Name AR", "Arabic Doctor Name"],
      required: true,
      example: "د. عبدالله السالم",
      parse: trim,
    },
    {
      key: "phone",
      label: "Phone",
      aliases: ["Phone Number", "Mobile"],
      required: true,
      example: "+966 50 341 2111",
      parse: trim,
      validate: validPhone,
    },
    {
      key: "email",
      label: "Email",
      aliases: ["Email Address"],
      example: "abdullah.salem.test@example.com",
      parse: optionalTrim,
      validate: validEmail,
    },
    {
      key: "specialty",
      label: "Specialty",
      required: true,
      example: "Cardiology",
      parse: trim,
    },
    {
      key: "grade",
      label: "Grade",
      required: true,
      example: "A",
      parse: (value) => value.trim().replace(/^grade\s+/i, "").toUpperCase(),
      validate: validGrade,
    },
    {
      key: "LicenseNumber",
      label: "License Number",
      aliases: ["License", "SCFHS License"],
      example: "TEST-LIC-21001",
      parse: optionalTrim,
    },
    {
      key: "avgPatientsPerDay",
      label: "Avg Patients Per Day",
      aliases: [
        "Average Patients",
        "Avg Patients",
        "Avg. Patients Per Day",
        "Average Patients Per Day",
      ],
      example: "50",
      parse: parseNumber,
      validate: validPositiveNumber,
    },
    {
      key: "accountName",
      label: "Account / Facility",
      aliases: ["Account Name", "Facility", "Hospital"],
      required: true,
      example: "King Fahd Hospital of the University",
      parse: trim,
    },
    {
      key: "district",
      label: "District",
      required: true,
      example: "Central & Eastern District",
      parse: trim,
    },
    {
      key: "region",
      label: "Region",
      required: true,
      example: "Eastern Region",
      parse: trim,
    },
    {
      key: "subRegion",
      label: "Territory",
      aliases: ["Sub Region", "SubRegion"],
      required: true,
      example: "Eastern 1",
      parse: trim,
    },
    {
      key: "latitude",
      label: "Latitude",
      aliases: ["Lat"],
      example: "26.3032",
      parse: parseNumber,
      validate: validLatitude,
    },
    {
      key: "longitude",
      label: "Longitude",
      aliases: ["Lng", "Long"],
      example: "50.1832",
      parse: parseNumber,
      validate: validLongitude,
    },
  ],
  duplicateChecks: [
    {
      label: "Phone",
      field: "phone",
      getExistingValue: (doctor) => doctor.phone,
      getPayloadValue: (payload) => payload.phone,
      normalizeValue: normalizePhoneForDuplicate,
    },
    {
      label: "License number",
      field: "LicenseNumber",
      getExistingValue: (doctor) => doctor.LicenseNumber,
      getPayloadValue: (payload) => payload.LicenseNumber,
    },
    {
      label: "Email",
      field: "email",
      getExistingValue: (doctor) => doctor.email,
      getPayloadValue: (payload) => payload.email,
    },
  ],
  validateRow: (row) => {
    const hasLatitude = row.latitude !== undefined;
    const hasLongitude = row.longitude !== undefined;

    if (hasLatitude && !hasLongitude) {
      return [
        {
          field: "longitude",
          value: "",
          severity: "error",
          message: "Longitude is required when latitude is provided.",
        },
      ];
    }

    if (!hasLatitude && hasLongitude) {
      return [
        {
          field: "latitude",
          value: "",
          severity: "error",
          message: "Latitude is required when longitude is provided.",
        },
      ];
    }

    return [];
  },
  buildPayload: (
    row: Partial<DoctorImportPayload>,
    territory: TerritoryResolution | null,
  ) => {
    if (
      !territory ||
      !row.nameEN ||
      !row.nameAR ||
      !row.phone ||
      !row.grade ||
      !row.specialty ||
      !row.accountName
    ) {
      return null;
    }

    return {
      nameEN: String(row.nameEN).trim(),
      nameAR: String(row.nameAR).trim(),
      email: row.email ? String(row.email).trim() : undefined,
      phone: String(row.phone).trim(),
      grade: String(row.grade).trim(),
      avgPatientsPerDay:
        typeof row.avgPatientsPerDay === "number"
          ? row.avgPatientsPerDay
          : undefined,
      specialty: String(row.specialty).trim(),
      LicenseNumber: row.LicenseNumber
        ? String(row.LicenseNumber).trim()
        : undefined,
      accountName: String(row.accountName).trim(),
      subRegion: territory.territory,
      latitude: isFiniteNumber(row.latitude) ? row.latitude : undefined,
      longitude: isFiniteNumber(row.longitude) ? row.longitude : undefined,
      district: territory.district,
      region: territory.region,
    };
  },
  getExistingLabel: (doctor) => doctor.nameEN || doctor.nameAR || doctor.id,
  getPayloadLabel: (payload) =>
    String(payload.nameEN || payload.nameAR || "Unnamed doctor"),
};
