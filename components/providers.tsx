"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { FavoritesProvider } from "@/hooks/use-favorites";
import { RadioPlayerProvider } from "@/hooks/use-radio-player";

/**
 * Global client-side providers.
 * - ThemeProvider: dark mode (defaults to dark, the station's native look).
 * - RadioPlayerProvider: shared audio engine so playback survives navigation.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <FavoritesProvider>
        <RadioPlayerProvider>{children}</RadioPlayerProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
