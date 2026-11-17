import { ApiError } from "./apiError.js";

export function validateMarketingDoctorQuery(query = {}) {
  const search =
    typeof query.search === "string" ? query.search.trim() : "";
  if (search.length > 200) {
    throw new ApiError("Search query is too long", 400);
  }

  const facilityId =
    typeof query.facilityId === "string" ? query.facilityId.trim() : "";

  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError("page must be a positive integer", 400);
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError("limit must be an integer between 1 and 100", 400);
  }

  return {
    search,
    facilityId,
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function formatDoctorFacilityList(doctor) {
  const facilities = [];

  if (doctor.accounts?.id && doctor.accounts?.name) {
    facilities.push({
      id: doctor.accounts.id,
      name: doctor.accounts.name,
    });
  }

  if (doctor.accountName && doctor.accountName.trim()) {
    const name = doctor.accountName.trim();
    const alreadyHasName = facilities.some(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (!alreadyHasName) {
      facilities.push({
        id: doctor.accountsId || `name:${name}`,
        name,
      });
    }
  }

  return facilities;
}

export function mapMarketingDoctorOption(doctor) {
  const nameEN = doctor.nameEN?.trim() || null;
  const nameAR = doctor.nameAR?.trim() || null;
  const displayName = nameEN || nameAR || "Unnamed Doctor";
  return {
    id: doctor.id,
    displayName,
    nameEN,
    nameAR,
    specialty: doctor.specialty?.trim() || null,
    facilities: formatDoctorFacilityList(doctor),
  };
}

export function buildMarketingDoctorWhere({
  search,
  facilityId,
  matchingFacilityNames = [],
}) {
  const andConditions = [{ isActive: true }];

  if (search) {
    andConditions.push({
      OR: [
        { nameEN: { contains: search, mode: "insensitive" } },
        { nameAR: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (facilityId) {
    if (facilityId.startsWith("name:")) {
      const rawName = facilityId.slice(5);
      andConditions.push({
        accountName: { equals: rawName, mode: "insensitive" },
      });
    } else {
      andConditions.push({
        OR: [
          { accountsId: facilityId },
          ...(matchingFacilityNames.length
            ? matchingFacilityNames.map((name) => ({
                accountName: { equals: name, mode: "insensitive" },
              }))
            : []),
        ],
      });
    }
  }

  return { AND: andConditions };
}
