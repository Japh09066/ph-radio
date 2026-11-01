import type { Station } from "@/types";

/**
 * Curated directory of reliable, browser-playable public radio stations.
 *
 * These are well-known free streams that play directly in an HTML5 <audio>
 * element. Server-side probes may return 403 (the hosts filter non-browser
 * user agents), but real browsers stream them fine.
 *
 * This baked-in list guarantees the app works out of the box without
 * depending on any external API at runtime.
 */
export const STATIONS: Station[] = [
  {
    id: "somafm-groovesalad",
    name: "Groove Salad",
    genre: "Ambient / Downtempo",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
  },
  {
    id: "somafm-dronezone",
    name: "Drone Zone",
    genre: "Atmospheric / Ambient",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/dronezone-128-mp3",
  },
  {
    id: "somafm-defcon",
    name: "DEF CON Radio",
    genre: "Electronic",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/defcon-128-mp3",
  },
  {
    id: "somafm-indiepop",
    name: "Indie Pop Rocks",
    genre: "Indie / Alternative",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/indiepop-128-mp3",
  },
  {
    id: "somafm-u80s",
    name: "Underground 80s",
    genre: "Synthwave / New Wave",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/u80s-128-mp3",
  },
  {
    id: "somafm-lush",
    name: "Lush",
    genre: "Vocal / Chill",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/lush-128-mp3",
  },
  {
    id: "somafm-fluid",
    name: "Fluid",
    genre: "Instrumental Hip-Hop",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/fluid-128-mp3",
  },
  {
    id: "somafm-spacestation",
    name: "Space Station Soma",
    genre: "Ambient / Space",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/spacestation-128-mp3",
  },
  {
    id: "somafm-poptron",
    name: "PopTron",
    genre: "Electro Pop",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/poptron-128-mp3",
  },
  {
    id: "somafm-beatblender",
    name: "Beat Blender",
    genre: "Deep House / Downtempo",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/beatblender-128-mp3",
  },
  {
    id: "somafm-7soul",
    name: "Seven Inch Soul",
    genre: "Classic Soul / Funk",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/7soul-128-mp3",
  },
  {
    id: "somafm-thetrip",
    name: "The Trip",
    genre: "Progressive House",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://ice1.somafm.com/thetrip-128-mp3",
  },
  {
    id: "radioparadise-main",
    name: "Radio Paradise",
    genre: "Eclectic Mix",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://stream.radioparadise.com/mp3-128",
  },
  {
    id: "radioparadise-mellow",
    name: "RP Mellow Mix",
    genre: "Chill / Mellow",
    country: "USA",
    flag: "🇺🇸",
    streamUrl: "https://stream.radioparadise.com/mellow-128",
  },
  {
    id: "radiofrance-fip",
    name: "FIP",
    genre: "Eclectic / Jazz",
    country: "France",
    flag: "🇫🇷",
    streamUrl: "https://icecast.radiofrance.fr/fip-midfi.mp3",
  },
  {
    id: "radiofrance-fiprock",
    name: "FIP Rock",
    genre: "Rock",
    country: "France",
    flag: "🇫🇷",
    streamUrl: "https://icecast.radiofrance.fr/fiprock-midfi.mp3",
  },
  {
    id: "radiofrance-interr",
    name: "France Inter",
    genre: "Talk / Culture",
    country: "France",
    flag: "🇫🇷",
    streamUrl: "https://icecast.radiofrance.fr/franceinter-midfi.mp3",
  },

];

/** Country code used by the "load more from this country" feature. */
export const PH_COUNTRY_CODE = "PH";

/** Resolve a station by id, falling back to the first station. */
export function getStationById(id: string | null | undefined): Station {
  if (!id) return STATIONS[0];
  return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}
