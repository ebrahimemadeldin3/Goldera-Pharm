type GoogleMapsLoadResult =
  { ok: true; api: GoogleMapsApi } | { ok: false; reason: string };

export type GoogleLatLngLiteral = {
  lat: number;
  lng: number;
};

export type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

export type GoogleMapsListener = {
  remove: () => void;
};

export type GoogleMapMouseEvent = {
  latLng?: GoogleLatLng | null;
};

export type GoogleMap = {
  addListener: (
    eventName: "click",
    handler: (event: GoogleMapMouseEvent) => void,
  ) => GoogleMapsListener;
  setCenter: (position: GoogleLatLngLiteral) => void;
  setZoom: (zoom: number) => void;
};

export type GoogleMarker = {
  addListener: (
    eventName: "dragend",
    handler: () => void,
  ) => GoogleMapsListener;
  getPosition: () => GoogleLatLng | null | undefined;
  setMap: (map: GoogleMap | null) => void;
  setPosition: (position: GoogleLatLngLiteral) => void;
};

export type GooglePlacePrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
  types?: string[];
};

export type GooglePlaceDetails = {
  formatted_address?: string;
  geometry?: {
    location?: GoogleLatLng;
  };
  name?: string;
  place_id?: string;
  types?: string[];
};

export type GoogleGeocoderResult = {
  formatted_address?: string;
  geometry?: {
    location?: GoogleLatLng;
  };
};

export type GoogleAutocompleteService = {
  getPlacePredictions: (
    request: {
      componentRestrictions?: { country: string | string[] };
      input: string;
      region?: string;
    },
    callback: (
      predictions: GooglePlacePrediction[] | null,
      status: string,
    ) => void,
  ) => void;
};

export type GooglePlacesService = {
  getDetails: (
    request: { fields: string[]; placeId: string },
    callback: (place: GooglePlaceDetails | null, status: string) => void,
  ) => void;
};

export type GoogleGeocoder = {
  geocode: (
    request: { address?: string; location?: GoogleLatLngLiteral },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ) => void;
};

export type GoogleMapsApi = {
  maps: {
    event: {
      clearInstanceListeners: (instance: object) => void;
    };
    Geocoder: new () => GoogleGeocoder;
    Map: new (
      element: HTMLElement,
      options: {
        center: GoogleLatLngLiteral;
        clickableIcons?: boolean;
        disableDefaultUI?: boolean;
        fullscreenControl?: boolean;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        zoom: number;
        zoomControl?: boolean;
      },
    ) => GoogleMap;
    Marker: new (options: {
      draggable?: boolean;
      map: GoogleMap;
      position: GoogleLatLngLiteral;
      title?: string;
    }) => GoogleMarker;
    places?: {
      AutocompleteService: new () => GoogleAutocompleteService;
      PlacesService: new (
        container: HTMLElement | GoogleMap,
      ) => GooglePlacesService;
      PlacesServiceStatus: {
        OK: string;
        ZERO_RESULTS: string;
      };
    };
  };
};

type GoogleMapsWindow = Window & {
  __gpGoogleMapsReady?: () => void;
  gm_authFailure?: () => void;
  google?: GoogleMapsApi;
};

const GOOGLE_MAPS_SCRIPT_ID = "golderapharm-google-maps-sdk";
const GOOGLE_MAPS_CALLBACK = "__gpGoogleMapsReady";

let loadPromise: Promise<GoogleMapsLoadResult> | null = null;

function getGoogleMapsApiKey() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ||
    ""
  ).trim();
}

export function loadGoogleMaps(): Promise<GoogleMapsLoadResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({
      ok: false,
      reason: "Google Maps is client-only.",
    });
  }

  const mapsWindow = window as GoogleMapsWindow;

  if (mapsWindow.google?.maps?.places) {
    return Promise.resolve({ ok: true, api: mapsWindow.google });
  }

  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.resolve({
      ok: false,
      reason: "Google Maps browser key is not configured.",
    });
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<GoogleMapsLoadResult>((resolve) => {
    const previousAuthFailure = mapsWindow.gm_authFailure;
    const cleanup = () => {
      delete mapsWindow.__gpGoogleMapsReady;
      mapsWindow.gm_authFailure = previousAuthFailure;
    };
    const fail = (reason: string) => {
      cleanup();
      loadPromise = null;
      resolve({ ok: false, reason });
    };

    mapsWindow.__gpGoogleMapsReady = () => {
      const api = mapsWindow.google;

      if (!api?.maps?.places) {
        fail("Google Maps loaded without Places support.");
        return;
      }

      cleanup();
      resolve({ ok: true, api });
    };

    mapsWindow.gm_authFailure = () => {
      previousAuthFailure?.();
      fail("Google Maps rejected the browser key or referrer.");
    };

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener(
        "error",
        () => fail("Google Maps script failed to load."),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      callback: GOOGLE_MAPS_CALLBACK,
      key: apiKey,
      libraries: "places",
      loading: "async",
      region: "SA",
      v: "weekly",
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.onerror = () => fail("Google Maps script failed to load.");

    document.head.appendChild(script);
  });

  return loadPromise;
}
