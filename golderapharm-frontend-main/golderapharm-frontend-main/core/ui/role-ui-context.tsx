"use client";

import { createContext, useContext, useEffect } from "react";
import { roleThemeMap } from "@/core/role-config/role-theme";
import { roleSidebarMap } from "@/core/role-config/role-sidebar";
import { roleFeatureMap } from "@/core/role-config/role-features";
import { rolePlanStatsMap } from "@/core/role-config/role-plan-stats";
import { roleCoachingStatsMap } from "@/core/role-config/role-coaching-stats";
import { roleQuickActionsMap } from "@/core/role-config/role-quick-actions";
import { UserRole } from "@/lib/types";

type RoleUIContextValue = {
  role: UserRole;
  user: {
    name: string;
    email: string;
    profileImage?: {
      url: string;
      public_id: string;
    } | null;
  };
  theme: (typeof roleThemeMap)[UserRole];
  sidebar: (typeof roleSidebarMap)[UserRole];
  features: (typeof roleFeatureMap)[UserRole];
  planStats?: (typeof rolePlanStatsMap)[Exclude<UserRole, "MANAGER">];
  coachingStats: (typeof roleCoachingStatsMap)[UserRole];
  quickActions: (typeof roleQuickActionsMap)[UserRole];
};

const RoleUIContext = createContext<RoleUIContextValue | null>(null);

export function RoleUIProvider({
  role,
  user,
  children,
}: {
  role: UserRole;
  user: {
    name: string;
    email: string;
    profileImage?: {
      url: string;
      public_id: string;
    } | null;
  };
  children: React.ReactNode;
}) {
  // Apply role-based theme to document root
  useEffect(() => {
    if (!role) return; // <-- guard

    const root = document.documentElement;
    const theme = roleThemeMap[role];

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [role]);

  return (
    <RoleUIContext.Provider
      value={{
        role,
        user,
        theme: roleThemeMap[role],
        sidebar: roleSidebarMap[role],
        features: roleFeatureMap[role],
        planStats: role !== "MANAGER" ? rolePlanStatsMap[role] : undefined,
        coachingStats: roleCoachingStatsMap[role],
        quickActions: roleQuickActionsMap[role],
      }}
    >
      {children}
    </RoleUIContext.Provider>
  );
}

export function useRoleUI() {
  const ctx = useContext(RoleUIContext);
  if (!ctx) throw new Error("useRoleUI must be used inside RoleUIProvider");
  return ctx;
}
