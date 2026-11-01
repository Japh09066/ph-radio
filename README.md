# 📻 Online Radio Streaming Website

A modern, production-ready online radio platform built with **Next.js 15**, **React 19**, **TypeScript** and **Tailwind CSS**. Visitors can instantly play a live audio stream from an Icecast or AzuraCast server through a premium, glassmorphism player interface.

![Dark](https://img.shields.io/badge/theme-dark-0a0a14) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)

## ✨ Features

### Station Directory (Radio Garden style)
- Browse a curated list of reliable, CORS-friendly public stations
- Search by name, genre or country
- One click to switch the live stream; selection is remembered
- Ships with SomaFM, Radio Paradise and Radio France (FIP) streams
- **Every Philippine station** loaded live from the open [Radio Browser](https://api.radio-browser.info/) database (45,000+ worldwide), with no broken/https-only filtering. `http://` streams are played through a built-in proxy (`/api/stream`) so they are not blocked by the browser's mixed-content policy.

### Live Radio Player
- Play / pause, volume control, mute / unmute
- Stream loading indicator and online / offline status
- **Automatic reconnection** with exponential backoff when the connection drops
- **Persistent player state across navigation** (single shared audio engine via React Context)
- Volume, mute and selected station persisted to `localStorage`
- **Sleep timer** — auto-pause after 15 / 30 / 45 / 60 / 90 minutes, with live countdown and cancel

### Now Playing
- Current song title, artist and album artwork
- Polls an AzuraCast-style metadata endpoint
- Graceful fallback when no metadata is available

### Station Branding
- Logo, name, tagline and description — all configurable via env vars

### Experience
- Fully responsive, mobile-first design
- Dark mode by default with glassmorphism player card
- Smooth animations (respects `prefers-reduced-motion`)
- Accessible UI (ARIA labels, keyboard-friendly controls, live regions)
- SEO-friendly: metadata, Open Graph, `robots.txt`, `sitemap.xml`

## 🏗️ Architecture

The project follows Clean Architecture and SOLID principles with a clear separation of concerns:

```
app/            # Next.js App Router: layout, page, SEO routes, global styles
components/     # Reusable presentational components
  ui/           # shadcn/ui-style primitives (Button, Slider)
hooks/          # Audio engine + metadata logic (business logic layer)
lib/            # Config, station directory & utilities (station.ts, stations.ts, utils.ts)
types/          # Shared domain types (single source of truth)
public/         # Static assets
```

- **`hooks/use-radio-player.tsx`** owns the single `HTMLAudioElement` and exposes playback through a Context provider, so state survives route changes.
- **`hooks/use-now-playing.ts`** isolates metadata polling and parsing.
- **`lib/station.ts`** resolves branding configuration from `NEXT_PUBLIC_*` environment variables with sensible fallbacks.
- **`lib/stations.ts`** holds the curated, browser-playable station directory. Add or edit entries here to customise the dial. Every stream is CORS-enabled so it plays directly in the browser.
- Components are pure and receive data via props — easy to test and reuse.

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your station details:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_STREAM_URL` | **Required.** Icecast / AzuraCast stream URL (e.g. `https://host/radio/8000/radio.mp3`) |
| `NEXT_PUBLIC_NOWPLAYING_URL` | Optional. AzuraCast now-playing JSON API (e.g. `https://host/api/nowplaying/1`) |
| `NEXT_PUBLIC_STATION_NAME` | Station name |
| `NEXT_PUBLIC_STATION_TAGLINE` | Short slogan |
| `NEXT_PUBLIC_STATION_DESCRIPTION` | Longer description |
| `NEXT_PUBLIC_SOCIAL_*` | Optional social links (`TWITTER`, `INSTAGRAM`, `FACEBOOK`, `YOUTUBE`) |

> The app ships with working demo defaults (SomaFM Groove Salad) so it runs out of the box.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build && npm start
```

## ☁️ Deploy to Vercel

### Option A — Dashboard
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel — the framework is auto-detected (Next.js).
3. Add your `NEXT_PUBLIC_*` environment variables.
4. Deploy.

### Option B — CLI
```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

`vercel.json` pins the framework and build command for you.

## 🎙️ Connecting a stream

Any publicly reachable Icecast or AzuraCast MP3/AAC mountpoint works. For live metadata, point `NEXT_PUBLIC_NOWPLAYING_URL` at your AzuraCast station's `/api/nowplaying/{id}` endpoint — the app parses `now_playing.song.{title,artist,art}` automatically.

## 🧰 Tech Stack

- **Next.js 15** (App Router, Server Components)
- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS** + shadcn/ui-style primitives
- **next-themes** for dark mode
- **lucide-react** icons

## 📄 License

MIT — use it freely for your own station.
