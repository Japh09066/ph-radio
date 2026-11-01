"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { NowPlayingTrack } from "@/types";

interface UseNowPlayingOptions {
  /** AzuraCast-style now-playing JSON endpoint. */
  url?: string;
  /** Poll interval in milliseconds. */
  intervalMs?: number;
}

interface UseNowPlayingResult {
  track: NowPlayingTrack | null;
  loading: boolean;
}

/**
 * Parse an AzuraCast `/api/nowplaying/{id}` payload into our track shape.
 * Falls back gracefully if the structure is unexpected.
 */
function parseAzuraCast(data: unknown): NowPlayingTrack | null {
  if (!data || typeof data !== "object") return null;

  // AzuraCast single-station response: { now_playing: { song: {...} } }
  const root = data as Record<string, unknown>;
  const nowPlaying = root.now_playing as Record<string, unknown> | undefined;
  const song = nowPlaying?.song as Record<string, unknown> | undefined;
  if (!song) return null;

  const title = typeof song.title === "string" ? song.title : "";
  const artist = typeof song.artist === "string" ? song.artist : "";
  const artwork = typeof song.art === "string" ? song.art : null;

  if (!title && !artist) return null;

  return {
    title: title || "Unknown track",
    artist: artist || "Unknown artist",
    artwork,
  };
}

/**
 * Poll a now-playing metadata endpoint on an interval.
 * Returns `null` when no endpoint is configured or metadata is unavailable,
 * so the UI can render a graceful fallback.
 */
export function useNowPlaying({
  url,
  intervalMs = 15000,
}: UseNowPlayingOptions): UseNowPlayingResult {
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url));
  const abortRef = useRef<AbortController | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    if (!url) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTrack(parseAzuraCast(data));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Network/parse errors are non-fatal — keep last known track.
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    void fetchNowPlaying();
    const id = window.setInterval(() => void fetchNowPlaying(), intervalMs);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [url, intervalMs, fetchNowPlaying]);

  return { track, loading };
}
