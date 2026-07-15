"use client";

import { AlphaFeatureFlags } from "@/lib/alpha/AlphaFeatureFlags";
import { evaluateExecutionGuards } from "@/lib/wedge/executionGuards";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Pre-trade execution warnings — visibility only, not trade advice. */
export function ExecutionWarningBanner() {
  const book = useTerminalStore((s) => s.book);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const lastMessageAt = useTerminalStore((s) => s.lastMessageAt);
  const slippage = useExecutionIntelligenceStore((s) => s.slippage);
  const spreadBps = book?.spreadBps ?? slippage.spreadBps;
  const slipWarn = slippage.riskTier === "high" || slippage.riskTier === "critical";
  const spreadWarn = spreadBps > 14;

  const guard = evaluateExecutionGuards({
    connectionStatus,
    lastMessageAt,
    markPx: book?.mid,
    bookUpdatedAt: book?.time ?? null,
  });

  const executionPaused = !AlphaFeatureFlags.isEnabled("execution");

  if (!spreadWarn && !slipWarn && !guard.blocked && !executionPaused) return null;

  return (
    <div
      className={cn(
        terminalSkin.borderB,
        "bg-amber-950/20 px-1 py-0.5",
        TERMINAL_TYPO.micro,
        terminalSkin.textWarn,
      )}
    >
      {executionPaused ? "EXECUTION KILL SWITCH ACTIVE · " : ""}
      {guard.blocked ? `${guard.reason} · ` : ""}
      {spreadWarn ? `Spread ${spreadBps.toFixed(1)} bps · ` : ""}
      {slipWarn ? `Slippage ${slippage.riskTier.toUpperCase()} · ` : ""}
      verify liquidity before submit
    </div>
  );
}
