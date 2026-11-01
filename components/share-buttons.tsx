"use client";

import { useState } from "react";
import {
  Check,
  Facebook,
  Link2,
  Send,
  Share2,
  Twitter,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  /** Absolute URL to share. */
  url: string;
  /** Title / message used by share targets. */
  title: string;
  className?: string;
}

/**
 * Social share buttons. Each opens the platform's share dialog pre-filled
 * with the site URL so visitors can share the station. When the browser
 * supports the native Web Share API (mobile), a system share sheet is used.
 * Includes a copy-link button with confirmation feedback.
 *
 * When the link is shared, the Open Graph thumbnail (app/opengraph-image.tsx)
 * is what renders as the preview card on the target platform.
 */
export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  const targets = [
    {
      key: "facebook",
      label: "Share on Facebook",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "twitter",
      label: "Share on X / Twitter",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      key: "telegram",
      label: "Share on Telegram",
      Icon: Send,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable (insecure context) */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled or share failed — ignore */
      }
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label="Share"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
        >
          <Share2 className="h-5 w-5" />
        </button>
      )}

      {targets.map(({ key, label, Icon, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}

      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:scale-110",
          copied
            ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/5 text-muted-foreground hover:border-primary/50 hover:text-primary",
        )}
      >
        {copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
      </button>
    </div>
  );
}
