"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Heart,
  Loader2,
  Play,
  Radio,
  Search,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCountryStations } from "@/hooks/use-country-stations";
import { useFavorites } from "@/hooks/use-favorites";
import { useRadioPlayer } from "@/hooks/use-radio-player";
import {
  findPreferredDefault,
  PH_COUNTRY_CODE,
  STATIONS,
} from "@/lib/stations";
import { cn } from "@/lib/utils";
import type { PhRegion, Station } from "@/types";

/** Small animated bars shown on the station that is currently playing. */
function NowBars() {
  return (
    <div className="flex h-3 items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-0.5 origin-bottom animate-equalizer rounded-full bg-accent"
          style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface StationCardProps {
  station: Station;
  active: boolean;
  loading: boolean;
  isPlaying: boolean;
  favorite: boolean;
  onSelect: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
}

/** A single selectable station tile with a favorite toggle. */
function StationCard({
  station,
  active,
  loading,
  isPlaying,
  favorite,
  onSelect,
  onToggleFavorite,
}: StationCardProps) {
  return (
    <li
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border p-4 transition-all",
        active
          ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(station)}
        aria-pressed={active}
        aria-label={`Play ${station.name}`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg transition-colors",
            active
              ? "bg-primary/20 text-primary"
              : "bg-white/5 text-muted-foreground group-hover:text-foreground",
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : active && isPlaying ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">
              {station.name}
            </p>
            {active && isPlaying && <NowBars />}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {station.genre}
          </p>
        </div>

        <span
          className="shrink-0 text-base"
          title={station.country}
          aria-hidden="true"
        >
          {station.flag}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(station)}
        aria-pressed={favorite}
        aria-label={
          favorite
            ? `Remove ${station.name} from favorites`
            : `Add ${station.name} to favorites`
        }
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
          favorite
            ? "text-rose-400 hover:text-rose-300"
            : "text-muted-foreground hover:text-rose-400",
        )}
      >
        <Heart
          className={cn("h-5 w-5 transition-transform", favorite && "fill-current scale-110")}
        />
      </button>
    </li>
  );
}

/**
 * Radio Garden style station browser. Lets the user search and pick from
 * the curated directory, plus load the full list of Philippine stations
 * live from the open Radio Browser API. Philippine stations are grouped by
 * island region: Luzon, Visayas and Mindanao.
 */
export function StationPicker() {
  const {
    currentStation,
    selectStation,
    setStationWithoutPlaying,
    setPlaylist,
    status,
    isPlaying,
  } = useRadioPlayer();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const {
    stations: phStations,
    state: phState,
    error: phError,
    load: loadPh,
  } = useCountryStations(PH_COUNTRY_CODE, "Philippines");
  const [query, setQuery] = useState("");
  // Section keys that are collapsed (hidden). Empty = all expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setCollapsed((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(key)) nextSet.delete(key);
      else nextSet.add(key);
      return nextSet;
    });
  };

  // Auto-load Philippine stations on mount so they appear first by default.
  // Runs in the browser (visitor's network), so it is unaffected by
  // build-time / corporate network category filters.
  useEffect(() => {
    void loadPh();
  }, [loadPh]);

  // Once PH stations load, make AWR Hope Radio the default — but only if the
  // listener hasn't already chosen a station and nothing is playing yet.
  // Uses the live stream URL from Radio Browser (not a guessed hardcoded one).
  const defaultApplied = useRef(false);
  useEffect(() => {
    if (defaultApplied.current) return;
    if (phState !== "loaded" || phStations.length === 0) return;

    let hasSavedStation = false;
    try {
      hasSavedStation = localStorage.getItem("radio:station") !== null;
    } catch {
      /* ignore */
    }
    // Don't override a returning listener's choice or an in-progress stream.
    if (hasSavedStation || status === "playing" || status === "loading") {
      defaultApplied.current = true;
      return;
    }

    const preferred = findPreferredDefault(phStations);
    if (preferred) {
      defaultApplied.current = true;
      // Set as current without autoplaying (browsers block autoplay until a
      // user gesture). The listener presses play to start AWR Hope Radio.
      setStationWithoutPlaying(preferred);
    }
  }, [phState, phStations, status, setStationWithoutPlaying]);

  // Merge curated + live PH stations, de-duplicated by stream URL, with
  // Philippine stations listed first and all other countries at the end.
  const allStations = useMemo<Station[]>(() => {
    const seen = new Set(STATIONS.map((s) => s.streamUrl));
    const merged = [...STATIONS];
    for (const s of phStations) {
      if (!seen.has(s.streamUrl)) {
        seen.add(s.streamUrl);
        merged.push(s);
      }
    }
    // Order so the flat playlist (used by next/previous) matches the grouped
    // display: Luzon → Visayas → Mindanao → Other PH → International.
    const rank = (s: Station): number => {
      if (s.country !== "Philippines") return 4;
      switch (s.region) {
        case "Luzon":
          return 0;
        case "Visayas":
          return 1;
        case "Mindanao":
          return 2;
        default:
          return 3;
      }
    };
    return merged
      .map((s, i) => ({ s, i }))
      .sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i)
      .map(({ s }) => s);
  }, [phStations]);

  // Keep the player's next/previous playlist in sync with the full list.
  useEffect(() => {
    setPlaylist(allStations);
  }, [allStations, setPlaylist]);

  const filtered = useMemo<Station[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allStations;
    return allStations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.region ?? "").toLowerCase().includes(q),
    );
  }, [query, allStations]);

  // Group the filtered stations into display sections:
  //   Luzon · Visayas · Mindanao · Other Philippine · International
  const sections = useMemo(() => {
    const groups: Array<{ key: string; label: string; items: Station[] }> = [
      { key: "Favorites", label: "❤️ Favorites", items: [] },
      { key: "Luzon", label: "🏙️ Luzon", items: [] },
      { key: "Visayas", label: "🏝️ Visayas", items: [] },
      { key: "Mindanao", label: "⛰️ Mindanao", items: [] },
      { key: "Other", label: "🇵🇭 Other Philippine", items: [] },
      { key: "International", label: "🌍 International", items: [] },
    ];
    const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));

    // Favorites appear in their own section (matching the current filter).
    const q = query.trim().toLowerCase();
    byKey.Favorites.items = favorites.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.region ?? "").toLowerCase().includes(q),
    );

    for (const s of filtered) {
      if (s.country === "Philippines") {
        const region: PhRegion = s.region ?? "Other";
        byKey[region].items.push(s);
      } else {
        byKey.International.items.push(s);
      }
    }
    // Only render sections that actually have stations.
    return groups.filter((g) => g.items.length > 0);
  }, [filtered, favorites, query]);

  return (
    <section aria-label="Browse stations" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Browse stations</h2>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
            {allStations.length}
          </span>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, genre, country…"
            aria-label="Search stations"
            className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Philippine stations status */}
      {phState === "loading" && (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span aria-hidden="true">🇵🇭</span>
          Loading Philippine stations…
        </p>
      )}

      {phState === "loaded" && phStations.length > 0 && (
        <p className="text-sm text-emerald-300">
          <span aria-hidden="true">🇵🇭</span> {phStations.length} Philippine
          stations loaded — listed first below.
        </p>
      )}

      {phState === "error" && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row">
          <p className="inline-flex items-center gap-1.5 text-sm text-red-300">
            <AlertCircle className="h-4 w-4" />
            {phError ?? "Could not load Philippine stations."}
          </p>
          <Button
            onClick={() => void loadPh()}
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {sections.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
          No stations match “{query}”.
        </p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            // While searching, keep every matching section expanded.
            const isOpen = query.trim() !== "" || !collapsed.has(section.key);
            const panelId = `section-${section.key}`;
            return (
              <div key={section.key} className="space-y-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/5"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      !isOpen && "-rotate-90",
                    )}
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    {section.label}
                  </h3>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                    {section.items.length}
                  </span>
                </button>
                {isOpen && (
                  <ul
                    id={panelId}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {section.items.map((station) => (
                      <StationCard
                        key={`${section.key}-${station.id}`}
                        station={station}
                        active={station.id === currentStation.id}
                        loading={
                          station.id === currentStation.id &&
                          status === "loading"
                        }
                        isPlaying={isPlaying}
                        favorite={isFavorite(station.id)}
                        onSelect={selectStation}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
