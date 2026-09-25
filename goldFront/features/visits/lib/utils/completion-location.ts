import type {
  VisitCompletionLocation,
  VisitCompletionLocationErrorCode,
} from "@/features/visits/lib/types/location";

export const VISIT_COMPLETION_LOCATION_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
};

export const VISIT_LOCATION_MAX_AGE_MS = 5 * 60 * 1000;

export const VISIT_LOCATION_ACCURACY_THRESHOLDS_METERS = {
  good: 50,
  moderate: 100,
} as const;

type RawCompletionLocation = Partial<
  Record<keyof VisitCompletionLocation, unknown>
>;

function isRecord(value: unknown): value is RawCompletionLocation {
  return typeof value === "object" && value !== null;
}

function isValidLatitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function normalizeAccuracy(value: unknown): number | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return value;
}

function normalizeCapturedAt(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return value;
}

export function normalizeVisitCompletionLocation(
  value: unknown,
): VisitCompletionLocation | null {
  if (!isRecord(value)) {
    return null;
  }

  const { latitude, longitude } = value;
  const accuracy = normalizeAccuracy(value.accuracy);
  const capturedAt = normalizeCapturedAt(value.capturedAt);

  if (
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude) ||
    accuracy === undefined ||
    capturedAt === undefined
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy,
    capturedAt,
  };
}

export function isValidVisitCompletionLocation(
  value: unknown,
): value is VisitCompletionLocation {
  return normalizeVisitCompletionLocation(value) !== null;
}

export function createVisitCompletionLocationFromPosition(
  position: GeolocationPosition,
): VisitCompletionLocation | null {
  return normalizeVisitCompletionLocation({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
    capturedAt: new Date().toISOString(),
  });
}

export function getVisitCompletionLocationMapUrl(
  location: VisitCompletionLocation | null | undefined,
): string | null {
  const normalized = normalizeVisitCompletionLocation(location);

  if (!normalized) {
    return null;
  }

  const query = `${normalized.latitude},${normalized.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getVisitCompletionLocationErrorCode(
  error: GeolocationPositionError,
): VisitCompletionLocationErrorCode {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "permission-denied";
    case error.POSITION_UNAVAILABLE:
      return "unavailable";
    case error.TIMEOUT:
      return "timeout";
    default:
      return "unavailable";
  }
}

export function getVisitCompletionLocationErrorMessage(
  code: VisitCompletionLocationErrorCode,
): string {
  switch (code) {
    case "permission-denied":
      return "Location access is required to complete this visit. Enable location permission for GolderaPharm in your browser/device settings, then try again.";
    case "timeout":
      return "We couldn't get your current location in time.";
    case "unsupported":
      return "This browser cannot provide the location required to complete the visit.";
    case "invalid":
      return "The browser returned invalid location data. Try verifying your current location again.";
    case "stale":
      return "Your location was verified some time ago. Verify your current location again before completing this visit.";
    case "unavailable":
    default:
      return "We couldn't determine your current position. Check that location services are enabled on your device and try again.";
  }
}

export function isFreshVisitCompletionLocation(
  location: VisitCompletionLocation | null | undefined,
  now = Date.now(),
): boolean {
  const normalized = normalizeVisitCompletionLocation(location);

  if (!normalized) {
    return false;
  }

  const capturedAt = Date.parse(normalized.capturedAt);

  return (
    Number.isFinite(capturedAt) &&
    now - capturedAt >= 0 &&
    now - capturedAt <= VISIT_LOCATION_MAX_AGE_MS
  );
}

export function getVisitCompletionLocationAccuracyLabel(
  accuracy: number | null,
) {
  if (accuracy === null) {
    return {
      label: "Accuracy unavailable",
      tone: "muted" as const,
      helper: "The browser did not report an accuracy radius.",
    };
  }

  if (accuracy <= VISIT_LOCATION_ACCURACY_THRESHOLDS_METERS.good) {
    return {
      label: "Good accuracy",
      tone: "success" as const,
      helper: "Device location captured successfully.",
    };
  }

  if (accuracy <= VISIT_LOCATION_ACCURACY_THRESHOLDS_METERS.moderate) {
    return {
      label: "Moderate accuracy",
      tone: "warning" as const,
      helper: "Device location captured. You can refresh for a more precise position.",
    };
  }

  return {
    label: "Low accuracy",
    tone: "warning" as const,
    helper:
      "Location accuracy is low. Move to an open area or ensure precise location is enabled, then try again for a more accurate position.",
  };
}
