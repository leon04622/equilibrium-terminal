"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";

/**
 * "Bridge only" entry point (Phase 8 — revisit). Runs the live walkthrough that
 * points out bids, asks, spread and liquidity inside the REAL order book, with
 * contextual interpretation of the current market.
 */
export function LessonBridgeLauncher() {
  const active = useLessonBridgeStore((s) => s.active);
  const start = useLessonBridgeStore((s) => s.start);

  return (
    <button
      type="button"
      onClick={start}
      title="Live walkthrough — find bids, asks, spread and liquidity in the real order book"
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border px-2 py-0.5 transition-colors",
        active
          ? "border-cyan-500/70 bg-cyan-950/50 text-cyan-200"
          : "border-cyan-700/40 bg-cyan-950/20 text-cyan-300/90 hover:border-cyan-500/70 hover:bg-cyan-950/40",
      )}
    >
      <Radio className="h-3 w-3" />
      <span className="tracking-wide">FIND IT LIVE</span>
    </button>
  );
}
