import { UserRole } from "@/lib/types"

/**
 * Map user roles to their default dashboard routes
 */
export const ROLE_ROUTES: Record<UserRole, string> = {
  MANAGER: "/manager",
  SUPERVISOR: "/supervisor",
  MEDICAL_REP: "/rep",
};

/**
 * Get the redirect path for a given role
 */
export function getRoleRedirectPath(role: UserRole): string {
  return ROLE_ROUTES[role] || "/";
}
