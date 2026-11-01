"use client";

import { cn } from "@/lib/utils";
import type { StreamStatus as Status } from "@/types";

interface StreamStatusProps {
  status: Status;
  className?: string;
}

const CONFIG: Record<
  Status,
  { label: string; dot: string; text: string; pulse: boolean }
> = {
  online: {
    label: "Live",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    pulse: true,
  },
  offline: {
    label: "Offline",
    dot: "bg-red-400",
    text: "text-red-300",
    pulse: false,
  },
  checking: {
    label: "Connecting",
    dot: "bg-amber-400",
    text: "text-amber-300",
    pulse: true,
  },
};

/**
 * Compact pill showing the live connectivity state of the stream.
 */
export function StreamStatus({ status, className }: StreamStatusProps) {
  const cfg = CONFIG[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {cfg.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-pulse-ring rounded-full opacity-75",
              cfg.dot,
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", cfg.dot)} />
      </span>
      <span className={cfg.text}>{cfg.label}</span>
    </div>
  );
}
