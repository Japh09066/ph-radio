import type { PhRegion, Station } from "@/types";

/**
 * Minimal client for the free, open Radio Browser API.
 * https://api.radio-browser.info/
 *
 * Runs in the browser so requests originate from the visitor's network
 * (not the build environment). The API requires no key.
 *
 * Note: Radio Browser recommends resolving a server from its DNS/mirror list,
 * but the stable `all.api.radio-browser.info` round-robin host works directly
 * and is used here with a couple of fallbacks for resilience.
 */

const API_HOSTS = [
  "https://all.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://fi1.api.radio-browser.info",
];

/** Raw shape of a station record returned by the API (subset we use). */
interface RawStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  url: string;
  tags: string;
  state: string;
  countrycode: string;
  codec: string;
  bitrate: number;
  votes: number;
  lastcheckok: number;
}

/** Simple flag emoji from an ISO 3166-1 alpha-2 country code. */
function flagFromCountryCode(code: string): string {
  if (!code || code.length !== 2) return "📻";
  const A = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split("")
    .map((c) => A + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

/** Turn a comma tag string into a short, human genre label. */
function genreFromTags(tags: string, fallback: string): string {
  const first = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" / ");
  return first || fallback;
}

/**
 * Keyword lists (lowercase) for classifying a Philippine station into an
 * island group. Matched against the station's state, tags, name and URL.
 * Covers provinces and major cities for each region.
 */
const REGION_KEYWORDS: Record<Exclude<PhRegion, "Other">, string[]> = {
  Luzon: [
    "luzon",
    "metro manila",
    "manila",
    "ncr",
    "quezon city",
    "makati",
    "pasig",
    "taguig",
    "caloocan",
    "paranaque",
    "mandaluyong",
    "marikina",
    "muntinlupa",
    "las pinas",
    "valenzuela",
    "cavite",
    "laguna",
    "batangas",
    "rizal",
    "quezon",
    "bulacan",
    "pampanga",
    "tarlac",
    "zambales",
    "bataan",
    "nueva ecija",
    "aurora",
    "pangasinan",
    "la union",
    "ilocos",
    "vigan",
    "laoag",
    "cagayan",
    "tuguegarao",
    "isabela",
    "nueva vizcaya",
    "quirino",
    "batanes",
    "baguio",
    "benguet",
    "cordillera",
    "car",
    "abra",
    "kalinga",
    "apayao",
    "ifugao",
    "mountain province",
    "bicol",
    "albay",
    "legazpi",
    "legaspi",
    "naga",
    "camarines",
    "sorsogon",
    "masbate",
    "catanduanes",
    "marinduque",
    "mindoro",
    "calapan",
    "palawan",
    "puerto princesa",
    "romblon",
    "dagupan",
    "olongapo",
    "angeles",
    "san fernando",
    "lipa",
    "antipolo",
    "calamba",
  ],
  Visayas: [
    "visayas",
    "cebu",
    "cebu city",
    "mandaue",
    "lapu-lapu",
    "lapu lapu",
    "bohol",
    "tagbilaran",
    "negros",
    "bacolod",
    "dumaguete",
    "iloilo",
    "iloilo city",
    "panay",
    "aklan",
    "kalibo",
    "boracay",
    "antique",
    "capiz",
    "roxas",
    "guimaras",
    "leyte",
    "tacloban",
    "ormoc",
    "southern leyte",
    "samar",
    "catbalogan",
    "calbayog",
    "borongan",
    "biliran",
    "siquijor",
    "tagbilaran",
  ],
  Mindanao: [
    "mindanao",
    "davao",
    "davao city",
    "cagayan de oro",
    "cdo",
    "misamis",
    "iligan",
    "lanao",
    "marawi",
    "zamboanga",
    "pagadian",
    "dipolog",
    "dapitan",
    "general santos",
    "gensan",
    "sarangani",
    "south cotabato",
    "cotabato",
    "kidapawan",
    "sultan kudarat",
    "koronadal",
    "tacurong",
    "bukidnon",
    "malaybalay",
    "valencia",
    "camiguin",
    "surigao",
    "butuan",
    "agusan",
    "bislig",
    "tandag",
    "dinagat",
    "maguindanao",
    "barmm",
    "armm",
    "basilan",
    "sulu",
    "jolo",
    "tawi-tawi",
    "tawi tawi",
    "ozamiz",
    "tagum",
    "panabo",
    "digos",
    "mati",
  ],
};

/**
 * Classify a station into a Philippine island group using its state,
 * tags, name and URL. Returns "Other" when nothing matches.
 */
function classifyRegion(raw: RawStation): PhRegion {
  const haystack = [raw.state, raw.tags, raw.name, raw.url_resolved || raw.url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Check Visayas and Mindanao before Luzon: some Luzon keywords (e.g.
  // "cagayan") are substrings that could collide, so match the more specific
  // regions first, then fall back to Luzon.
  const order: Array<Exclude<PhRegion, "Other">> = [
    "Visayas",
    "Mindanao",
    "Luzon",
  ];
  for (const region of order) {
    if (REGION_KEYWORDS[region].some((kw) => haystack.includes(kw))) {
      return region;
    }
  }
  return "Other";
}

/**
 * Ensure a stream URL is playable from an https site.
 * http:// streams are routed through our same-origin proxy so the browser's
 * mixed-content policy does not block them; https:// streams are used as-is.
 */
function toPlayableUrl(streamUrl: string): string {
  if (streamUrl.startsWith("http://")) {
    return `/api/stream?url=${encodeURIComponent(streamUrl)}`;
  }
  return streamUrl;
}

function mapStation(raw: RawStation, countryLabel: string): Station | null {
  const streamUrl = raw.url_resolved || raw.url;
  if (!streamUrl || !raw.name?.trim()) return null;
  return {
    id: `rb-${raw.stationuuid}`,
    name: raw.name.trim(),
    genre: genreFromTags(raw.tags, "Radio"),
    country: countryLabel,
    flag: flagFromCountryCode(raw.countrycode),
    streamUrl: toPlayableUrl(streamUrl),
    region: classifyRegion(raw),
  };
}

/**
 * Fetch stations for a given ISO country code (e.g. "PH"), ordered by votes.
 * Only reachable stations are returned (those that passed Radio Browser's
 * last health check); http streams are kept and proxied to https so they
 * still play. Results are de-duplicated by the original upstream URL.
 */
export async function fetchStationsByCountry(
  countryCode: string,
  countryLabel: string,
  limit = 1000,
): Promise<Station[]> {
  // `hidebroken=true` asks the API to exclude stations that failed its last
  // health check, so unreachable stations are dropped. http streams are still
  // kept (they are proxied to https so they play).
  const path = `/json/stations/bycountrycodeexact/${encodeURIComponent(
    countryCode,
  )}?hidebroken=true&order=votes&reverse=true&limit=${limit}`;

  let lastError: unknown = null;

  for (const host of API_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = (await res.json()) as RawStation[];

      // De-duplicate by the original upstream URL so proxied/direct variants
      // of the same stream don't appear twice.
      const seen = new Set<string>();
      const stations: Station[] = [];
      for (const r of raw) {
        // Skip stations whose last health check failed (unreachable).
        if (r.lastcheckok !== 1) continue;
        const original = r.url_resolved || r.url;
        if (!original) continue;
        if (seen.has(original)) continue;
        const mapped = mapStation(r, countryLabel);
        if (!mapped) continue;
        seen.add(original);
        stations.push(mapped);
      }
      return stations;
    } catch (err) {
      lastError = err;
      // Try the next host.
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to reach Radio Browser API");
}
