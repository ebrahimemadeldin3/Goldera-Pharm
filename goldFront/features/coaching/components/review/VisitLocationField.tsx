"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { MapPin, Search, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLocationHistory } from "@/features/coaching/hooks/use-location-history";
import { needsLocationSpecificityHint } from "@/features/coaching/lib/visit-location/history";
import { VisitLocationMapPicker } from "./VisitLocationMapPicker";

type VisitLocationFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange"
> & {
  value: string;
  userId: string;
  onValueChange: (value: string) => void;
};

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function splitLocationSummary(value: string) {
  const cleanValue = value.trim();
  const separator = cleanValue.includes(" - ") ? " - " : ",";
  const [primary, ...rest] = cleanValue.split(separator);

  return {
    primary: primary?.trim() || cleanValue,
    secondary: rest.join(separator).trim(),
  };
}

export const VisitLocationField = forwardRef<
  HTMLInputElement,
  VisitLocationFieldProps
>(function VisitLocationField(
  {
    id,
    value,
    userId,
    onValueChange,
    onBlur,
    className,
    disabled,
    ...inputProps
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const isMobile = useIsMobileViewport();
  const { record, suggestions } = useLocationHistory(userId);
  const locationSuggestions = suggestions("");
  const showSuggestions =
    isFocused &&
    !isConfirmed &&
    !value.trim() &&
    locationSuggestions.length > 0;
  const showSpecificityHint = needsLocationSpecificityHint(value);
  const summary = useMemo(() => splitLocationSummary(value), [value]);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  function focusInputSoon() {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleCommit(nextValue = value) {
    if (nextValue.trim()) record(nextValue);
  }

  function handleSelectValue(nextValue: string) {
    onValueChange(nextValue);
    record(nextValue);
    setIsConfirmed(true);
    setIsFocused(false);
  }

  const mapPicker = (
    <VisitLocationMapPicker
      value={value}
      onSelect={handleSelectValue}
      onClose={() => setMapOpen(false)}
    />
  );

  if (isConfirmed && value.trim()) {
    return (
      <div className="min-w-0" aria-live="polite">
        <div
          className={cn(
            "border-gp-border-control flex min-w-0 items-start gap-3 rounded-[12px] border bg-white px-3.5 py-3",
            className,
          )}
        >
          <span className="text-gp-text-muted bg-gp-surface-subtle border-gp-border-subtle mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] border">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-gp-navy-900 truncate text-sm leading-5 font-semibold">
              {summary.primary}
            </p>
            {summary.secondary && (
              <p className="text-gp-text-muted mt-0.5 truncate text-xs leading-4 font-medium">
                {summary.secondary}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsConfirmed(false);
              focusInputSoon();
            }}
            className="text-gp-navy-900 hover:text-gp-gold-700 focus-visible:ring-gp-gold-500/25 rounded-[8px] px-1 text-xs leading-5 font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-gp-text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            {...inputProps}
            id={id}
            ref={inputRef}
            value={value}
            disabled={disabled}
            onChange={(event) => {
              setIsConfirmed(false);
              onValueChange(event.target.value);
            }}
            onFocus={(event) => {
              setIsFocused(true);
              inputProps.onFocus?.(event);
            }}
            onBlur={(event) => {
              handleCommit(event.target.value);
              window.setTimeout(() => setIsFocused(false), 120);
              onBlur?.(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                handleCommit(event.currentTarget.value);
              inputProps.onKeyDown?.(event);
            }}
            placeholder="Search hospital, clinic, pharmacy, or type location..."
            className={cn(
              "coaching-control border-gp-border-control bg-gp-surface-control text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-11 rounded-[10px] pr-3 pl-9 text-sm font-medium shadow-none",
              className,
            )}
          />
        </div>

        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => setMapOpen(true)}
            className="text-gp-text-secondary hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 h-9 self-end rounded-[9px] px-2 text-xs font-semibold sm:self-auto"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            Find on map
          </Button>
        ) : (
          <Popover open={mapOpen} onOpenChange={setMapOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                className="text-gp-text-secondary hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 h-9 rounded-[9px] px-2 text-xs font-semibold"
              >
                <MapPin className="size-3.5" aria-hidden="true" />
                Find on map
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              collisionPadding={16}
              className="border-gp-border-default shadow-gp-popover max-h-[min(650px,calc(100dvh-32px))] w-[580px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-[14px] bg-white p-4"
            >
              {mapPicker}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {showSuggestions && (
        <div
          className="mt-2 flex flex-wrap gap-2"
          aria-label="Suggested locations"
        >
          {locationSuggestions.map((entry) => (
            <button
              key={entry.normalizedValue}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelectValue(entry.value)}
              className="border-gp-border-control bg-gp-surface-subtle text-gp-text-secondary hover:border-gp-gold-300 hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 rounded-[9px] border px-2.5 py-1.5 text-xs leading-4 font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 hover:bg-white focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              {entry.value}
            </button>
          ))}
        </div>
      )}

      {showSpecificityHint && (
        <p className="text-gp-warning mt-2 flex items-start gap-1.5 text-xs leading-5 font-medium">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Consider adding the facility, branch, department, or a more specific
          location.
        </p>
      )}

      <Sheet open={isMobile && mapOpen} onOpenChange={setMapOpen}>
        <SheetContent
          side="bottom"
          hideCloseButton
          className="border-gp-border-default max-h-[85dvh] rounded-t-[18px] bg-white p-0"
        >
          <div className="overflow-y-auto px-4 py-4">{mapPicker}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
});
