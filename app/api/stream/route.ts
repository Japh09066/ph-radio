import { NextRequest } from "next/server";

/**
 * Audio stream proxy.
 *
 * Re-serves an upstream radio stream (often plain `http://`) over the site's
 * `https://` origin so it is not blocked by the browser's mixed-content
 * policy. This lets every Philippine station play, including the many that
 * only broadcast over http.
 *
 * Usage: /api/stream?url=<encoded upstream stream url>
 *
 * Runs on the Node.js runtime and streams the upstream response body straight
 * through without buffering, so it works for continuous live radio.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow long-lived streaming connections.
export const maxDuration = 300;

/** Only proxy to real http(s) hosts; reject anything else (SSRF guard). */
function isAllowedUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  // Block loopback / private / link-local targets.
  const blocked =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (blocked) return null;

  return url;
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  const url = isAllowedUrl(target);
  if (!url) {
    return new Response("Invalid or disallowed stream URL", { status: 400 });
  }

  // Forward Range so seeking / reconnection behaves, and present a
  // browser-like UA since many Icecast/Shoutcast hosts reject default agents.
  const range = req.headers.get("range");
  const upstreamHeaders: HeadersInit = {
    "User-Agent":
      "Mozilla/5.0 (compatible; PHRadio/1.0; +https://online-radio-stream.vercel.app)",
    Accept: "audio/*,*/*;q=0.8",
    ...(range ? { Range: range } : {}),
  };

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), {
      headers: upstreamHeaders,
      // Do not cache a live stream.
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    return new Response("Upstream stream unavailable", { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Upstream returned ${upstream.status}`, {
      status: 502,
    });
  }

  // Pass through the essential streaming headers.
  const headers = new Headers();
  const contentType =
    upstream.headers.get("content-type") ?? "audio/mpeg";
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("Access-Control-Allow-Origin", "*");
  const acceptRanges = upstream.headers.get("accept-ranges");
  if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) headers.set("Content-Range", contentRange);

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
