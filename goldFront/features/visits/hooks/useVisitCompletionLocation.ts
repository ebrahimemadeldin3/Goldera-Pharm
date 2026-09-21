"use client";

import { useCallback, useState } from "react";
import type {
  VisitCompletionLocation,
  VisitCompletionLocationErrorCode,
  VisitCompletionLocationStatus,
} from "@/features/visits/lib/types/location";
import {
  createVisitCompletionLocationFromPosition,
  getVisitCompletionLocationErrorCode,
  VISIT_COMPLETION_LOCATION_GEO_OPTIONS,
} from "@/features/visits/lib/utils/completion-location";

type VisitCompletionLocationState = {
  status: VisitCompletionLocationStatus;
  location: VisitCompletionLocation | null;
  errorCode: VisitCompletionLocationErrorCode | null;
};

const initialState: VisitCompletionLocationState = {
  status: "idle",
  location: null,
  errorCode: null,
};

export function useVisitCompletionLocation() {
  const [state, setState] =
    useState<VisitCompletionLocationState>(initialState);

  const captureLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const errorCode: VisitCompletionLocationErrorCode =
        "LOCATION_UNSUPPORTED";
      setState({ status: "error", location: null, errorCode });
      return { location: null, errorCode };
    }

    setState({ status: "requesting", location: null, errorCode: null });

    return new Promise<{
      location: VisitCompletionLocation | null;
      errorCode: VisitCompletionLocationErrorCode | null;
    }>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = createVisitCompletionLocationFromPosition(position);

          if (!location) {
            const errorCode: VisitCompletionLocationErrorCode =
              "LOCATION_UNAVAILABLE";
            setState({ status: "error", location: null, errorCode });
            resolve({ location: null, errorCode });
            return;
          }

          setState({ status: "captured", location, errorCode: null });
          resolve({ location, errorCode: null });
        },
        (error) => {
          const errorCode = getVisitCompletionLocationErrorCode(error);
          setState({ status: "error", location: null, errorCode });
          resolve({ location: null, errorCode });
        },
        VISIT_COMPLETION_LOCATION_GEO_OPTIONS,
      );
    });
  }, []);

  return {
    ...state,
    captureLocation,
  };
}
