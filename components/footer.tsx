import { Radio } from "lucide-react";

import { ShareButtons } from "@/components/share-buttons";

interface FooterProps {
  name: string;
  tagline: string;
  shareUrl: string;
  shareTitle: string;
}

/**
 * Site footer with branding, share buttons and copyright.
 */
export function Footer({ name, tagline, shareUrl, shareTitle }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-white/[0.02]">
      <div className="container flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted-foreground">{tagline}</p>
          </div>
        </div>

        <ShareButtons url={shareUrl} title={shareTitle} />
      </div>

      <div className="border-t border-white/5 py-4">
        <p className="container text-center text-xs text-muted-foreground">
          © {year} {name}. All rights reserved. Streaming worldwide, 24/7.
        </p>
      </div>
    </footer>
  );
}
