"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { stationConfig } from "@/lib/station";
import { getStationById, STATIONS } from "@/lib/stations";
import { clamp } from "@/lib/utils";
import type { PlaybackStatus, Station, StreamStatus } from "@/types";

interface RadioPlayerContextValue {
  status: PlaybackStatus;
  streamStatus: StreamStatus;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  /** The currently selected station. */
  currentStation: Station;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  /** Switch to a station; starts playing it immediately. */
  selectStation: (station: Station) => void;
  /** Set the current station without starting playback (e.g. default). */
  setStationWithoutPlaying: (station: Station) => void;
  /** The ordered list of browsable stations (the playlist for next/prev). */
  playlist: Station[];
  /** Replace the playlist used for next/previous navigation. */
  setPlaylist: (stations: Station[]) => void;
  /** Skip to the next station in the playlist (wraps around). */
  next: () => void;
  /** Skip to the previous station in the playlist (wraps around). */
  previous: () => void;
  /** Minutes remaining on the sleep timer, or null when inactive. */
  sleepRemaining: number | null;
  /** Arm the sleep timer for the given number of minutes. */
  setSleepTimer: (minutes: number) => void;
  /** Disarm the sleep timer. */
  cancelSleepTimer: () => void;
}

const RadioPlayerContext = createContext<RadioPlayerContextValue | null>(null);

const VOLUME_STORAGE_KEY = "radio:volume";
const MUTED_STORAGE_KEY = "radio:muted";
const STATION_STORAGE_KEY = "radio:station";
/** Base delay between reconnect attempts (exponential backoff). */
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

interface RadioPlayerProviderProps {
  children: ReactNode;
}

/**
 * Owns the single HTMLAudioElement for the whole app.
 *
 * Responsibilities (single source of truth for playback):
 *  - Station selection (Radio Garden style) with persistence
 *  - Play / pause / volume / mute
 *  - Stream online/offline detection
 *  - Automatic reconnection with exponential backoff when the stream drops
 *    while the user intended to be listening
 *  - Persisting volume, mute and station preferences to localStorage
 */
export function RadioPlayerProvider({ children }: RadioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const reconnectAttempts = useRef<number>(0);
  /** Tracks whether the user wants audio playing (intent), separate from actual state. */
  const intendedPlaying = useRef<boolean>(false);
  /** The stream URL currently loaded into the audio element. */
  const currentUrlRef = useRef<string>(STATIONS[0].streamUrl);
  /** Interval that counts the sleep timer down each minute. */
  const sleepIntervalRef = useRef<number | null>(null);
  /**
   * Latest volume / muted values, held in refs so startStream() can re-apply
   * them after `audio.load()` (which resets volume to 1 and muted to false
   * per the HTML media load algorithm).
   */
  const volumeRef = useRef<number>(0.8);
  const mutedRef = useRef<boolean>(false);

  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("checking");
  const [volume, setVolumeState] = useState<number>(0.8);
  const [muted, setMuted] = useState<boolean>(false);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const [currentStation, setCurrentStation] = useState<Station>(STATIONS[0]);
  const [playlist, setPlaylistState] = useState<Station[]>(STATIONS);

  // Create the audio element once on mount and restore preferences.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    try {
      const storedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
      const storedMuted = localStorage.getItem(MUTED_STORAGE_KEY);
      const storedStation = localStorage.getItem(STATION_STORAGE_KEY);

      if (storedVolume !== null) {
        const v = clamp(Number(storedVolume), 0, 1);
        audio.volume = v;
        volumeRef.current = v;
        setVolumeState(v);
      } else {
        audio.volume = 0.8;
        volumeRef.current = 0.8;
      }
      if (storedMuted !== null) {
        const m = storedMuted === "true";
        audio.muted = m;
        mutedRef.current = m;
        if (m) audio.volume = 0;
        setMuted(m);
      }
      if (storedStation) {
        const station = getStationById(storedStation);
        currentUrlRef.current = station.streamUrl;
        setCurrentStation(station);
      }
    } catch {
      audio.volume = 0.8;
    }

    // Idle until the user presses play — no auto connection yet.
    setStreamStatus("checking");

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const clearReconnect = useCallback(() => {
    if (reconnectTimer.current !== null) {
      window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const startStream = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Setting src fresh forces the browser to pull the live edge of the stream.
    audio.src = currentUrlRef.current;
    audio.load();
    // `load()` resets volume to 1 and muted to false — re-apply the user's
    // current settings so the volume slider and mute toggle actually stick.
    audio.muted = mutedRef.current;
    audio.volume = mutedRef.current ? 0 : volumeRef.current;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        setStatus("error");
        setStreamStatus("offline");
      });
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!intendedPlaying.current) return;
    clearReconnect();
    const attempt = reconnectAttempts.current;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
    reconnectAttempts.current = attempt + 1;
    reconnectTimer.current = window.setTimeout(() => {
      if (intendedPlaying.current) {
        setStatus("loading");
        startStream();
      }
    }, delay);
  }, [clearReconnect, startStream]);

  // Wire up audio element event listeners.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => {
      reconnectAttempts.current = 0;
      clearReconnect();
      setStatus("playing");
      setStreamStatus("online");
    };
    const onWaiting = () => setStatus("loading");
    const onPause = () => {
      if (intendedPlaying.current) return; // transient pause during buffering
      setStatus("paused");
    };
    const onError = () => {
      if (!intendedPlaying.current) return;
      setStreamStatus("offline");
      setStatus("error");
      scheduleReconnect();
    };
    const onStalled = () => {
      if (!intendedPlaying.current) return;
      setStreamStatus("offline");
      scheduleReconnect();
    };
    const onEnded = () => {
      // Live streams should not "end"; treat as a drop and reconnect.
      if (!intendedPlaying.current) return;
      setStreamStatus("offline");
      scheduleReconnect();
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("ended", onEnded);
    };
  }, [clearReconnect, scheduleReconnect]);

  // Re-establish playback when the browser regains network.
  useEffect(() => {
    const onOnline = () => {
      if (intendedPlaying.current) {
        reconnectAttempts.current = 0;
        setStatus("loading");
        startStream();
      }
    };
    const onOffline = () => {
      if (intendedPlaying.current) setStreamStatus("offline");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [startStream]);

  const play = useCallback(() => {
    intendedPlaying.current = true;
    reconnectAttempts.current = 0;
    setStatus("loading");
    setStreamStatus("checking");
    startStream();
  }, [startStream]);

  const pause = useCallback(() => {
    intendedPlaying.current = false;
    clearReconnect();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = ""; // release the connection so we don't buffer silently
    }
    setStatus("paused");
  }, [clearReconnect]);

  const toggle = useCallback(() => {
    if (intendedPlaying.current) {
      pause();
    } else {
      play();
    }
  }, [pause, play]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepIntervalRef.current !== null) {
      window.clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
    setSleepRemaining(null);
  }, []);

  const setSleepTimer = useCallback(
    (minutes: number) => {
      // Re-arming replaces any existing timer.
      if (sleepIntervalRef.current !== null) {
        window.clearInterval(sleepIntervalRef.current);
        sleepIntervalRef.current = null;
      }
      if (minutes <= 0) {
        setSleepRemaining(null);
        return;
      }
      setSleepRemaining(minutes);
      // Tick down once per minute; pause and clear when it reaches zero.
      sleepIntervalRef.current = window.setInterval(() => {
        setSleepRemaining((prev) => {
          const next = (prev ?? 0) - 1;
          if (next <= 0) {
            if (sleepIntervalRef.current !== null) {
              window.clearInterval(sleepIntervalRef.current);
              sleepIntervalRef.current = null;
            }
            pause();
            return null;
          }
          return next;
        });
      }, 60_000);
    },
    [pause],
  );

  // Clean up the sleep interval on unmount.
  useEffect(() => {
    return () => {
      if (sleepIntervalRef.current !== null) {
        window.clearInterval(sleepIntervalRef.current);
      }
    };
  }, []);

  const selectStation = useCallback(
    (station: Station) => {
      currentUrlRef.current = station.streamUrl;
      setCurrentStation(station);
      try {
        localStorage.setItem(STATION_STORAGE_KEY, station.id);
      } catch {
        /* ignore storage errors */
      }
      // Switching a station always starts playback on the new stream.
      intendedPlaying.current = true;
      reconnectAttempts.current = 0;
      clearReconnect();
      setStatus("loading");
      setStreamStatus("checking");
      startStream();
    },
    [clearReconnect, startStream],
  );

  /**
   * Make a station the current one without starting playback. Used to set a
   * default station on load — actual playback waits for a user gesture, so we
   * don't trip the browser's autoplay restrictions.
   */
  const setStationWithoutPlaying = useCallback((station: Station) => {
    currentUrlRef.current = station.streamUrl;
    setCurrentStation(station);
    try {
      localStorage.setItem(STATION_STORAGE_KEY, station.id);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const setPlaylist = useCallback((stations: Station[]) => {
    setPlaylistState(stations.length > 0 ? stations : STATIONS);
  }, []);

  /** Move by an offset within the playlist, wrapping around the ends. */
  const step = useCallback(
    (offset: number) => {
      if (playlist.length === 0) return;
      const idx = playlist.findIndex((s) => s.id === currentStation.id);
      // If the current station isn't in the playlist, start from the edge.
      const base = idx === -1 ? (offset > 0 ? -1 : 0) : idx;
      const nextIdx =
        (base + offset + playlist.length) % playlist.length;
      selectStation(playlist[nextIdx]);
    },
    [playlist, currentStation.id, selectStation],
  );

  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  // ──────────────────────────────────────────────────────────────
  // Media Session API — OS lock-screen / notification media controls.
  // Exposes track metadata and play/pause/next/previous to the system
  // so hardware keys, lock screen and notification shade can drive the
  // player (Android Chrome, iOS Safari 15+, desktop media keys).
  // ──────────────────────────────────────────────────────────────

  // Keep the displayed metadata (title / artist / artwork) in sync.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const stationName = currentStation.name;
    const albumName = stationConfig.name;
    const artworkSizes = ["96", "192", "256", "384", "512"];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: stationName,
      artist: `${currentStation.flag} ${currentStation.country} · ${currentStation.genre}`,
      album: albumName,
      artwork: artworkSizes.map((size) => ({
        src: "/icon-512.png",
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    });
  }, [currentStation]);

  // Reflect playing/paused state to the OS control.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    navigator.mediaSession.playbackState =
      status === "playing" || status === "loading" ? "playing" : "paused";
  }, [status]);

  // Register action handlers. Re-registers when callbacks change so they
  // always target the current station / playlist.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }
    const ms = navigator.mediaSession;
    const canSkip = playlist.length > 1;

    const set = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Some actions are unsupported on certain browsers — ignore.
      }
    };

    set("play", () => play());
    set("pause", () => pause());
    set("stop", () => pause());
    set("nexttrack", canSkip ? () => next() : null);
    set("previoustrack", canSkip ? () => previous() : null);

    return () => {
      set("play", null);
      set("pause", null);
      set("stop", null);
      set("nexttrack", null);
      set("previoustrack", null);
    };
  }, [play, pause, next, previous, playlist.length]);

  /** Apply volume + mute to the audio element in a cross-browser way. */
  const applyAudioLevels = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const effective = mutedRef.current ? 0 : volumeRef.current;
    // Set both: `muted` for correct semantics, and `volume` to 0 so muting
    // works even on browsers that are flaky about the muted property.
    audio.muted = mutedRef.current;
    audio.volume = effective;
  }, []);

  const setVolume = useCallback(
    (value: number) => {
      const v = clamp(value, 0, 1);
      volumeRef.current = v;
      // Raising the volume from a muted state unmutes.
      if (v > 0 && mutedRef.current) {
        mutedRef.current = false;
        setMuted(false);
      }
      // Lowering to 0 via the slider counts as muted.
      if (v === 0 && !mutedRef.current) {
        mutedRef.current = true;
        setMuted(true);
      }
      applyAudioLevels();
      setVolumeState(v);
      try {
        localStorage.setItem(VOLUME_STORAGE_KEY, String(v));
      } catch {
        /* ignore storage errors */
      }
    },
    [applyAudioLevels],
  );

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    // If unmuting while the volume is at 0, restore a sensible level.
    if (!next && volumeRef.current === 0) {
      volumeRef.current = 0.5;
      setVolumeState(0.5);
    }
    applyAudioLevels();
    setMuted(next);
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, String(next));
    } catch {
      /* ignore storage errors */
    }
  }, [applyAudioLevels]);

  const value = useMemo<RadioPlayerContextValue>(
    () => ({
      status,
      streamStatus,
      volume,
      muted,
      isPlaying: status === "playing" || status === "loading",
      currentStation,
      play,
      pause,
      toggle,
      setVolume,
      toggleMute,
      selectStation,
      setStationWithoutPlaying,
      playlist,
      setPlaylist,
      next,
      previous,
      sleepRemaining,
      setSleepTimer,
      cancelSleepTimer,
    }),
    [
      status,
      streamStatus,
      volume,
      muted,
      currentStation,
      play,
      pause,
      toggle,
      setVolume,
      toggleMute,
      selectStation,
      setStationWithoutPlaying,
      playlist,
      setPlaylist,
      next,
      previous,
      sleepRemaining,
      setSleepTimer,
      cancelSleepTimer,
    ],
  );

  return (
    <RadioPlayerContext.Provider value={value}>
      {children}
    </RadioPlayerContext.Provider>
  );
}

/** Access the shared radio player. Must be used within RadioPlayerProvider. */
export function useRadioPlayer(): RadioPlayerContextValue {
  const ctx = useContext(RadioPlayerContext);
  if (!ctx) {
    throw new Error("useRadioPlayer must be used within a RadioPlayerProvider");
  }
  return ctx;
}
