"use client";

import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import type { LiveDeskPulse } from "@/lib/daily/LiveDeskClockEngine";
import type { LDBridgeRegion } from "@/lib/education/liveDeskBridgeSteps";
import type { MarketConditionLayer, SessionClockSnapshot } from "@/types/daily-operations";

const TONE_COLOR: Record<LiveDeskPulse["toneColor"], string> = {
  calm: "text-slate-500",
  active: "text-cyan-400",
  elevated: "text-amber-400",
  danger: "text-rose-400",
};

function regionClasses(
  regionId: Exclude<LDBridgeRegion, null | "panel">,
  activeRegion: LDBridgeRegion,
  bridgeMode: boolean,
  recognizeMode: boolean,
) {
  const active = activeRegion === regionId;
  return cn(
    "rounded-sm transition-all duration-300",
    bridgeMode && "cursor-pointer px-1.5 py-0.5 hover:bg-cyan-950/40",
    active && "bg-cyan-950/50 ring-1 ring-cyan-400/60",
    active && recognizeMode && "animate-pulse ring-2 ring-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]",
  );
}

export interface LiveDeskStripRegionsProps {
  clock: SessionClockSnapshot;
  marketState: MarketConditionLayer;
  pulse: LiveDeskPulse;
  variant?: "compact" | "bridge";
  activeRegion?: LDBridgeRegion;
  recognizeMode?: boolean;
}

export function LiveDeskStripRegions({
  clock,
  marketState,
  pulse,
  variant = "compact",
  activeRegion = null,
  recognizeMode = false,
}: LiveDeskStripRegionsProps) {
  const bridge = variant === "bridge";

  const volColor =
    marketState.volatilityState === "extreme"
      ? terminalSkin.textDown
      : marketState.volatilityState === "elevated"
        ? terminalSkin.textWarn
        : "text-slate-400";

  const panelActive = activeRegion === "panel";
  const marketStateActive = activeRegion === "market-state";

  return (
    <>
      <span
        data-livedesk-region="session"
        className={cn(
          "shrink-0 text-slate-500",
          bridge && "text-xs",
          regionClasses("session", activeRegion, bridge, recognizeMode),
        )}
      >
        {clock.label}
      </span>
      <span className="shrink-0 text-slate-600">|</span>
      <span
        data-livedesk-region="market-state"
        className={cn(
          "inline-flex shrink-0 items-center gap-2",
          bridge && marketStateActive && "rounded-sm bg-cyan-950/40 px-1 ring-1 ring-cyan-400/50",
        )}
      >
        <span
          data-livedesk-region="volatility"
          className={cn(
            "shrink-0 truncate",
            volColor,
            regionClasses("volatility", activeRegion, bridge, recognizeMode),
          )}
        >
          {marketState.volatilityState.toUpperCase()}
        </span>
        <span className="shrink-0 text-slate-600">|</span>
        <span
          data-livedesk-region="liquidity"
          className={cn(
            "shrink-0 text-slate-400",
            regionClasses("liquidity", activeRegion, bridge, recognizeMode),
          )}
        >
          {marketState.liquidityState.toUpperCase()}
        </span>
        <span className="shrink-0 text-slate-600">|</span>
        <span
          data-livedesk-region="risk"
          className={cn(
            "shrink-0",
            marketState.riskOnOff === "risk-on"
              ? terminalSkin.textUp
              : marketState.riskOnOff === "risk-off"
                ? terminalSkin.textDown
                : "text-slate-500",
            regionClasses("risk", activeRegion, bridge, recognizeMode),
          )}
        >
          {marketState.riskOnOff.toUpperCase()}
        </span>
      </span>

      <span className="shrink-0 text-slate-600">|</span>
      <span
        data-livedesk-region="funding"
        className={cn(
          "shrink-0 tabular-nums",
          pulse.funding.urgent ? "text-amber-400" : "text-slate-500",
          regionClasses("funding", activeRegion, bridge, recognizeMode),
        )}
        title="Time to next hourly funding window"
      >
        FND {pulse.funding.formatted}
      </span>
      <span className="shrink-0 text-slate-600">|</span>
      <span
        data-livedesk-region="session-countdown"
        className={cn(
          "shrink-0 tabular-nums",
          pulse.nextSession.urgent ? "text-cyan-400" : "text-slate-500",
          regionClasses("session-countdown", activeRegion, bridge, recognizeMode),
        )}
        title={`Next: ${pulse.nextSession.label}`}
      >
        {pulse.nextSession.label} {pulse.nextSession.formatted}
      </span>

      <span className="shrink-0 text-slate-600">|</span>
      <span
        data-livedesk-region="desk-tone"
        className={cn(
          "min-w-0 truncate",
          TONE_COLOR[pulse.toneColor],
          regionClasses("desk-tone", activeRegion, bridge, recognizeMode),
        )}
      >
        {pulse.deskTone}
      </span>

      {bridge ? (
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto shrink-0 text-cyan-600",
            panelActive && "text-cyan-300",
          )}
        >
          LIVE DESK · CLICK HIGHLIGHTED
        </span>
      ) : null}
    </>
  );
}
