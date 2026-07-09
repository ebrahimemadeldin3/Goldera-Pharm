import { DoctorApiResponse } from "../types/api";
import { DoctorProfileData, DoctorCardData } from "../types";

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
