"use client";

import { useTransition } from "react";
import { logoutAction } from "../api";

/**
 * Custom hook for handling user logout
 * Provides logout function with loading state
 */
export function useLogout() {
  const [isPending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return {
    logout,
    isPending,
  };
}
