import type { SocialLink, StationConfig } from "@/types";

/**
 * Read a public environment variable with a sensible fallback.
 * Keeps the app functional out-of-the-box while remaining fully configurable.
 */
function env(key: string, fallback = ""): string {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : fallback;
}

/**
 * Single source of truth for station branding and stream configuration.
 * Values are driven entirely by NEXT_PUBLIC_* environment variables.
 */
export const stationConfig: StationConfig = {
  name: env("NEXT_PUBLIC_STATION_NAME", "PH Radio"),
  tagline: env("NEXT_PUBLIC_STATION_TAGLINE", "Your Philippine stations, live"),
  description: env(
    "NEXT_PUBLIC_STATION_DESCRIPTION",
    "PH Radio brings together the best Philippine radio stations in one place. Tune in to OPM, news, and talk from across the islands, streaming live 24/7.",
  ),
  streamUrl: env(
    "NEXT_PUBLIC_STREAM_URL",
    "https://ice1.somafm.com/groovesalad-128-mp3",
  ),
  nowPlayingUrl: env("NEXT_PUBLIC_NOWPLAYING_URL") || undefined,
};

/**
 * Canonical public URL of the deployed site. Used for absolute Open Graph
 * image URLs and for generating social share links. Vercel exposes the
 * deployment host via VERCEL_PROJECT_PRODUCTION_URL at build time.
 */
export const siteUrl: string = (() => {
  const explicit = env("NEXT_PUBLIC_SITE_URL");
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "https://online-radio-stream.vercel.app";
})();

/** Build the list of social links, omitting any that are not configured. */
export function getSocialLinks(): SocialLink[] {
  const candidates: Array<SocialLink & { enabled: boolean }> = [
    {
      label: "Twitter / X",
      href: env("NEXT_PUBLIC_SOCIAL_TWITTER"),
      icon: "twitter",
      enabled: Boolean(env("NEXT_PUBLIC_SOCIAL_TWITTER")),
    },
    {
      label: "Instagram",
      href: env("NEXT_PUBLIC_SOCIAL_INSTAGRAM"),
      icon: "instagram",
      enabled: Boolean(env("NEXT_PUBLIC_SOCIAL_INSTAGRAM")),
    },
    {
      label: "Facebook",
      href: env("NEXT_PUBLIC_SOCIAL_FACEBOOK"),
      icon: "facebook",
      enabled: Boolean(env("NEXT_PUBLIC_SOCIAL_FACEBOOK")),
    },
    {
      label: "YouTube",
      href: env("NEXT_PUBLIC_SOCIAL_YOUTUBE"),
      icon: "youtube",
      enabled: Boolean(env("NEXT_PUBLIC_SOCIAL_YOUTUBE")),
    },
  ];

  return candidates
    .filter((link) => link.enabled)
    .map((link) => ({
      label: link.label,
      href: link.href,
      icon: link.icon,
    }));
}
