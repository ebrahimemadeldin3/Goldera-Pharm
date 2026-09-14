"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Hospital,
  Loader2,
  LocateFixed,
  MapPinned,
  Pill,
  RotateCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  loadGoogleMaps,
  type GoogleAutocompleteService,
  type GoogleGeocoder,
  type GoogleLatLngLiteral,
  type GoogleMap,
  type GoogleMapMouseEvent,
  type GoogleMapsApi,
  type GoogleMarker,
  type GooglePlaceDetails,
  type GooglePlacePrediction,
  type GooglePlacesService,
} from "@/features/coaching/lib/visit-location/google-maps";

type VisitLocationMapPickerProps = {
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

type SearchResult = {
  address: string;
  description: string;
  name: string;
  placeId: string;
  types: string[];
};

type SelectedLocation = {
  address: string;
  name: string;
  position: GoogleLatLngLiteral;
  value: string;
};

type MapStatus = "loading" | "ready" | "unavailable";
type SearchStatus = "idle" | "searching" | "success" | "no-results" | "error";
type GeolocationStatus = "idle" | "loading" | "error";

const DEFAULT_CENTER: GoogleLatLngLiteral = { lat: 24.7136, lng: 46.6753 };
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;

function toLatLngLiteral(location: { lat: () => number; lng: () => number }) {
  return { lat: location.lat(), lng: location.lng() };
}

function formatSelectedValue(name: string, address: string) {
  const cleanName = name.trim();
  const cleanAddress = address.trim();

  if (!cleanName) return cleanAddress;
  if (!cleanAddress) return cleanName;
  if (cleanAddress.toLowerCase().startsWith(cleanName.toLowerCase())) {
    return cleanAddress;
  }

  return `${cleanName}, ${cleanAddress}`;
}

function splitAddress(value: string) {
  const [first, ...rest] = value.split(",");

  return {
    primary: first?.trim() || value.trim(),
    secondary: rest.join(",").trim(),
  };
}

function mapPrediction(prediction: GooglePlacePrediction): SearchResult {
  const name =
    prediction.structured_formatting?.main_text || prediction.description;
  const address =
    prediction.structured_formatting?.secondary_text ||
    prediction.description.replace(name, "").replace(/^,\s*/, "");

  return {
    address,
    description: prediction.description,
    name,
    placeId: prediction.place_id,
    types: prediction.types ?? [],
  };
}

function getResultIcon(types: string[]) {
  if (types.includes("hospital") || types.includes("health")) return Hospital;
  if (types.includes("pharmacy")) return Pill;
  return Building2;
}

function getPlacesOkStatus(api: GoogleMapsApi) {
  return api.maps.places?.PlacesServiceStatus.OK ?? "OK";
}

function getPlacesZeroStatus(api: GoogleMapsApi) {
  return api.maps.places?.PlacesServiceStatus.ZERO_RESULTS ?? "ZERO_RESULTS";
}

export function VisitLocationMapPicker({
  value,
  onSelect,
  onClose,
}: VisitLocationMapPickerProps) {
  const searchInputId = useId();
  const resultListId = useId();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const searchRequestRef = useRef(0);
  const geocodeRequestRef = useRef(0);
  const mapClickListenerRef = useRef<{ remove: () => void } | null>(null);
  const markerDragListenerRef = useRef<{ remove: () => void } | null>(null);
  const apiRef = useRef<GoogleMapsApi | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMarker | null>(null);
  const autocompleteRef = useRef<GoogleAutocompleteService | null>(null);
  const placesRef = useRef<GooglePlacesService | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);

  const [query, setQuery] = useState(value);
  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");
  const [mapFailureReason, setMapFailureReason] = useState("");
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [geolocationStatus, setGeolocationStatus] =
    useState<GeolocationStatus>("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const cleanQuery = query.trim();
  const isMapUnavailable = mapStatus === "unavailable";
  const canUseLocation = Boolean(selectedLocation?.value.trim());
  const selectedSummary = useMemo(
    () => splitAddress(selectedLocation?.value ?? ""),
    [selectedLocation?.value],
  );

  function setMarker(
    position: GoogleLatLngLiteral,
    title = "Selected visit location",
  ) {
    const map = mapRef.current;
    const api = apiRef.current;

    if (!map || !api) return;

    if (!markerRef.current) {
      markerRef.current = new api.maps.Marker({
        draggable: true,
        map,
        position,
        title,
      });
      markerDragListenerRef.current = markerRef.current.addListener(
        "dragend",
        () => {
          const nextPosition = markerRef.current?.getPosition();
          if (!nextPosition) return;

          reverseGeocode(toLatLngLiteral(nextPosition));
        },
      );
    } else {
      markerRef.current.setPosition(position);
    }
  }

  function selectLocation(
    name: string,
    address: string,
    position: GoogleLatLngLiteral,
  ) {
    const nextValue = formatSelectedValue(name, address);

    setSelectedLocation({
      address,
      name,
      position,
      value: nextValue,
    });
    mapRef.current?.setCenter(position);
    mapRef.current?.setZoom(16);
    setMarker(position, name || "Selected visit location");
  }

  function reverseGeocode(position: GoogleLatLngLiteral) {
    const geocoder = geocoderRef.current;
    const api = apiRef.current;

    if (!geocoder || !api) return;

    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;

    mapRef.current?.setCenter(position);
    setMarker(position);

    geocoder.geocode({ location: position }, (geocodeResults, status) => {
      if (!isMountedRef.current) return;
      if (requestId !== geocodeRequestRef.current) return;

      if (status !== getPlacesOkStatus(api) || !geocodeResults?.[0]) {
        setSelectedLocation({
          address: "",
          name: "Custom pinned location",
          position,
          value: "Custom pinned location",
        });
        return;
      }

      const formattedAddress = geocodeResults[0].formatted_address ?? "";
      selectLocation("", formattedAddress, position);
    });
  }

  function geocodeInitialValue(initialValue: string) {
    const geocoder = geocoderRef.current;
    const api = apiRef.current;
    const cleanValue = initialValue.trim();

    if (!geocoder || !api || cleanValue.length < MIN_SEARCH_LENGTH) return;

    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;

    geocoder.geocode({ address: cleanValue }, (geocodeResults, status) => {
      if (!isMountedRef.current) return;
      if (requestId !== geocodeRequestRef.current) return;
      if (status !== getPlacesOkStatus(api) || !geocodeResults?.[0]) return;

      const result = geocodeResults[0];
      const location = result.geometry?.location;
      if (!location) return;

      selectLocation("", result.formatted_address ?? cleanValue, {
        lat: location.lat(),
        lng: location.lng(),
      });
    });
  }

  function initializeMap(api: GoogleMapsApi) {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new api.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      clickableIcons: false,
      disableDefaultUI: true,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      zoom: 11,
      zoomControl: true,
    });

    apiRef.current = api;
    mapRef.current = map;
    autocompleteRef.current = new api.maps.places!.AutocompleteService();
    placesRef.current = new api.maps.places!.PlacesService(map);
    geocoderRef.current = new api.maps.Geocoder();
    mapClickListenerRef.current = map.addListener(
      "click",
      (event: GoogleMapMouseEvent) => {
        if (!event.latLng) return;
        reverseGeocode(toLatLngLiteral(event.latLng));
      },
    );
    setMapStatus("ready");
    geocodeInitialValue(value);
  }

  function loadMap() {
    setMapStatus("loading");
    setMapFailureReason("");

    loadGoogleMaps().then((result) => {
      if (!isMountedRef.current) return;

      if (!result.ok) {
        setMapFailureReason(result.reason);
        setMapStatus("unavailable");
        return;
      }

      try {
        initializeMap(result.api);
      } catch {
        setMapFailureReason("Google Maps could not initialize.");
        setMapStatus("unavailable");
      }
    });
  }

  useEffect(() => {
    isMountedRef.current = true;
    const loadTimer = window.setTimeout(loadMap, 0);

    return () => {
      isMountedRef.current = false;
      window.clearTimeout(loadTimer);
      mapClickListenerRef.current?.remove();
      markerDragListenerRef.current?.remove();
      markerRef.current?.setMap(null);

      if (apiRef.current && mapRef.current) {
        apiRef.current.maps.event.clearInstanceListeners(mapRef.current);
      }

      if (apiRef.current && markerRef.current) {
        apiRef.current.maps.event.clearInstanceListeners(markerRef.current);
      }
    };
    // The map is created once per picker mount; the current field value is only
    // used as the initial map search/reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;

    const timeout = window.setTimeout(() => {
      if (mapStatus !== "ready" || cleanQuery.length < MIN_SEARCH_LENGTH) {
        setResults([]);
        setSearchStatus("idle");
        setActiveIndex(-1);
        return;
      }

      setSearchStatus("searching");
      const autocomplete = autocompleteRef.current;
      const api = apiRef.current;

      if (!autocomplete || !api) {
        setSearchStatus("error");
        return;
      }

      autocomplete.getPlacePredictions(
        {
          componentRestrictions: { country: "sa" },
          input: cleanQuery,
          region: "sa",
        },
        (predictions, status) => {
          if (!isMountedRef.current) return;
          if (requestId !== searchRequestRef.current) return;

          if (status === getPlacesZeroStatus(api)) {
            setResults([]);
            setSearchStatus("no-results");
            setActiveIndex(-1);
            return;
          }

          if (status !== getPlacesOkStatus(api)) {
            setResults([]);
            setSearchStatus("error");
            setActiveIndex(-1);
            return;
          }

          const nextResults = (predictions ?? [])
            .slice(0, 5)
            .map(mapPrediction);
          setResults(nextResults);
          setSearchStatus(nextResults.length ? "success" : "no-results");
          setActiveIndex(nextResults.length ? 0 : -1);
        },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [cleanQuery, mapStatus]);

  function handlePlaceDetails(result: SearchResult) {
    const places = placesRef.current;
    const api = apiRef.current;

    if (!places || !api) return;

    setSelectedPlaceId(result.placeId);
    setSearchStatus("searching");

    places.getDetails(
      {
        fields: ["name", "formatted_address", "geometry", "place_id", "types"],
        placeId: result.placeId,
      },
      (place: GooglePlaceDetails | null, status) => {
        if (!isMountedRef.current) return;

        setSearchStatus("success");

        if (status !== getPlacesOkStatus(api) || !place?.geometry?.location) {
          setSearchStatus("error");
          return;
        }

        const position = toLatLngLiteral(place.geometry.location);
        const name = place.name ?? result.name;
        const address = place.formatted_address ?? result.address;

        setQuery(formatSelectedValue(name, address));
        selectLocation(name, address, position);
      },
    );
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handlePlaceDetails(results[activeIndex]);
    }
  }

  function handleUseCurrentArea() {
    if (!navigator.geolocation || mapStatus !== "ready") {
      setGeolocationStatus("error");
      return;
    }

    setGeolocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;

        const nextPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setGeolocationStatus("idle");
        reverseGeocode(nextPosition);
        mapRef.current?.setZoom(15);
      },
      () => {
        if (!isMountedRef.current) return;

        setGeolocationStatus("error");
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 6000 },
    );
  }

  function handleUseLocation() {
    const nextValue = selectedLocation?.value.trim();
    if (!nextValue) return;

    onSelect(nextValue);
    onClose();
  }

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-gp-navy-900 text-sm leading-5 font-semibold">
            Find visit location
          </h3>
          <p className="text-gp-text-muted mt-0.5 text-xs leading-5">
            Search for a hospital, clinic, pharmacy or address.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close location picker"
          className="text-gp-text-muted hover:bg-gp-surface-hover hover:text-gp-navy-900 -mt-1 rounded-[8px]"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="relative">
        <label htmlFor={searchInputId} className="sr-only">
          Search hospital, clinic, pharmacy or address
        </label>
        <Search
          className="text-gp-text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          id={searchInputId}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedPlaceId(null);
          }}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search hospital, clinic, pharmacy or address..."
          role="combobox"
          aria-autocomplete="list"
          aria-controls={resultListId}
          aria-expanded={results.length > 0}
          aria-activedescendant={
            activeIndex >= 0 ? `${resultListId}-${activeIndex}` : undefined
          }
          disabled={mapStatus !== "ready"}
          className="border-gp-border-control text-gp-navy-900 placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/15 h-10 rounded-[10px] bg-white pr-9 pl-9 text-sm font-medium shadow-none"
        />
        {searchStatus === "searching" && (
          <Loader2
            className="text-gp-text-muted absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
            aria-label="Searching locations"
          />
        )}
      </div>

      <div
        aria-live="polite"
        className="text-gp-text-muted mt-2 min-h-5 text-xs leading-5"
      >
        {mapStatus === "ready" &&
          cleanQuery.length > 0 &&
          cleanQuery.length < MIN_SEARCH_LENGTH &&
          "Enter at least 2 characters to search."}
        {searchStatus === "error" &&
          "We could not load those results. Try another search."}
        {searchStatus === "no-results" &&
          "No matching places found. Try a more specific facility or address."}
      </div>

      {isMapUnavailable ? (
        <div
          className="border-gp-border-default bg-gp-surface-subtle mt-3 rounded-[12px] border p-4 text-center"
          role="status"
          aria-live="polite"
        >
          <span className="border-gp-border-subtle text-gp-navy-900 mx-auto flex size-10 items-center justify-center rounded-[10px] border bg-white">
            <MapPinned className="size-4" aria-hidden="true" />
          </span>
          <p className="text-gp-navy-900 mt-3 text-sm font-semibold">
            Map unavailable
          </p>
          <p className="text-gp-text-muted mt-1 text-xs leading-5">
            The map service could not be loaded. You can still type the visit
            location manually.
          </p>
          {mapFailureReason && (
            <p className="text-gp-text-muted mt-1 text-xs leading-5">
              {mapFailureReason}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={loadMap}
            className="border-gp-border-control text-gp-navy-900 mt-3 h-8 rounded-[8px] px-3 text-xs font-semibold shadow-none"
          >
            <RotateCw className="size-3.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <div
              id={resultListId}
              role="listbox"
              aria-label="Location search results"
              className="border-gp-border-subtle mt-2 max-h-40 overflow-y-auto rounded-[10px] border bg-white p-1"
            >
              {results.map((result, index) => {
                const Icon = getResultIcon(result.types);
                const isSelected = selectedPlaceId === result.placeId;
                const isActive = activeIndex === index;

                return (
                  <button
                    key={result.placeId}
                    id={`${resultListId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handlePlaceDetails(result)}
                    className={cn(
                      "border-gp-border-subtle flex w-full items-start gap-2 rounded-[8px] border border-transparent px-2.5 py-2 text-left transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
                      "hover:border-gp-border-control hover:bg-gp-surface-hover hover:text-gp-navy-900 focus-visible:ring-gp-gold-500/20 focus-visible:ring-2 focus-visible:outline-none",
                      isActive &&
                        "border-gp-border-control bg-gp-surface-subtle",
                      isSelected &&
                        "border-gp-navy-900/20 bg-gp-navy-900/[0.04]",
                    )}
                  >
                    <span className="text-gp-text-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-[#F6F8FB]">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-gp-navy-900 block truncate text-xs leading-5 font-semibold">
                        {result.name}
                      </span>
                      {result.address && (
                        <span className="text-gp-text-muted block truncate text-xs leading-4">
                          {result.address}
                        </span>
                      )}
                    </span>
                    {isSelected ? (
                      <Check
                        className="text-gp-navy-900 mt-1 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        className="text-gp-text-muted mt-1 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="border-gp-border-default bg-gp-surface-subtle relative mt-3 h-[280px] overflow-hidden rounded-[12px] border sm:h-[300px]">
            <div ref={mapContainerRef} className="absolute inset-0" />

            {mapStatus === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-gp-text-muted flex items-center gap-2 text-xs font-semibold">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading map
                </div>
              </div>
            )}
          </div>

          <div
            className="border-gp-border-subtle mt-3 rounded-[10px] border bg-white p-3"
            aria-live="polite"
          >
            <p className="text-gp-text-muted text-[11px] leading-4 font-semibold tracking-[0.08em] uppercase">
              Selected location
            </p>
            {selectedLocation ? (
              <div className="mt-2 flex items-start gap-2">
                <MapPinned
                  className="text-gp-gold-600 mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-gp-navy-900 truncate text-sm leading-5 font-semibold">
                    {selectedLocation.name || selectedSummary.primary}
                  </p>
                  {(selectedLocation.address || selectedSummary.secondary) && (
                    <p className="text-gp-text-muted mt-0.5 line-clamp-2 text-xs leading-5">
                      {selectedLocation.address || selectedSummary.secondary}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gp-text-muted mt-2 text-xs leading-5">
                Search and select a place, click the map, or use your current
                area.
              </p>
            )}
          </div>

          {geolocationStatus === "error" && (
            <p
              className="text-gp-text-muted mt-2 text-xs leading-5"
              role="status"
              aria-live="polite"
            >
              We could not access your current location. Search for the place
              instead.
            </p>
          )}
        </>
      )}

      <div className="border-gp-border-subtle sticky bottom-0 -mx-4 mt-4 flex flex-col-reverse gap-2 border-t bg-white px-4 pt-3 pb-0 sm:flex-row sm:items-center sm:justify-between">
        {!isMapUnavailable && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleUseCurrentArea}
            disabled={mapStatus !== "ready" || geolocationStatus === "loading"}
            className="text-gp-text-secondary hover:bg-gp-surface-hover hover:text-gp-navy-900 h-9 justify-start rounded-[9px] px-2 text-xs font-semibold"
          >
            <LocateFixed className="size-3.5" aria-hidden="true" />
            {geolocationStatus === "loading"
              ? "Checking area"
              : "Use current area"}
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gp-border-control text-gp-navy-900 h-9 rounded-[9px] px-3 text-xs font-semibold shadow-none"
          >
            Cancel
          </Button>
          {!isMapUnavailable && (
            <Button
              type="button"
              onClick={handleUseLocation}
              disabled={!canUseLocation}
              className="bg-gp-navy-900 hover:bg-gp-navy-850 h-9 rounded-[9px] px-3 text-xs font-semibold text-white shadow-none"
            >
              <Check className="text-gp-gold-500 size-3.5" aria-hidden="true" />
              Use location
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
