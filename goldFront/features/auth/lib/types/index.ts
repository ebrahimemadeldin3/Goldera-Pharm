import { UserRole } from "@/lib/types";

export interface CloudinaryImage {
  url: string;
  public_id: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
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
}

export type NotificationItem = {
  id: string;
  type: "alert" | "drop" | "success" | "file";
  title: string;
  message: string;
  time: string;
  unread?: boolean;
};
