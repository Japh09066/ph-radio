"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRadioPlayer } from "@/hooks/use-radio-player";
import { cn } from "@/lib/utils";

/** Selectable durations in minutes. */
const PRESETS = [15, 30, 45, 60, 90];

/** Format minutes remaining as a compact "1h 05m" / "45m" label. */
function formatRemaining(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
  }
  return `${minutes}m`;
}

/**
 * Sleep timer control. Lets the listener auto-pause playback after a
 * chosen duration. Shows the remaining time and lets them cancel.
 */
export function SleepTimer() {
  const { sleepRemaining, setSleepTimer, cancelSleepTimer } = useRadioPlayer();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const active = sleepRemaining !== null;

  // Close the menu when clicking outside it.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant={active ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Sleep timer"
          className={cn(
            "gap-2 rounded-full text-xs",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <Moon className="h-4 w-4" />
          {active ? (
            <span className="tabular-nums">{formatRemaining(sleepRemaining)}</span>
          ) : (
            "Sleep timer"
          )}
        </Button>

        {active && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cancelSleepTimer}
            aria-label="Cancel sleep timer"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {open && (
        <div
          role="menu"
          aria-label="Sleep timer durations"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-card/95 p-1 shadow-xl backdrop-blur"
        >
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              role="menuitem"
              onClick={() => {
                setSleepTimer(minutes);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-white/10"
            >
              <span>{formatRemaining(minutes)}</span>
              {sleepRemaining === minutes && (
                <span className="text-xs text-primary">active</span>
              )}
            </button>
          ))}
          {active && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                cancelSleepTimer();
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              Turn off
            </button>
          )}
        </div>
      )}
    </div>
  );
}
