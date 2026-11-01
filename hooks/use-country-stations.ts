"use client";

import { useCallback, useState } from "react";

import { fetchStationsByCountry } from "@/lib/radio-browser";
import type { Station } from "@/types";

type LoadState = "idle" | "loading" | "loaded" | "error";

interface UseCountryStationsResult {
  stations: Station[];
  state: LoadState;
  error: string | null;
  load: () => Promise<void>;
}

/**
 * Loads all stations for a country from the Radio Browser API on demand.
 * Fetching happens in the browser (visitor's network), so it is not affected
 * by build-time / corporate network category filters.
 */
export function useCountryStations(
  countryCode: string,
  countryLabel: string,
): UseCountryStationsResult {
  const [stations, setStations] = useState<Station[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const result = await fetchStationsByCountry(countryCode, countryLabel);
      setStations(result);
      setState("loaded");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load stations. Please try again.",
      );
      setState("error");
    }
  }, [countryCode, countryLabel]);

  return { stations, state, error, load };
}
