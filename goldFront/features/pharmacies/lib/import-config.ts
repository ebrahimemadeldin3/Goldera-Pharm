import type {
  BulkImportConfig,
  TerritoryResolution,
} from "@/features/bulk-import/lib/types";
import type { CreatePharmacyDto, PharmacyApiResponse } from "./types";

export type PharmacyImportPayload = CreatePharmacyDto & {
  district?: string;
};

function trim(value: string) {
  return value.trim();
}

export const pharmacyImportConfig: BulkImportConfig<
  PharmacyApiResponse,
  PharmacyImportPayload
> = {
  entity: "pharmacy",
  title: "Import Pharmacies",
  description:
    "Upload an Excel file, validate pharmacy accounts against the territory hierarchy, then prepare the bulk import batch.",
  templateFileName: "golderapharm-pharmacies-import-template.csv",
  columns: [
    {
      key: "name",
      label: "Pharmacy Name",
      aliases: ["Name", "Account Name"],
      required: true,
      example: "Al Nahdi Pharmacy - Riyadh",
      parse: trim,
    },
    {
      key: "city",
      label: "City",
      required: true,
      example: "Riyadh",
      parse: trim,
    },
    {
      key: "country",
      label: "Country",
      required: true,
      example: "Saudi Arabia",
      parse: (value) => value.trim() || "Saudi Arabia",
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
      label: "Pharmacy name",
      field: "name",
      getExistingValue: (pharmacy) => pharmacy.name,
      getPayloadValue: (payload) => payload.name,
    },
  ],
  buildPayload: (
    row: Partial<PharmacyImportPayload>,
    territory: TerritoryResolution | null,
  ) => {
    if (!territory || !row.name || !row.city || !row.country) {
      return null;
    }

    return {
      name: String(row.name).trim(),
      city: String(row.city).trim(),
      country: String(row.country).trim() || "Saudi Arabia",
      subRegion: territory.territory,
      region: territory.region,
      district: territory.district,
    };
  },
  getExistingLabel: (pharmacy) => pharmacy.name || pharmacy.id,
  getPayloadLabel: (payload) => String(payload.name || "Unnamed pharmacy"),
};
