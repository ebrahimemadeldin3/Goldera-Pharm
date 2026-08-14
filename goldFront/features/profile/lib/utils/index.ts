import { UserProfile } from "../types";

export type ProfileCompletionItem = {
  id: string;
  label: string;
  done: boolean;
};

/**
 * Deterministically derives profile completion from the fields the profile
 * actually exposes. No fabricated values.
 */
export function getProfileCompletionItems(
  profile: UserProfile,
): ProfileCompletionItem[] {
  return [
    {
      id: "basic",
      label: "Basic information",
      done: Boolean(profile.name?.trim() && profile.email?.trim()),
    },
    {
      id: "contact",
      label: "Contact details",
      done: Boolean(profile.phone?.trim() && profile.location?.trim()),
    },
    {
      id: "professional",
      label: "Professional info",
      done: Boolean(profile.department?.trim()),
    },
    {
      id: "bio",
      label: "Bio",
      done: Boolean(profile.bio?.trim()),
    },
    {
      id: "identification",
      label: "Identification",
      done: Boolean(
        profile.iqamaNumber?.trim() || profile.passportNumber?.trim(),
      ),
    },
    {
      id: "photo",
      label: "Profile photo",
      done: Boolean(profile.profileImage?.url),
    },
  ];
}

export function getProfileCompletionPercentage(profile: UserProfile): number {
  const items = getProfileCompletionItems(profile);
  const done = items.filter((item) => item.done).length;
  if (items.length === 0) return 0;
  return Math.round((done / items.length) * 100);
}

export function formatRole(role: string): string {
  return role.toLowerCase().replace(/_/g, " ");
}

export function getRoleHomePath(role: UserProfile["role"]): string {
  const rolePathMap: Record<UserProfile["role"], string> = {
    MANAGER: "/manager",
    SUPERVISOR: "/supervisor",
    MEDICAL_REP: "/rep",
  };

  return rolePathMap[role] ?? "/rep";
}

function parseProfileDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getTenureSummary(value?: string | null): string {
  const startDate = parseProfileDate(value);
  if (!startDate) return "Not set";

  const now = new Date();
  const totalMonths = Math.max(
    0,
    (now.getFullYear() - startDate.getFullYear()) * 12 +
      now.getMonth() -
      startDate.getMonth() -
      (now.getDate() < startDate.getDate() ? 1 : 0),
  );

  if (totalMonths < 1) return "New";
  if (totalMonths < 12) return `${totalMonths} mo`;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return months > 0 ? `${years} yr ${months} mo` : `${years} yr`;
}

export function getFreshnessLabel(value?: string | null): string {
  const date = parseProfileDate(value);
  if (!date) return "Never";

  const elapsedMs = Math.max(0, Date.now() - date.getTime());
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedDays === 0) return "Today";
  if (elapsedDays === 1) return "Yesterday";
  if (elapsedDays < 30) return `${elapsedDays} days ago`;
  if (elapsedDays < 365) return `${Math.floor(elapsedDays / 30)} mo ago`;

  return `${Math.floor(elapsedDays / 365)} yr ago`;
}

export const profileCardClass =
  "rounded-[16px] border border-[#E5E8EF] bg-white shadow-[0_8px_22px_rgba(24,32,51,0.05)]";
