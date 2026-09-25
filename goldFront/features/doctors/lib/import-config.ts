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
  return trimmed ? Number(trimmed) : undefined;
}

function validEmail(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
    ? null
    : "Enter a valid email address.";
}

function validPhone(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return /^[+\d][\d\s().-]{6,}$/.test(text)
    ? null
    : "Enter a valid phone number.";
}

function validGrade(value: unknown) {
  const text = String(value ?? "").trim().toUpperCase();
  if (!text) return null;
  return ["A", "B", "C", "D"].includes(text)
    ? null
    : "Grade must be A, B, C, or D.";
}

function validPositiveNumber(value: unknown) {
  if (value === undefined || value === "") return null;
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? null
    : "Average patients must be 0 or greater.";
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
      example: "Dr. Mohammed Al-Rashid",
      parse: trim,
    },
    {
      key: "nameAR",
      label: "Arabic Name",
      aliases: ["Name AR", "Arabic Doctor Name"],
      required: true,
      example: "Dr. Mohammed Al-Rashid",
      parse: trim,
    },
    {
      key: "phone",
      label: "Phone",
      aliases: ["Phone Number", "Mobile"],
      required: true,
      example: "+966 50 123 4567",
      parse: trim,
      validate: validPhone,
    },
    {
      key: "email",
      label: "Email",
      aliases: ["Email Address"],
      example: "doctor@hospital.sa",
      parse: optionalTrim,
      validate: validEmail,
    },
    {
      key: "specialty",
      label: "Specialty",
      required: true,
      example: "Dermatology",
      parse: trim,
    },
    {
      key: "grade",
      label: "Grade",
      required: true,
      example: "A",
      parse: (value) => value.trim().toUpperCase(),
      validate: validGrade,
    },
    {
      key: "LicenseNumber",
      label: "License Number",
      aliases: ["License", "SCFHS License"],
      example: "LIC-10001",
      parse: optionalTrim,
    },
    {
      key: "avgPatientsPerDay",
      label: "Avg Patients Per Day",
      aliases: ["Average Patients", "Avg Patients"],
      example: "45",
      parse: parseNumber,
      validate: validPositiveNumber,
    },
    {
      key: "accountName",
      label: "Account / Facility",
      aliases: ["Account Name", "Facility", "Hospital"],
      required: true,
      example: "King Faisal Hospital",
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
      example: "Central Region",
      parse: trim,
    },
    {
      key: "subRegion",
      label: "Territory",
      aliases: ["Sub Region", "SubRegion"],
      required: true,
      example: "Riyadh 1",
      parse: trim,
    },
  ],
  duplicateChecks: [
    {
      label: "Phone",
      field: "phone",
      getExistingValue: (doctor) => doctor.phone,
      getPayloadValue: (payload) => payload.phone,
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
      district: territory.district,
      region: territory.region,
    };
  },
  getExistingLabel: (doctor) => doctor.nameEN || doctor.nameAR || doctor.id,
  getPayloadLabel: (payload) =>
    String(payload.nameEN || payload.nameAR || "Unnamed doctor"),
};
