"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";

/**
 * Primary learning entry point. Opens the Market Mechanics Simulator — the
 * jargon-free, first-principles module that teaches how a market actually works
 * (trades, buyers/sellers, why price moves) BEFORE the order book lesson.
 */
export function MarketMechanicsLauncher() {
  const active = useMarketMechanicsStore((s) => s.active);
  const open = useMarketMechanicsStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      title="Start here — learn how markets work in plain language, no jargon"
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border px-2 py-0.5 transition-colors",
        active
          ? "border-emerald-500/70 bg-emerald-950/50 text-emerald-200"
          : "border-emerald-700/50 bg-emerald-950/25 text-emerald-300 hover:border-emerald-500/70 hover:bg-emerald-950/45",
      )}
    >
      <Sparkles className="h-3 w-3" />
      <span className="tracking-wide">LEARN MARKETS — START HERE</span>
    </button>
  );
}
