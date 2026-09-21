import type {
  VisitCompletionLocation,
  VisitCompletionLocationErrorCode,
} from "@/features/visits/lib/types/location";

export const VISIT_COMPLETION_LOCATION_GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

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

function normalizeCapturedAt(value: unknown): string | null | undefined {
  if (value === null || value === undefined) {
    return null;
  }

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
      return "LOCATION_PERMISSION_DENIED";
    case error.POSITION_UNAVAILABLE:
      return "LOCATION_UNAVAILABLE";
    case error.TIMEOUT:
      return "LOCATION_TIMEOUT";
    default:
      return "LOCATION_UNAVAILABLE";
  }
}

export function getVisitCompletionLocationErrorMessage(
  code: VisitCompletionLocationErrorCode,
): string {
  switch (code) {
    case "LOCATION_PERMISSION_DENIED":
      return "Location permission was denied. The visit report can still be submitted.";
    case "LOCATION_TIMEOUT":
      return "Location capture timed out. The visit report can still be submitted.";
    case "LOCATION_UNSUPPORTED":
      return "Location capture is not supported by this browser. The visit report can still be submitted.";
    case "LOCATION_UNAVAILABLE":
    default:
      return "Completion location is unavailable right now. The visit report can still be submitted.";
  }
}
