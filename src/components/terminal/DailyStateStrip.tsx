"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { LiveDeskClockEngine, type LiveDeskPulse } from "@/lib/daily/LiveDeskClockEngine";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";

const TONE_COLOR: Record<LiveDeskPulse["toneColor"], string> = {
  calm: "text-slate-500",
  active: "text-cyan-400",
  elevated: "text-amber-400",
  danger: "text-rose-400",
};

export function DailyStateStrip() {
  const snapshot = useDailyOperationsStore((s) => s.snapshot);
  const [now, setNow] = useState(() => Date.now());

  // Local 1s heartbeat — keeps countdowns ticking without re-rendering the app.
  useEffect(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!snapshot) return null;

  const { clock, marketState } = snapshot;
  const pulse = LiveDeskClockEngine.pulse(clock, marketState, now);

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

      <span className="shrink-0 text-slate-600">|</span>
      <span
        className={cn("shrink-0 tabular-nums", pulse.funding.urgent ? "text-amber-400" : "text-slate-500")}
        title="Time to next hourly funding window"
      >
        FND {pulse.funding.formatted}
      </span>
      <span className="shrink-0 text-slate-600">|</span>
      <span
        className={cn("shrink-0 tabular-nums truncate", pulse.nextSession.urgent ? "text-cyan-400" : "text-slate-500")}
        title={`Next: ${pulse.nextSession.label}`}
      >
        {pulse.nextSession.label} {pulse.nextSession.formatted}
      </span>

      <span className="shrink-0 text-slate-600">|</span>
      <span className={cn("min-w-0 truncate", TONE_COLOR[pulse.toneColor])}>{pulse.deskTone}</span>
    </div>
  );
}
