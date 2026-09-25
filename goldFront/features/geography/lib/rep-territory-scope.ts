import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { PharmacyApiResponse } from "@/features/pharmacies/lib/types";
import type { UserProfile } from "@/features/profile/lib/types";
import { getTerritoryLookup } from "@/features/plan/lib/territory";
import type { Region, SubRegion } from "@/lib/types/regions";

export type RepTerritoryScope = {
  repId: string;
  subRegionId: string;
  subRegionName: string;
  regionId: string;
  regionName: string;
};

function normalizeScopeValue(value?: string | null) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeTerritoryName(value?: string | null) {
  const rawValue = value?.trim();
  if (!rawValue) return "";

  const territory = getTerritoryLookup(rawValue).territory || rawValue;
  return normalizeScopeValue(territory);
}

export function resolveRepTerritoryScope(
  profile: UserProfile | null | undefined,
  regions: Region[] | null | undefined,
): RepTerritoryScope | null {
  if (!profile?.subRegionId || !Array.isArray(regions)) {
    return null;
  }

  for (const region of regions) {
    const subRegion = region.subRegions.find(
      (item: SubRegion) => item.id === profile.subRegionId,
    );

    if (subRegion) {
      return {
        repId: profile.id,
        subRegionId: subRegion.id,
        subRegionName: subRegion.name,
        regionId: region.id,
        regionName: region.name,
      };
    }
  }

  return null;
}

export function isDoctorInRepTerritory(
  doctor: DoctorApiResponse,
  scope: RepTerritoryScope | null,
) {
  if (!scope) return false;

  const repTerritory = normalizeTerritoryName(scope.subRegionName);
  const doctorTerritory = normalizeTerritoryName(
    doctor.subRegion || doctor.area,
  );

  return Boolean(repTerritory && doctorTerritory === repTerritory);
}

export function isPharmacyInRepTerritory(
  pharmacy: PharmacyApiResponse,
  scope: RepTerritoryScope | null,
) {
  if (!scope) return false;

  const repTerritory = normalizeTerritoryName(scope.subRegionName);
  const pharmacyTerritory = normalizeTerritoryName(pharmacy.subRegion);

  return Boolean(repTerritory && pharmacyTerritory === repTerritory);
}

export function scopeDoctorsToRepTerritory(
  doctors: DoctorApiResponse[],
  scope: RepTerritoryScope | null,
) {
  return doctors.filter((doctor) => isDoctorInRepTerritory(doctor, scope));
}

export function scopePharmaciesToRepTerritory(
  pharmacies: PharmacyApiResponse[],
  scope: RepTerritoryScope | null,
) {
  return pharmacies.filter((pharmacy) =>
    isPharmacyInRepTerritory(pharmacy, scope),
  );
}
