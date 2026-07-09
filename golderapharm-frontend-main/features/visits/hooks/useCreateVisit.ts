"use client";

import { useTransition } from "react";
import { createVisitAction } from "../api";
import { VisitFormValues } from "../lib/schemas";

/**
 * Custom hook for handling visit creation
 * Provides createVisit function with loading state and error handling
 */
export function useCreateVisit() {
  const [isPending, startTransition] = useTransition();

  const createVisit = async (data: VisitFormValues) => {
    return new Promise<{ success: boolean; error?: { message: string } }>(
      (resolve) => {
        startTransition(async () => {
          const result = await createVisitAction(data);
          resolve(result);
        });
      },
    );
  };

  return {
    createVisit,
    isPending,
  };
}
