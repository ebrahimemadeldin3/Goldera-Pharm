export type VisitCompletionLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
};

export type VisitCompletionLocationErrorCode =
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "invalid"
  | "stale";

export type VisitCompletionLocationStatus =
  | "idle"
  | "requesting"
  | "verified"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "invalid"
  | "stale";
