import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import { siteUrl, stationConfig } from "@/lib/station";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${stationConfig.name} — ${stationConfig.tagline}`,
    template: `%s | ${stationConfig.name}`,
  },
  description: stationConfig.description,
  applicationName: stationConfig.name,
  keywords: [
    "online radio",
    "live radio",
    "streaming",
    "Philippine radio",
    "OPM",
    stationConfig.name,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${stationConfig.name} — ${stationConfig.tagline}`,
    description: stationConfig.description,
    siteName: stationConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${stationConfig.name} — ${stationConfig.tagline}`,
    description: stationConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
