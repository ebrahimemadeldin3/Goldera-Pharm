import { UserRole } from "@/lib/types";

export interface CloudinaryImage {
  url: string;
  public_id: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  dateOfBirth: string;
  dateOfRecruitment: string;
  department: string | null;
  location: string | null;
  bio: string | null;
  educationBackground: string | null;
  iqamaNumber: string | null;
  passportNumber: string | null;
  resume: string | null;
  certificates: string[];
  lastLogin: string | null;
  isActive: boolean;
  profileImage: CloudinaryImage | null;
  leaveStartDate: string | null;
  leaveEndDate: string | null;
  leaveDaysCountTotal: number;
  subRegionId: string | null;
  supervisorId: string | null;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  // Performance stats (to be added by backend in future)
  performance?: {
    teamPerformance: number;
    targetAchievement: number;
  };
}

export interface ProfileApiResponse {
  status: "success";
  message: string;
  data: UserProfile;
  token: string;
}
