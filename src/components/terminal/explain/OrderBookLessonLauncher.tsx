"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";

/**
 * PHASE 1 — the discoverable entry point for the flagship learning module.
 * Opens the cinematic Order Book stage: a calm, full-screen, animated
 * micro-learning experience with synced narration.
 */
export function OrderBookLessonLauncher() {
  const active = useOrderBookLessonStore((s) => s.active);
  const open = useOrderBookLessonStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      title="Cinematic, step-by-step voice walkthrough of the order book"
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border px-2 py-0.5 transition-colors",
        active
          ? "border-cyan-500/70 bg-cyan-950/50 text-cyan-200"
          : "border-cyan-700/50 bg-cyan-950/25 text-cyan-300 hover:border-cyan-500/70 hover:bg-cyan-950/45",
      )}
    >
      <GraduationCap className="h-3 w-3" />
      <span className="tracking-wide">TEACH ME THE ORDER BOOK</span>
    </button>
  );
}
