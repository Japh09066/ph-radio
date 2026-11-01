"use client";

import { StreamStatus } from "@/components/stream-status";
import { useRadioPlayer } from "@/hooks/use-radio-player";

/**
 * Client wrapper so the hero can show live stream status
 * while the hero itself stays a server component.
 */
export function StreamStatusBadge() {
  const { streamStatus } = useRadioPlayer();
  return <StreamStatus status={streamStatus} />;
}
