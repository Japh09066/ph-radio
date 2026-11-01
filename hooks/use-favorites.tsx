"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Station } from "@/types";

const FAVORITES_STORAGE_KEY = "radio:favorites";

interface FavoritesContextValue {
  /** Full favorite station records, in the order they were added. */
  favorites: Station[];
  /** True when the given station id is a favorite. */
  isFavorite: (id: string) => boolean;
  /** Add or remove a station from favorites. */
  toggleFavorite: (station: Station) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * Persists the listener's favorite stations to localStorage so they survive
 * reloads. Stores the full station record (not just the id) so favorites
 * still render even before the live station list has loaded.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Station[]>([]);

  // Load persisted favorites once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Station[];
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = useCallback((list: Station[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore storage errors (quota / private mode) */
    }
  }, []);

  const toggleFavorite = useCallback(
    (station: Station) => {
      setFavorites((prev) => {
        const exists = prev.some((s) => s.id === station.id);
        const next = exists
          ? prev.filter((s) => s.id !== station.id)
          : [...prev, station];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const favoriteIds = useMemo(
    () => new Set(favorites.map((s) => s.id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ favorites, isFavorite, toggleFavorite }),
    [favorites, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

/** Access the favorites store. Must be used within a FavoritesProvider. */
export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
