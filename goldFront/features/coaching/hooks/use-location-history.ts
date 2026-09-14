"use client";

import { useCallback, useState } from "react";
import {
  getLocationSuggestions,
  getVisitLocationStorageKey,
  parseLocationHistory,
  recordLocation,
  type VisitLocationHistoryEntry,
} from "@/features/coaching/lib/visit-location/history";

export function useLocationHistory(userId: string) {
  const storageKey = getVisitLocationStorageKey(userId);
  const [entries, setEntries] = useState<VisitLocationHistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      return parseLocationHistory(window.localStorage.getItem(storageKey));
    } catch {
      return [];
    }
  });

  const persistEntries = useCallback(
    (nextEntries: VisitLocationHistoryEntry[]) => {
      setEntries(nextEntries);

      if (typeof window === "undefined") return;

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextEntries));
      } catch {
        // localStorage is an enhancement only.
      }
    },
    [storageKey],
  );

  const record = useCallback(
    (value: string) => {
      setEntries((currentEntries) => {
        const nextEntries = recordLocation(currentEntries, value);

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              storageKey,
              JSON.stringify(nextEntries),
            );
          } catch {
            // localStorage is an enhancement only.
          }
        }

        return nextEntries;
      });
    },
    [storageKey],
  );

  const suggestions = useCallback(
    (currentValue = "") => getLocationSuggestions(entries, currentValue),
    [entries],
  );

  return {
    entries,
    persistEntries,
    record,
    suggestions,
    storageKey,
  };
}
