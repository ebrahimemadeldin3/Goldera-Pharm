"use client";

import { useTransition } from "react";
import { createVisitAction } from "../api";
import { VisitFormValues } from "../lib/schemas";
import type { CreateVisitResponse } from "../lib/types/api";

type CreateVisitResult =
  | {
      success: true;
      data: CreateVisitResponse["data"];
    }
  | {
      success: false;
      error?: { message?: string };
    };

/**
 * Custom hook for handling visit creation
 * Provides createVisit function with loading state and error handling
 */
export function useCreateVisit() {
  const [isPending, startTransition] = useTransition();

  const createVisit = async (data: VisitFormValues) => {
    return new Promise<CreateVisitResult>((resolve) => {
      startTransition(async () => {
        const result = await createVisitAction(data);
        resolve(result as CreateVisitResult);
      });
    });
  };

  return {
    createVisit,
    isPending,
  };
}
