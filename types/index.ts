/**
 * Shared domain types for the radio application.
 */

/** Playback state of the audio element. */
export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

/** Connectivity status of the live stream. */
export type StreamStatus = "online" | "offline" | "checking";

/** Metadata describing the currently playing track. */
export interface NowPlayingTrack {
  title: string;
  artist: string;
  /** Optional album / cover artwork URL. */
  artwork?: string | null;
}

/** Static station branding information. */
export interface StationConfig {
  name: string;
  tagline: string;
  description: string;
  streamUrl: string;
  nowPlayingUrl?: string;
}

/** A single social media link. */
export interface SocialLink {
  label: string;
  href: string;
  /** Icon key resolved by the SocialLinks component. */
  icon: "twitter" | "instagram" | "facebook" | "youtube";
}

/** A selectable radio station in the directory (Radio Garden style). */
export interface Station {
  /** Stable unique id. */
  id: string;
  name: string;
  /** Short genre / tagline shown under the name. */
  genre: string;
  /** Country or region label. */
  country: string;
  /** Two-letter flag emoji or code for quick visual id. */
  flag: string;
  /** Direct audio stream URL (mp3/aac/ogg). */
  streamUrl: string;
  /** Philippine island group, when known (used for grouping). */
  region?: PhRegion;
}

/** Philippine island groups used to group the station directory. */
export type PhRegion = "Luzon" | "Visayas" | "Mindanao" | "Other";
