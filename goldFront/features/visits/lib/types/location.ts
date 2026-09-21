export type VisitCompletionLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string | null;
};

export type VisitCompletionLocationErrorCode =
  | "LOCATION_PERMISSION_DENIED"
  | "LOCATION_UNAVAILABLE"
  | "LOCATION_TIMEOUT"
  | "LOCATION_UNSUPPORTED";

export type VisitCompletionLocationStatus =
  "idle" | "requesting" | "captured" | "error";
