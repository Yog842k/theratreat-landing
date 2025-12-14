import { useCallback, useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SCRIPT_ID = "google-maps-sdk";

interface AutocompleteRequest {
  input: string;
  componentRestrictions?: {
    country: string | string[];
  };
  types?: string[];
}

type AutocompleteClient =
  | {
      kind: 'legacy';
      client: any; // google.maps.places.AutocompleteService
      get: (
        request: AutocompleteRequest,
        cb: (predictions: GooglePlacePrediction[] | null, status: string) => void
      ) => void;
    }
  | {
      kind: 'new';
      client: any; // google.maps.places.AutocompleteSuggestion
      get: (
        request: AutocompleteRequest,
        cb: (predictions: GooglePlacePrediction[] | null, status: string) => void
      ) => void;
    };

export interface GooglePlacePrediction {
  description?: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

export const getPredictionMainText = (prediction: GooglePlacePrediction) =>
  prediction.structured_formatting?.main_text || prediction.description || "";

export const getPredictionSecondaryText = (prediction: GooglePlacePrediction) =>
  prediction.structured_formatting?.secondary_text || "";

export function useGooglePlacesAutocomplete(defaultRequest?: Partial<AutocompleteRequest>) {
  const serviceRef = useRef<AutocompleteClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !GOOGLE_MAPS_API_KEY) return;

    const initialize = () => {
      if (!window.google?.maps?.places) return;
      // Prefer the new AutocompleteSuggestion API if available
      const NewAuto = window.google.maps.places?.AutocompleteSuggestion;
      if (NewAuto) {
        try {
          const client = new NewAuto();
          serviceRef.current = {
            kind: 'new',
            client,
            get: (request: AutocompleteRequest, cb) => {
              // Try common method names on the new API
              // Some builds use suggest(), others getSuggestions()
              const fn = client.getSuggestions || client.suggest || client.getPlacePredictions;
              if (typeof fn === 'function') {
                fn.call(client, request, (preds: any, status: string) => cb(preds, status));
              } else {
                cb([], 'ZERO_RESULTS');
              }
            }
          };
          setIsReady(true);
          return;
        } catch {}
      }
      // Fallback: legacy AutocompleteService
      const LegacyAuto = window.google.maps.places?.AutocompleteService;
      if (LegacyAuto) {
        const client = new LegacyAuto();
        serviceRef.current = {
          kind: 'legacy',
          client,
          get: (request: AutocompleteRequest, cb) => {
            client.getPlacePredictions(request, (preds: any, status: string) => cb(preds, status));
          }
        };
        setIsReady(true);
      }
    };

    if (window.google?.maps?.places) {
      initialize();
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", initialize);
      return () => existingScript.removeEventListener("load", initialize);
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    // Use recommended loader flags via query params
    // See: https://goo.gle/js-api-loading
    script.async = true;
    script.defer = true;
    // Use Places API (New) where available by opting into latest JS loader
    // v=beta helps unlock newer features for AutocompleteSuggestion in some regions
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=en&region=IN&v=beta&loading=async`;
    script.addEventListener("load", initialize);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", initialize);
    };
  }, []);

  const getPredictions = useCallback(
    (input: string, overrides?: Partial<AutocompleteRequest>) =>
      new Promise<GooglePlacePrediction[]>((resolve) => {
        if (!input || !serviceRef.current) {
          // HTTP fallback via our proxy using Places API (New)
          fetch('/api/places/autocomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, ...defaultRequest, ...overrides })
          })
            .then(r => r.json())
            .then(j => {
              if (j?.success && Array.isArray(j.predictions)) resolve(j.predictions);
              else resolve([]);
            })
            .catch(() => resolve([]));
          return;
        }

        const request: AutocompleteRequest = {
          input,
          ...defaultRequest,
          ...overrides,
        };

        const client = serviceRef.current;
        const caller = (cb: (preds: any, status: string) => void) => {
          if (client && typeof (client as any).get === 'function') {
            (client as any).get(request, cb);
            return true;
          }
          // Fallback direct calls if wrapper missing
          const legacy = window.google?.maps?.places?.AutocompleteService;
          if (legacy) {
            try {
              const inst = new legacy();
              inst.getPlacePredictions(request, cb);
              return true;
            } catch {}
          }
          const modern = window.google?.maps?.places?.AutocompleteSuggestion;
          if (modern) {
            try {
              const inst = new modern();
              const fn = inst.getSuggestions || inst.suggest || inst.getPlacePredictions;
              if (typeof fn === 'function') {
                fn.call(inst, request, cb);
                return true;
              }
            } catch {}
          }
          return false;
        };

        const used = caller((predictions, status) => {
          const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK || 'OK';
          const isEmpty = Array.isArray(predictions) && predictions.length === 0;
          if (status !== okStatus || !predictions || isEmpty) {
            // Try HTTP fallback if client returned no results or bad status
            fetch('/api/places/autocomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input, ...defaultRequest, ...overrides })
            })
              .then(r => r.json())
              .then(j => {
                if (j?.success && Array.isArray(j.predictions)) resolve(j.predictions);
                else resolve([]);
              })
              .catch(() => resolve([]));
            return;
          }
          resolve(predictions);
        });
        if (!used) {
          // If caller couldn't invoke any client, use HTTP fallback
          fetch('/api/places/autocomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input, ...defaultRequest, ...overrides })
          })
            .then(r => r.json())
            .then(j => {
              if (j?.success && Array.isArray(j.predictions)) resolve(j.predictions);
              else resolve([]);
            })
            .catch(() => resolve([]));
        }
      }),
    [defaultRequest]
  );

  return { isReady, getPredictions };
}

declare global {
  interface Window {
    google?: any;
  }
}

