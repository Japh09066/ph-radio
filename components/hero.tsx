import { Radio } from "lucide-react";

import { StreamStatusBadge } from "@/components/hero-status";

interface HeroProps {
  name: string;
  tagline: string;
}

/**
 * Top-of-page hero: station logo mark, name, tagline and a live badge.
 */
export function Hero({ name, tagline }: HeroProps) {
  return (
    <header className="relative flex flex-col items-center text-center animate-fade-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
        <Radio className="h-8 w-8 text-primary-foreground" />
      </div>

      <StreamStatusBadge />

      <h1 className="mt-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl">
        {name}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground sm:text-xl">
        {tagline}
      </p>
    </header>
  );
}
