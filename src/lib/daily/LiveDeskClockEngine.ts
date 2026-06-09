import type { MarketConditionLayer, SessionClockSnapshot } from "@/types/daily-operations";

export interface LiveDeskCountdown {
  label: string;
  ms: number;
  formatted: string;
  urgent: boolean;
}

export interface LiveDeskPulse {
  funding: LiveDeskCountdown;
  nextSession: LiveDeskCountdown;
  deskTone: string;
  toneColor: "calm" | "active" | "elevated" | "danger";
}

function fmt(ms: number): string {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Hyperliquid funding accrues hourly on the UTC hour. */
function msToNextFundingWindow(now: number): number {
  const d = new Date(now);
  const next = new Date(d);
  next.setUTCMinutes(0, 0, 0);
  next.setUTCHours(d.getUTCHours() + 1);
  return next.getTime() - now;
}

function deskTone(
  market: MarketConditionLayer | null,
  fundingMs: number,
): { tone: string; color: LiveDeskPulse["toneColor"] } {
  if (market) {
    if (market.volatilityState === "extreme") {
      return { tone: "STRESS · defensive posture", color: "danger" };
    }
    if (market.volatilityState === "elevated") {
      return { tone: "ACTIVE · vol expanding", color: "elevated" };
    }
    if (market.liquidityState === "thin" || market.liquidityState === "stressed") {
      return { tone: "THIN · execution caution", color: "elevated" };
    }
  }
  if (fundingMs <= 5 * 60_000) {
    return { tone: "FUNDING WINDOW · watch carry", color: "active" };
  }
  return { tone: "CALM · normal conditions", color: "calm" };
}

export class LiveDeskClockEngine {
  static pulse(
    clock: SessionClockSnapshot | null,
    market: MarketConditionLayer | null,
    now = Date.now(),
  ): LiveDeskPulse {
    const fundingMs = msToNextFundingWindow(now);
    const sessionMs = clock ? Math.max(0, clock.nextTransitionAt - now) : 0;
    const tone = deskTone(market, fundingMs);

    return {
      funding: {
        label: "FUNDING",
        ms: fundingMs,
        formatted: fmt(fundingMs),
        urgent: fundingMs <= 5 * 60_000,
      },
      nextSession: {
        label: clock?.nextTransitionLabel ?? "NEXT",
        ms: sessionMs,
        formatted: fmt(sessionMs),
        urgent: sessionMs <= 10 * 60_000,
      },
      deskTone: tone.tone,
      toneColor: tone.color,
    };
  }
}
