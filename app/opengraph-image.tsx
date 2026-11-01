import { ImageResponse } from "next/og";

import { stationConfig } from "@/lib/station";

/**
 * Dynamically generated Open Graph / Twitter share thumbnail (1200×630).
 *
 * This is the preview card shown when the site link is shared on social
 * media or messaging apps. Next.js wires it into OG + Twitter tags.
 *
 * Runs on the Node runtime (not edge) — the edge runtime produced an empty
 * body for this generator. Built from div primitives only, since next/og
 * (Satori) renders a limited subset and raw SVG shapes were unreliable here.
 */

export const alt = `${stationConfig.name} — ${stationConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Philippine flag: blue over red, white hoist triangle, sun and three stars. */
function PhilippineFlag() {
  const star = (left: number, top: number) => (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 16,
        height: 16,
        borderRadius: 4,
        background: "#fcd116",
        display: "flex",
        transform: "rotate(45deg)",
      }}
    />
  );
  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 200,
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ flex: 1, background: "#0038a8", display: "flex" }} />
      <div style={{ flex: 1, background: "#ce1126", display: "flex" }} />
      {/* White hoist triangle */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          borderTop: "100px solid transparent",
          borderBottom: "100px solid transparent",
          borderLeft: "173px solid #ffffff",
        }}
      />
      {/* Sun */}
      <div
        style={{
          position: "absolute",
          left: 36,
          top: 83,
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "#fcd116",
          display: "flex",
        }}
      />
      {star(24, 24)}
      {star(24, 160)}
      {star(120, 92)}
    </div>
  );
}

/** Radio / broadcast icon built from concentric rings and a center dot. */
function RadioIcon() {
  const ring = (d: number, color: string, border: number) => (
    <div
      style={{
        position: "absolute",
        width: d,
        height: d,
        borderRadius: 999,
        border: `${border}px solid ${color}`,
        display: "flex",
      }}
    />
  );
  return (
    <div
      style={{
        position: "relative",
        width: 150,
        height: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {ring(140, "rgba(255,255,255,0.35)", 7)}
      {ring(96, "rgba(255,255,255,0.65)", 7)}
      <div
        style={{
          position: "absolute",
          width: 34,
          height: 34,
          borderRadius: 999,
          background: "#ffffff",
          display: "flex",
        }}
      />
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0a0a14",
          backgroundImage:
            "radial-gradient(1000px 600px at 82% -12%, #7c3aed66, transparent), radial-gradient(900px 600px at -10% 112%, #22d3ee40, transparent)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
            marginBottom: 48,
          }}
        >
          {/* Radio icon in a gradient rounded square */}
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: 40,
              background: "linear-gradient(135deg, #7c3aed, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(124,58,237,0.5)",
            }}
          >
            <RadioIcon />
          </div>

          <PhilippineFlag />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 30px",
              borderRadius: 999,
              background: "rgba(16,185,129,0.15)",
              border: "2px solid rgba(16,185,129,0.45)",
              color: "#6ee7b7",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#34d399",
                display: "flex",
              }}
            />
            LIVE 24/7
          </div>
        </div>

        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            letterSpacing: "-3px",
          }}
        >
          {stationConfig.name}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 46,
            color: "#c7c9d1",
            fontWeight: 500,
          }}
        >
          {stationConfig.tagline}
        </div>

        <div style={{ marginTop: 44, fontSize: 30, color: "#8b8d98", display: "flex" }}>
          Luzon · Visayas · Mindanao — every station in one player
        </div>
      </div>
    ),
    size,
  );
}
