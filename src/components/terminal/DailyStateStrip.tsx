"use client";

import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";

export function DailyStateStrip() {
  const snapshot = useDailyOperationsStore((s) => s.snapshot);
  if (!snapshot) return null;

  const { clock, marketState } = snapshot;
  const volColor =
    marketState.volatilityState === "extreme"
      ? terminalSkin.textDown
      : marketState.volatilityState === "elevated"
        ? terminalSkin.textWarn
        : "text-slate-400";

  return (
    <div
      className={cn(
        "hidden min-w-0 flex-1 items-center gap-2 overflow-hidden border-l border-slate-800 pl-2 xl:flex",
        TERMINAL_TYPO.micro,
      )}
    >
      <span className="shrink-0 text-slate-500">{clock.label}</span>
      <span className="shrink-0 text-slate-600">|</span>
      <span className={cn("shrink-0 truncate", volColor)}>{marketState.volatilityState.toUpperCase()}</span>
      <span className="shrink-0 text-slate-600">|</span>
      <span className="shrink-0 text-slate-400">{marketState.liquidityState.toUpperCase()}</span>
      <span className="shrink-0 text-slate-600">|</span>
      <span
        className={cn(
          "shrink-0",
          marketState.riskOnOff === "risk-on"
            ? terminalSkin.textUp
            : marketState.riskOnOff === "risk-off"
              ? terminalSkin.textDown
              : "text-slate-500",
        )}
      >
        {marketState.riskOnOff.toUpperCase()}
      </span>
      <span className="min-w-0 truncate text-slate-500">{marketState.compositeLabel}</span>
    </div>
  );
}
