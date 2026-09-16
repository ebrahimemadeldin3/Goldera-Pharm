import { DoctorApiResponse } from "../types/api";
import { DoctorProfileData, DoctorCardData } from "../types";
import {
  getTerritoryLookup,
  type TerritoryLookup,
} from "@/features/plan/lib/territory";

export type DoctorDirectoryData = DoctorCardData & {
  createdAt?: string;
  territory: TerritoryLookup;
};

function normalizeDirectoryText(value?: string | null) {
  const normalized = String(value ?? "").trim();

  return normalized &&
    normalized.toLowerCase() !== "undefined" &&
    normalized.toLowerCase() !== "null"
    ? normalized
    : "";
}

/**
 * Map DoctorApiResponse to DoctorProfileData
 */
export function mapToDoctorProfile(
  doctor: DoctorApiResponse,
): DoctorProfileData {
  return {
    id: doctor.id,
    nameAR: doctor.nameAR,
    nameEN: doctor.nameEN,
    email: doctor.email,
    phone: doctor.phone,
    grade: doctor.grade,
    avgPatientsPerDay: doctor.avgPatientsPerDay,
    specialty: doctor.specialty,
    planId: doctor.planId,
    LicenseNumber: doctor.LicenseNumber,
    latitude: doctor.latitude,
    longitude: doctor.longitude,
    isActive: doctor.isActive,
    accountName: doctor.accountName,
    subRegion: doctor.subRegion,
    area: doctor.area,
    accountsId: doctor.accountsId,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
    visits: doctor.visits,
    plan: doctor.plan,
    coachings: doctor.coachings,
  };
}

/**
 * Map DoctorApiResponse to DoctorCardData
 */
export function mapToDoctorCard(doctor: DoctorApiResponse): DoctorCardData {
  return {
    id: doctor.id,
    nameAR: doctor.nameAR,
    nameEN: doctor.nameEN,
    specialty: doctor.specialty,
    subRegion: doctor.subRegion,
    phone: doctor.phone,
    email: doctor.email,
    grade: doctor.grade,
    avgPatientsPerDay: doctor.avgPatientsPerDay,
    accountName: doctor.accountName,
    area: doctor.area,
  };
}

export function normalizeDoctorForDirectory(
  doctor: DoctorApiResponse,
): DoctorDirectoryData {
  const subRegion = normalizeDirectoryText(doctor.subRegion);
  const area = normalizeDirectoryText(doctor.area);

  return {
    id: doctor.id,
    nameAR: normalizeDirectoryText(doctor.nameAR),
    nameEN: normalizeDirectoryText(doctor.nameEN),
    specialty: normalizeDirectoryText(doctor.specialty),
    subRegion,
    phone: normalizeDirectoryText(doctor.phone),
    email: normalizeDirectoryText(doctor.email) || null,
    grade: normalizeDirectoryText(doctor.grade),
    avgPatientsPerDay: doctor.avgPatientsPerDay,
    accountName: normalizeDirectoryText(doctor.accountName),
    area: area || null,
    createdAt: doctor.createdAt,
    territory: getTerritoryLookup(subRegion || area),
  };
}
