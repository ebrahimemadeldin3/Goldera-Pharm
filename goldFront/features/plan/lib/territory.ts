import type { Doctor } from "@/features/plan/api/get";

export type TerritoryNode = {
  name: string;
};

export type RegionNode = {
  name: string;
  territories: TerritoryNode[];
};

export type DistrictNode = {
  name: string;
  regions: RegionNode[];
};

export type TerritoryLookup = {
  district: string;
  region: string;
  territory: string;
  isKnown: boolean;
};

export type TerritoryDoctor = {
  doctor: Doctor;
  territory: TerritoryLookup;
};

export type TerritoryGroup = {
  name: string;
  doctors: TerritoryDoctor[];
  territory: TerritoryLookup;
};

export type RegionGroup = {
  name: string;
  district: string;
  doctors: TerritoryDoctor[];
  territories: TerritoryGroup[];
};

export type DistrictGroup = {
  name: string;
  doctors: TerritoryDoctor[];
  regions: RegionGroup[];
};

export type TerritoryAnalytics = {
  totalDoctors: number;
  doctors: TerritoryDoctor[];
  districts: DistrictGroup[];
  regions: RegionGroup[];
  territories: TerritoryGroup[];
  districtCount: number;
  regionCount: number;
  territoryCount: number;
};

export const UNASSIGNED_DISTRICT = "Unassigned";
export const UNASSIGNED_REGION = "Unassigned";
export const UNASSIGNED_TERRITORY = "Unassigned Territory";

export const KSA_TERRITORY_STRUCTURE: DistrictNode[] = [
  {
    name: "Central & Eastern District",
    regions: [
      {
        name: "Central Region",
        territories: [{ name: "Riyadh 1" }, { name: "Riyadh 2" }],
      },
      {
        name: "Eastern Region",
        territories: [{ name: "Eastern 1" }, { name: "Eastern 2" }],
      },
    ],
  },
  {
    name: "Western & Southern District",
    regions: [
      {
        name: "Western Region",
        territories: [
          { name: "Jeddah 1" },
          { name: "Jeddah 2" },
          { name: "Makkah / Taif" },
          { name: "Madinah" },
        ],
      },
      {
        name: "Southern Region",
        territories: [{ name: "Southern Area" }],
      },
    ],
  },
];

const territoryAliases: Record<string, string> = {
  "riyadh1": "Riyadh 1",
  "riyadh 1": "Riyadh 1",
  "riyadh-1": "Riyadh 1",
  "riyadh2": "Riyadh 2",
  "riyadh 2": "Riyadh 2",
  "riyadh-2": "Riyadh 2",
  "eastern1": "Eastern 1",
  "eastern 1": "Eastern 1",
  "eastern-1": "Eastern 1",
  "eastern2": "Eastern 2",
  "eastern 2": "Eastern 2",
  "eastern-2": "Eastern 2",
  "jeddah1": "Jeddah 1",
  "jeddah 1": "Jeddah 1",
  "jeddah-1": "Jeddah 1",
  "jeddah2": "Jeddah 2",
  "jeddah 2": "Jeddah 2",
  "jeddah-2": "Jeddah 2",
  "makkah taif": "Makkah / Taif",
  "makkah / taif": "Makkah / Taif",
  "makkah-taif": "Makkah / Taif",
  makkah: "Makkah / Taif",
  taif: "Makkah / Taif",
  medinah: "Madinah",
  madina: "Madinah",
  "al madinah": "Madinah",
  southern: "Southern Area",
  "southern area": "Southern Area",
  "southern-area": "Southern Area",
  gizan: "Southern Area",
  jizan: "Southern Area",
  abha: "Southern Area",
};

const regionAliases: Record<string, string> = {
  central: "Central Region",
  "central region": "Central Region",
  eastern: "Eastern Region",
  "eastern region": "Eastern Region",
  western: "Western Region",
  "western region": "Western Region",
  southern: "Southern Region",
  "southern region": "Southern Region",
};

function normalizeKey(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[ـ]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ");
}

export function normalizeTerritoryName(value?: string | null) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return UNASSIGNED_TERRITORY;

  const key = normalizeKey(trimmed);
  return territoryAliases[key] ?? trimmed;
}

export function normalizeRegionName(value?: string | null) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return UNASSIGNED_REGION;

  const key = normalizeKey(trimmed);
  return regionAliases[key] ?? trimmed;
}

const territoryLookup = new Map<string, TerritoryLookup>();

KSA_TERRITORY_STRUCTURE.forEach((district) => {
  district.regions.forEach((region) => {
    region.territories.forEach((territory) => {
      territoryLookup.set(normalizeKey(territory.name), {
        district: district.name,
        region: region.name,
        territory: territory.name,
        isKnown: true,
      });
    });
  });
});

export function getTerritoryLookup(value?: string | null): TerritoryLookup {
  const normalized = normalizeTerritoryName(value);
  const match = territoryLookup.get(normalizeKey(normalized));

  if (match) return match;

  return {
    district: UNASSIGNED_DISTRICT,
    region: UNASSIGNED_REGION,
    territory: normalized,
    isKnown: false,
  };
}

export function getDistrictForTerritory(value?: string | null) {
  return getTerritoryLookup(value).district;
}

export function getRegionForTerritory(value?: string | null) {
  return getTerritoryLookup(value).region;
}

function sortGroups<T extends { name: string; doctors: TerritoryDoctor[] }>(
  groups: T[],
) {
  return groups.sort((a, b) => {
    if (a.name === UNASSIGNED_DISTRICT || a.name === UNASSIGNED_REGION) return 1;
    if (b.name === UNASSIGNED_DISTRICT || b.name === UNASSIGNED_REGION) return -1;
    return b.doctors.length - a.doctors.length || a.name.localeCompare(b.name);
  });
}

export function getDoctorTerritory(doctor: Doctor): TerritoryLookup {
  return getTerritoryLookup(doctor.subRegion || doctor.area);
}

export function getTerritoryDoctor(doctor: Doctor): TerritoryDoctor {
  return {
    doctor,
    territory: getDoctorTerritory(doctor),
  };
}

export function getPlanTerritoryAnalytics(
  selectedDoctors: Doctor[] = [],
): TerritoryAnalytics {
  const doctors = selectedDoctors.map(getTerritoryDoctor);
  const districtMap = new Map<string, DistrictGroup>();

  doctors.forEach((entry) => {
    const districtName = entry.territory.district;
    const regionName = entry.territory.region;
    const territoryName = entry.territory.territory;

    const district = districtMap.get(districtName) ?? {
      name: districtName,
      doctors: [],
      regions: [],
    };
    district.doctors.push(entry);
    districtMap.set(districtName, district);

    let region = district.regions.find((item) => item.name === regionName);
    if (!region) {
      region = {
        name: regionName,
        district: districtName,
        doctors: [],
        territories: [],
      };
      district.regions.push(region);
    }
    region.doctors.push(entry);

    let territory = region.territories.find(
      (item) => item.name === territoryName,
    );
    if (!territory) {
      territory = {
        name: territoryName,
        doctors: [],
        territory: entry.territory,
      };
      region.territories.push(territory);
    }
    territory.doctors.push(entry);
  });

  const districts = sortGroups(Array.from(districtMap.values())).map(
    (district) => ({
      ...district,
      regions: sortGroups(district.regions).map((region) => ({
        ...region,
        territories: sortGroups(region.territories),
      })),
    }),
  );

  const regions = districts.flatMap((district) => district.regions);
  const territories = regions.flatMap((region) => region.territories);

  return {
    totalDoctors: doctors.length,
    doctors,
    districts,
    regions,
    territories,
    districtCount: districts.length,
    regionCount: regions.length,
    territoryCount: territories.length,
  };
}

export function getRegionOptionsForDistrict(districtName: string) {
  if (districtName === "all") {
    return KSA_TERRITORY_STRUCTURE.flatMap((district) => district.regions);
  }

  return (
    KSA_TERRITORY_STRUCTURE.find((district) => district.name === districtName)
      ?.regions ?? []
  );
}

export function getTerritoryOptionsForRegion(regionName: string) {
  if (regionName === "all") {
    return KSA_TERRITORY_STRUCTURE.flatMap((district) =>
      district.regions.flatMap((region) => region.territories),
    );
  }

  return (
    KSA_TERRITORY_STRUCTURE.flatMap((district) => district.regions).find(
      (region) => region.name === regionName,
    )?.territories ?? []
  );
}

export function planContainsTerritoryFilter(
  selectedDoctors: Doctor[] = [],
  filters: { district?: string; region?: string; territory?: string },
) {
  const analytics = getPlanTerritoryAnalytics(selectedDoctors);

  return analytics.doctors.some((entry) => {
    if (filters.district && entry.territory.district !== filters.district) {
      return false;
    }
    if (filters.region && entry.territory.region !== filters.region) {
      return false;
    }
    if (filters.territory && entry.territory.territory !== filters.territory) {
      return false;
    }
    return true;
  });
}
