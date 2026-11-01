"use client";

import { Disc3, Music2 } from "lucide-react";

import { useNowPlaying } from "@/hooks/use-now-playing";
import { useRadioPlayer } from "@/hooks/use-radio-player";
import { cn } from "@/lib/utils";

interface NowPlayingProps {
  nowPlayingUrl?: string;
}

/** Animated equalizer bars shown while audio is playing. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-1 origin-bottom rounded-full bg-primary",
            active ? "animate-equalizer" : "h-1 opacity-40",
          )}
          style={active ? { height: "100%", animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Displays current track metadata with album artwork.
 * Renders a clear fallback when no metadata endpoint is configured
 * or the stream provides no track information.
 */
export function NowPlaying({ nowPlayingUrl }: NowPlayingProps) {
  const { track } = useNowPlaying({ url: nowPlayingUrl });
  const { isPlaying, currentStation } = useRadioPlayer();

  const hasTrack = Boolean(track?.title);

  return (
    <section
      aria-label="Now playing"
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 ring-1 ring-white/10">
        {track?.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.artwork}
            alt={`${track.title} cover art`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/80">
            <Disc3
              className={cn("h-8 w-8", isPlaying && "animate-spin [animation-duration:4s]")}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Music2 className="h-3.5 w-3.5" />
          Now Playing
        </div>
        {hasTrack ? (
          <>
            <p className="mt-1 truncate text-base font-semibold text-foreground">
              {track?.title}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {track?.artist}
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 truncate text-base font-semibold text-foreground">
              {currentStation.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {currentStation.genre} · Live
            </p>
          </>
        )}
      </div>

      <Equalizer active={isPlaying} />
    </section>
  );
}
