"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LocateFixed,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatSaudiDateTimeDisplay } from "@/lib/utils";
import type {
  VisitCompletionLocation,
  VisitCompletionLocationErrorCode,
  VisitCompletionLocationStatus,
} from "@/features/visits/lib/types/location";
import {
  getVisitCompletionLocationAccuracyLabel,
  getVisitCompletionLocationErrorMessage,
  getVisitCompletionLocationMapUrl,
  VISIT_LOCATION_MAX_AGE_MS,
} from "@/features/visits/lib/utils/completion-location";

type VisitLocationVerificationProps = {
  status: VisitCompletionLocationStatus;
  location: VisitCompletionLocation | null;
  error: VisitCompletionLocationErrorCode | null;
  isFresh: boolean;
  disabled?: boolean;
  onVerify: () => void;
  onRefresh: () => void;
};

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function formatAccuracy(accuracy: number | null) {
  if (accuracy === null) {
    return "Unavailable";
  }

  const rounded =
    accuracy >= 10 ? Math.round(accuracy) : Number(accuracy.toFixed(1));

  return `+/-${rounded} m`;
}

function formatCapturedAt(capturedAt: string) {
  const date = new Date(capturedAt);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return formatSaudiDateTimeDisplay(date);
}

function freshnessMinutes() {
  return Math.max(1, Math.round(VISIT_LOCATION_MAX_AGE_MS / 60000));
}

function getErrorTitle(status: VisitCompletionLocationStatus) {
  switch (status) {
    case "permission-denied":
      return "Location Permission Required";
    case "timeout":
      return "Location Request Timed Out";
    case "unsupported":
      return "Location Not Supported";
    case "stale":
      return "Location Verification Expired";
    case "invalid":
      return "Invalid Location Data";
    case "unavailable":
    default:
      return "Current Location Unavailable";
  }
}

export default function VisitLocationVerification({
  status,
  location,
  error,
  isFresh,
  disabled = false,
  onVerify,
  onRefresh,
}: VisitLocationVerificationProps) {
  const isRequesting = status === "requesting";
  const isVerified = status === "verified" && location && isFresh;
  const isError =
    status !== "idle" && status !== "requesting" && status !== "verified";
  const mapUrl = isVerified ? getVisitCompletionLocationMapUrl(location) : null;
  const accuracy = location
    ? getVisitCompletionLocationAccuracyLabel(location.accuracy)
    : null;

  return (
    <section
      className={cn(
        "rounded-[14px] border bg-white p-4 shadow-none sm:p-5",
        isVerified
          ? "border-[#CBEFDD]"
          : isError
            ? "border-[#F5C9C5]"
            : "border-[#E5E8EF]",
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
              isVerified
                ? "bg-[#E9F8F1] text-[#168557]"
                : isError
                  ? "bg-[#FEF3F2] text-[#B42318]"
                  : "bg-[#F6F8FB] text-[#344054]",
            )}
          >
            {isVerified ? (
              <CheckCircle2 className="size-5" aria-hidden="true" />
            ) : isError ? (
              <AlertTriangle className="size-5" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-5" aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#182033]">
              Visit Completion Location
            </h2>
            {status === "idle" && (
              <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
                Verify your current location before completing this visit. Your
                location is captured only for this visit completion.
              </p>
            )}
            {isRequesting && (
              <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
                Getting your current location. Keep this page open while we
                verify your position.
              </p>
            )}
            {isVerified && (
              <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
                Device location captured successfully. This does not complete
                the visit until the report is submitted and accepted.
              </p>
            )}
            {isError && (
              <>
                <p className="mt-1 text-sm font-semibold text-[#182033]">
                  {getErrorTitle(status)}
                </p>
                <p className="mt-1 text-sm leading-6 font-medium text-[#667085]">
                  {getVisitCompletionLocationErrorMessage(
                    error || "unavailable",
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        <Button
          type="button"
          onClick={status === "verified" ? onRefresh : onVerify}
          disabled={disabled || isRequesting}
          className={cn(
            "h-10 shrink-0 rounded-[10px] px-4 text-xs font-semibold shadow-none focus-visible:ring-2 focus-visible:outline-none",
            isVerified
              ? "border border-[#CBEFDD] bg-white text-[#168557] hover:bg-[#E9F8F1] focus-visible:ring-[#168557]/25"
              : "bg-gp-rep-primary hover:bg-gp-rep-primary-hover text-white focus-visible:ring-gp-rep-primary/30",
          )}
          variant={isVerified ? "outline" : "default"}
        >
          {isRequesting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : status === "verified" || status === "stale" ? (
            <RefreshCcw className="size-4" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-4" aria-hidden="true" />
          )}
          {isRequesting
            ? "Verifying..."
            : status === "verified"
              ? "Refresh"
              : status === "stale"
                ? "Verify Again"
                : "Verify Current Location"}
        </Button>
      </div>

      {isVerified && location && (
        <div className="mt-4 grid gap-3 rounded-[12px] border border-[#EEF1F6] bg-[#FBFCFE] p-3 text-sm sm:grid-cols-3">
          <div className="min-w-0 sm:col-span-3">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Coordinates
            </p>
            <p className="mt-1 break-words font-semibold text-[#182033]">
              {formatCoordinate(location.latitude)},{" "}
              {formatCoordinate(location.longitude)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Accuracy
            </p>
            <p className="mt-1 font-semibold text-[#182033]">
              {formatAccuracy(location.accuracy)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Captured
            </p>
            <p className="mt-1 font-semibold text-[#182033]">
              {formatCapturedAt(location.capturedAt)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#667085] uppercase">
              Quality
            </p>
            <p
              className={cn(
                "mt-1 font-semibold",
                accuracy?.tone === "success"
                  ? "text-[#168557]"
                  : accuracy?.tone === "warning"
                    ? "text-[#8A6515]"
                    : "text-[#667085]",
              )}
            >
              {accuracy?.label}
            </p>
          </div>
          {accuracy?.helper && (
            <p className="text-sm leading-6 font-medium text-[#667085] sm:col-span-3">
              {accuracy.helper}
            </p>
          )}
          {mapUrl && (
            <div className="sm:col-span-3">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-[9px] border border-[#E5E8EF] bg-white px-3 text-xs font-semibold text-[#344054] transition-colors hover:border-[#CBEFDD] hover:bg-[#E9F8F1] hover:text-[#168557] focus-visible:ring-2 focus-visible:ring-[#168557]/25 focus-visible:outline-none"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                View on Map
              </a>
            </div>
          )}
        </div>
      )}

      {status === "idle" && (
        <p className="mt-3 text-xs leading-5 font-medium text-[#667085]">
          Location verification remains valid for {freshnessMinutes()} minutes.
          No background tracking is used.
        </p>
      )}
    </section>
  );
}
