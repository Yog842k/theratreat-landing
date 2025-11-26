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

interface AutocompleteService {
  getPlacePredictions: (
    request: AutocompleteRequest,
    callback: (predictions: GooglePlacePrediction[] | null, status: string) => void
  ) => void;
}

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
  const serviceRef = useRef<AutocompleteService | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !GOOGLE_MAPS_API_KEY) return;

    const initialize = () => {
      if (window.google?.maps?.places) {
        serviceRef.current = new window.google.maps.places.AutocompleteService();
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
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=en&region=IN`;
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
          resolve([]);
          return;
        }

        const request: AutocompleteRequest = {
          input,
          ...defaultRequest,
          ...overrides,
        };

        serviceRef.current.getPlacePredictions(request, (predictions, status) => {
          const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK || "OK";
          if (status !== okStatus || !predictions) {
            resolve([]);
            return;
          }

          resolve(predictions);
        });
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

