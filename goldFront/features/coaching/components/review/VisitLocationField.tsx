"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
} from "react";
import {
  Building2,
  Clock3,
  Hospital,
  Pill,
  Search,
  Stethoscope,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocationHistory } from "@/features/coaching/hooks/use-location-history";
import { needsLocationSpecificityHint } from "@/features/coaching/lib/visit-location/history";
import {
  rankLocationSuggestions,
  type LocationSuggestion,
} from "@/features/coaching/lib/visit-location/suggestions";
import type { User } from "@/features/team/lib/types";

type VisitLocationFieldProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "value" | "onChange"
> & {
  locationSuggestions?: LocationSuggestion[];
  selectedDoctorId?: string;
  selectedRep?: User;
  suggestionsLoading?: boolean;
  suggestionsUnavailable?: boolean;
  value: string;
  userId: string;
  onValueChange: (value: string) => void;
};

function getSuggestionIcon(type: LocationSuggestion["type"]) {
  if (type === "recent") return Clock3;
  if (type === "pharmacy") return Pill;
  if (type === "hospital") return Hospital;
  if (type === "clinic") return Stethoscope;
  return Building2;
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function recentEntryToSuggestion(value: string): LocationSuggestion {
  return {
    id: `recent-${normalizeKey(value)}`,
    name: value,
    type: "recent",
    searchText: normalizeKey(value),
  };
}

function suggestionTypeLabel(type: LocationSuggestion["type"]) {
  if (type === "recent") return "Recent";
  if (type === "pharmacy") return "Pharmacy";
  if (type === "hospital") return "Hospital";
  if (type === "clinic") return "Clinic";
  if (type === "facility") return "Facility";
  return "Location";
}

function suggestionMeta(suggestion: LocationSuggestion) {
  return [
    suggestionTypeLabel(suggestion.type),
    suggestion.city,
    suggestion.territory,
    suggestion.region,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(" • ");
}

export const VisitLocationField = forwardRef<
  HTMLInputElement,
  VisitLocationFieldProps
>(function VisitLocationField(
  {
    id,
    value,
    userId,
    locationSuggestions = [],
    selectedDoctorId,
    selectedRep,
    suggestionsLoading = false,
    suggestionsUnavailable = false,
    onValueChange,
    onBlur,
    className,
    disabled,
    ...inputProps
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id ?? inputProps.name ?? "visit-location"}-suggestions`;
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const {
    record,
    remove,
    suggestions: recentSuggestions,
  } = useLocationHistory(userId);
  const recentEntries = recentSuggestions(value);
  const showSpecificityHint = needsLocationSpecificityHint(value);
  const availableSuggestions = useMemo(() => {
    const suggestionsByName = new Map<string, LocationSuggestion>();

    recentEntries.forEach((entry) => {
      const cleanValue = entry.value.trim();
      if (!cleanValue) return;
      suggestionsByName.set(normalizeKey(cleanValue), recentEntryToSuggestion(cleanValue));
    });
    locationSuggestions.forEach((suggestion) => {
      const key = normalizeKey(suggestion.name);
      if (!suggestionsByName.has(key)) suggestionsByName.set(key, suggestion);
    });

    return Array.from(suggestionsByName.values());
  }, [locationSuggestions, recentEntries]);
  const suggestions = useMemo(
    () =>
      rankLocationSuggestions(availableSuggestions, value, {
        selectedDoctorId,
        selectedRep,
      }),
    [availableSuggestions, selectedDoctorId, selectedRep, value],
  );
  const hasTypedValue = value.trim().length > 0;
  const showUseEntered = hasTypedValue;
  const showDropdown =
    dropdownOpen &&
    (suggestions.length > 0 ||
      suggestionsLoading ||
      suggestionsUnavailable ||
      showUseEntered);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (!dropdownOpen) setActiveIndex(-1);
    else setActiveIndex(suggestions.length ? 0 : -1);
  }, [dropdownOpen, suggestions.length]);

  function commitLocation(nextValue = value) {
    const trimmed = nextValue.trim();
    if (trimmed) record(trimmed);
  }

  function selectLocation(nextValue: string) {
    onValueChange(nextValue);
    commitLocation(nextValue);
    setDropdownOpen(false);
    setIsFocused(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeRecentLocation(nextValue: string) {
    remove(nextValue);
    setDropdownOpen(true);
    setIsFocused(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeDropdownSoon() {
    window.setTimeout(() => {
      if (dropdownRef.current?.contains(document.activeElement)) return;
      setDropdownOpen(false);
      setIsFocused(false);
    }, 120);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (dropdownOpen) {
        event.preventDefault();
        setDropdownOpen(false);
      }
      inputProps.onKeyDown?.(event);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDropdownOpen(true);
      if (suggestions.length) {
        setActiveIndex((index) => (index + 1) % suggestions.length);
      }
      inputProps.onKeyDown?.(event);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setDropdownOpen(true);
      if (suggestions.length) {
        setActiveIndex((index) =>
          index <= 0 ? suggestions.length - 1 : index - 1,
        );
      }
      inputProps.onKeyDown?.(event);
      return;
    }

    if (event.key === "Enter" && dropdownOpen && activeIndex >= 0) {
      event.preventDefault();
      selectLocation(suggestions[activeIndex].name);
      inputProps.onKeyDown?.(event);
      return;
    }

    if (event.key === "Enter") {
      commitLocation(event.currentTarget.value);
    }

    inputProps.onKeyDown?.(event);
  }

  return (
    <div className="relative min-w-0">
      <div className="relative min-w-0">
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
            onValueChange(event.target.value);
            setDropdownOpen(true);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            setDropdownOpen(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            commitLocation(event.target.value);
            closeDropdownSoon();
            onBlur?.(event);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search or type a visit location..."
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
          }
          className={cn(
            "coaching-control border-gp-border-control bg-gp-surface-control text-gp-navy-900 placeholder:text-gp-text-placeholder hover:border-gp-gold-300 focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-12 rounded-[11px] pr-10 pl-9 text-sm font-medium shadow-none",
            className,
          )}
        />
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onValueChange("");
              setDropdownOpen(true);
              inputRef.current?.focus();
            }}
            className="text-gp-text-muted hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Clear visit location"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          id={listboxId}
          role="listbox"
          aria-label="Suggested visit locations"
          className="border-gp-border-default shadow-gp-popover absolute top-full right-0 left-0 z-40 mt-2 max-h-[340px] overflow-y-auto rounded-[12px] border bg-white p-1.5"
        >
          <div className="text-gp-text-muted px-2.5 pt-1 pb-1.5 text-[10px] leading-4 font-bold tracking-[0.08em] uppercase">
            Suggested locations
          </div>

          {suggestionsLoading && (
            <p className="text-gp-text-muted px-2.5 py-3 text-xs leading-5">
              Loading available places...
            </p>
          )}

          {!suggestionsLoading && suggestionsUnavailable && (
            <p className="text-gp-text-muted px-2.5 py-3 text-xs leading-5">
              Suggestions unavailable - you can still enter a location manually.
            </p>
          )}

          {!suggestionsLoading &&
            !suggestionsUnavailable &&
            suggestions.length === 0 &&
            recentEntries.length === 0 && (
              <p className="text-gp-text-muted px-2.5 py-3 text-xs leading-5">
                No saved places match yet. Custom locations are allowed.
              </p>
            )}

          {suggestions.map((suggestion, index) => {
            const Icon: LucideIcon = getSuggestionIcon(suggestion.type);
            const active = activeIndex === index;
            const canRemove = suggestion.type === "recent";

            return (
              <div
                key={suggestion.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex min-h-14 w-full items-stretch rounded-[10px] transition-colors motion-safe:transition-[background-color,opacity,transform] motion-safe:duration-150",
                  "hover:bg-[#F9FAFB]",
                  active && "bg-gp-gold-50/70",
                )}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectLocation(suggestion.name)}
                  className="focus-visible:ring-gp-gold-500/20 flex min-w-0 flex-1 items-start gap-3 rounded-[10px] px-2.5 py-2.5 text-left focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="border-gp-border-subtle bg-gp-surface-subtle text-gp-gold-700 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[9px] border">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-gp-navy-900 block truncate text-sm leading-5 font-semibold">
                      {suggestion.name}
                    </span>
                    <span className="text-gp-text-muted mt-0.5 block truncate text-xs leading-4">
                      {suggestionMeta(suggestion)}
                    </span>
                  </span>
                </button>
                {canRemove && (
                  <button
                    type="button"
                    aria-label={`Remove ${suggestion.name} from recent locations`}
                    title="Remove from history"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      removeRecentLocation(suggestion.name);
                    }}
                    className="text-gp-text-muted hover:bg-red-50 hover:text-red-600 focus-visible:ring-gp-gold-500/20 mr-1.5 self-center rounded-[8px] p-1.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            );
          })}

          {showUseEntered && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                commitLocation(value);
                setDropdownOpen(false);
              }}
              className="border-gp-border-subtle text-gp-text-secondary hover:bg-gp-surface-hover mt-1 flex min-h-10 w-full items-center gap-2 border-t px-2.5 pt-2 text-left text-xs leading-5 font-semibold"
            >
              <span aria-hidden="true">↳</span>
              Use &quot;{value.trim()}&quot; as entered
            </button>
          )}
        </div>
      )}

      {showSpecificityHint && isFocused && (
        <p className="text-gp-warning mt-2 flex items-start gap-1.5 text-xs leading-5 font-medium">
          <TriangleAlert
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          Consider adding the facility, branch, department, or a more specific
          location.
        </p>
      )}
    </div>
  );
});
