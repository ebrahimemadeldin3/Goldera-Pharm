import { User, UserApiResponse, RegionData } from "../types";

/**
 * Transform user API response to User format
 * Preserves all data from the backend response
 */
export function transformUserApiResponse(member: UserApiResponse): User {
  // Map region data from API response
  const region: RegionData = member.region
    ? {
        name: member.region.name,
        id: member.region.id,
        subRegion: member.region.subRegion
          ? {
              name: member.region.subRegion.name,
              id: member.region.subRegion.id,
            }
          : {
              name: "",
              id: "",
            },
      }
    : member.subRegion
      ? {
          name: member.location || "N/A",
          id: member.subRegion.regionId,
          subRegion: {
            name: member.subRegion.name,
            id: member.subRegion.id,
          },
        }
      : {
          name: member.location || "N/A",
          id: member.regionId || "",
          subRegion: {
            name: "",
            id: member.subRegionId || "",
          },
        };

  return {
    // Core Identity
    id: member.id,
    name: member.name,
    email: member.email,
    phone: member.phone || "",
    role: member.role,
    isActive: member.isActive,
    inHR: member.inHR,

    // Location & Organization
    region,
    department: member.department || undefined,
    location: member.location || undefined,

    // Relationships
    supervisorId: member.supervisorId || undefined,
    managerId: member.managerId || undefined,

    // Personal Information
    dateOfBirth: member.dateOfBirth || undefined,
    bio: member.bio || undefined,
    education: member.educationBackground || undefined,
    iqama: member.iqamaNumber || undefined,
    passport: member.passportNumber || undefined,
    avatar: member.profileImage?.url || undefined,

    // Employment Details
    joinedDate: member.dateOfRecruitment,
    dateOfRecruitment: member.dateOfRecruitment,

    // Documents
    resume: member.resume || undefined,
    certificates: Array.isArray(member.certificates)
      ? member.certificates.join(", ")
      : member.certificates || undefined,

    // Account & System Info
    lastLogin: member.lastLogin || undefined,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}
