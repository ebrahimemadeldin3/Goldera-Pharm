"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  VisitCompletionLocation,
  VisitCompletionLocationErrorCode,
  VisitCompletionLocationStatus,
} from "@/features/visits/lib/types/location";
import {
  createVisitCompletionLocationFromPosition,
  getVisitCompletionLocationErrorCode,
  isFreshVisitCompletionLocation,
  VISIT_COMPLETION_LOCATION_GEO_OPTIONS,
} from "@/features/visits/lib/utils/completion-location";

type VisitCompletionLocationState = {
  status: VisitCompletionLocationStatus;
  location: VisitCompletionLocation | null;
  error: VisitCompletionLocationErrorCode | null;
};

const initialState: VisitCompletionLocationState = {
  status: "idle",
  location: null,
  error: null,
};

type CaptureResult = {
  location: VisitCompletionLocation | null;
  error: VisitCompletionLocationErrorCode | null;
};

export function useVisitCompletionLocation() {
  const [state, setState] =
    useState<VisitCompletionLocationState>(initialState);
  const requestRef = useRef<Promise<CaptureResult> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((nextState: VisitCompletionLocationState) => {
    if (mountedRef.current) {
      setState(nextState);
    }
  }, []);

  const captureLocation = useCallback(async () => {
    if (requestRef.current) {
      return requestRef.current;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const error: VisitCompletionLocationErrorCode = "unsupported";
      setSafeState({ status: "unsupported", location: null, error });
      return { location: null, error };
    }

    setSafeState({ status: "requesting", location: null, error: null });

    requestRef.current = new Promise<CaptureResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = createVisitCompletionLocationFromPosition(position);

          if (!location) {
            const error: VisitCompletionLocationErrorCode = "invalid";
            setSafeState({ status: "invalid", location: null, error });
            resolve({ location: null, error });
            return;
          }

          setSafeState({ status: "verified", location, error: null });
          resolve({ location, error: null });
        },
        (error) => {
          const errorCode = getVisitCompletionLocationErrorCode(error);
          setSafeState({
            status: errorCode,
            location: null,
            error: errorCode,
          });
          resolve({ location: null, error: errorCode });
        },
        VISIT_COMPLETION_LOCATION_GEO_OPTIONS,
      );
    }).finally(() => {
      requestRef.current = null;
    });

    return requestRef.current;
  }, [setSafeState]);

  const clearLocation = useCallback(() => {
    setSafeState(initialState);
  }, [setSafeState]);

  const markStale = useCallback(() => {
    setSafeState({
      status: "stale",
      location: state.location,
      error: "stale",
    });
  }, [setSafeState, state.location]);

  const isFresh = useMemo(
    () => state.status === "verified" && isFreshVisitCompletionLocation(state.location),
    [state.location, state.status],
  );

  return {
    ...state,
    errorCode: state.error,
    captureLocation,
    refreshLocation: captureLocation,
    clearLocation,
    markStale,
    isFresh,
  };
}
