"use client";

import {
  AlertCircle,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SleepTimer } from "@/components/sleep-timer";
import { StreamStatus } from "@/components/stream-status";
import { useRadioPlayer } from "@/hooks/use-radio-player";
import { cn } from "@/lib/utils";

/**
 * The primary live radio player: a glassmorphism card with transport
 * controls, volume slider, mute toggle, loading indicator and stream status.
 * Reflects the currently selected station from the shared player state.
 */
export function RadioPlayer() {
  const {
    status,
    streamStatus,
    volume,
    muted,
    currentStation,
    playlist,
    toggle,
    next,
    previous,
    setVolume,
    toggleMute,
  } = useRadioPlayer();

  const canSkip = playlist.length > 1;

  const isLoading = status === "loading";
  const isPlaying = status === "playing";
  const isError = status === "error";

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <section
      aria-label="Live radio player"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-8"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span aria-hidden="true">{currentStation.flag}</span>
              {currentStation.country}
            </div>
            <h2 className="mt-1 truncate text-xl font-bold text-foreground sm:text-2xl">
              {currentStation.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {currentStation.genre}
            </p>
          </div>
          <StreamStatus status={streamStatus} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-6">
          {/* Transport controls: previous · play/pause · next */}
          <div className="flex items-center gap-5">
            <Button
              onClick={previous}
              size="icon"
              variant="ghost"
              disabled={!canSkip}
              aria-label="Previous station"
              className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            {/* Play / pause button with pulse ring */}
            <div className="relative">
              {isPlaying && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/40"
                />
              )}
              <Button
                onClick={toggle}
                size="icon"
                aria-label={
                  isPlaying || isLoading ? "Pause stream" : "Play stream"
                }
                aria-pressed={isPlaying}
                className="relative h-20 w-20 rounded-full text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="h-9 w-9 animate-spin" />
                ) : isError ? (
                  <Play className="h-9 w-9 translate-x-0.5" />
                ) : isPlaying ? (
                  <Pause className="h-9 w-9" />
                ) : (
                  <Play className="h-9 w-9 translate-x-0.5" />
                )}
              </Button>
            </div>

            <Button
              onClick={next}
              size="icon"
              variant="ghost"
              disabled={!canSkip}
              aria-label="Next station"
              className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          <p
            className="h-5 text-sm text-muted-foreground"
            aria-live="polite"
          >
            {isLoading && "Connecting to stream…"}
            {isPlaying && "You're listening live"}
            {status === "paused" && "Paused"}
            {status === "idle" && "Press play to start listening"}
            {isError && (
              <span className="inline-flex items-center gap-1.5 text-red-300">
                <AlertCircle className="h-4 w-4" />
                Stream unavailable — retrying automatically
              </span>
            )}
          </p>

          {/* Volume controls */}
          <div className="flex w-full max-w-xs items-center gap-3">
            <Button
              onClick={toggleMute}
              size="icon"
              variant="ghost"
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <VolumeIcon className="h-5 w-5" />
            </Button>
            <Slider
              value={muted ? 0 : volume * 100}
              onValueChange={(v) => setVolume(v / 100)}
              aria-label="Volume"
              className={cn(muted && "opacity-50")}
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Sleep timer */}
          <SleepTimer />
        </div>
      </div>
    </section>
  );
}
