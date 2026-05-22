import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  MarketMover,
  MarketSurveillanceSnapshot,
  SurveillanceHeadline,
  TimelineEvent,
} from "@/types/information-discovery";

const prevMids = new Map<string, number>();

export class MarketSurveillanceEngine {
  static buildTimeline(coin: string, limit = 20): TimelineEvent[] {
    const upper = coin.toUpperCase();
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const events: TimelineEvent[] = [];

    for (const intel of terminal.intelligence) {
      if (intel.coin.toUpperCase() !== upper) continue;
      events.push({
        id: intel.id,
        coin: upper,
        timestamp: intel.timestamp,
        channel: intel.channel,
        headline: intel.title,
        severity: intel.severity,
      });
    }

    for (const wire of atmosphere.wire) {
      if (wire.coin.toUpperCase() !== upper) continue;
      events.push({
        id: wire.id,
        coin: upper,
        timestamp: wire.timestamp,
        channel: wire.channel,
        headline: wire.headline,
        severity: wire.severity,
      });
    }

    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  static snapshot(): MarketSurveillanceSnapshot {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const mids = terminal.mids.mids;
    const movers: MarketMover[] = [];

    for (const [coin, mid] of Object.entries(mids)) {
      const prev = prevMids.get(coin);
      prevMids.set(coin, mid);
      const changePct = prev && prev > 0 ? ((mid - prev) / prev) * 100 : 0;
      const asset = terminal.assets.find((a) => a.coin === coin);
      movers.push({
        coin,
        symbol: asset?.symbol ?? coin,
        mid,
        changePct,
        volumeScore: Math.abs(changePct) * 10,
      });
    }

    movers.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));

    const book = terminal.book;
    const liquidityShifts = book
      ? [
          {
            coin: book.coin,
            spreadBps: book.spreadBps ?? 0,
            bookImbalance: atmosphere.stress.bookImbalance,
            label:
              (book.spreadBps ?? 0) > 12
                ? "WIDE SPREAD"
                : atmosphere.stress.bookImbalance > 0.2
                  ? "BID HEAVY"
                  : atmosphere.stress.bookImbalance < -0.2
                    ? "ASK HEAVY"
                    : "BALANCED",
          },
        ]
      : [];

    const headlines: SurveillanceHeadline[] = [];
    const now = Date.now();

    for (const m of movers.slice(0, 5)) {
      if (Math.abs(m.changePct) < 0.02) continue;
      headlines.push({
        id: `mov-${m.coin}`,
        priority: 70 + Math.min(25, Math.abs(m.changePct) * 10),
        category: "mover",
        headline: `${m.symbol} ${m.changePct >= 0 ? "+" : ""}${m.changePct.toFixed(2)}%`,
        detail: `Mid ${m.mid.toFixed(4)} · session tick`,
        coin: m.coin,
        timestamp: now,
      });
    }

    if (atmosphere.stress.velocityRatio > 1.25) {
      headlines.push({
        id: "vol-stress",
        priority: 85,
        category: "volatility",
        headline: "VOLATILITY ACCELERATION",
        detail: `Velocity ${atmosphere.stress.velocityRatio.toFixed(2)}x · stress ${atmosphere.stress.score.toFixed(0)}`,
        coin: terminal.selectedCoin,
        timestamp: now,
      });
    }

    if (Math.abs(atmosphere.regime.narrativeAcceleration) > 20) {
      headlines.push({
        id: "narr-pulse",
        priority: 75,
        category: "narrative",
        headline: "NARRATIVE PULSE",
        detail: `Acceleration ${atmosphere.regime.narrativeAcceleration > 0 ? "+" : ""}${atmosphere.regime.narrativeAcceleration.toFixed(0)}`,
        coin: null,
        timestamp: now,
      });
    }

    const topMacro = [...atmosphere.macro].sort(
      (a, b) => Math.abs(b.changePct) - Math.abs(a.changePct),
    )[0];
    if (topMacro) {
      headlines.push({
        id: `macro-${topMacro.symbol}`,
        priority: 60,
        category: "macro",
        headline: `${topMacro.label} ${topMacro.changePct >= 0 ? "+" : ""}${topMacro.changePct.toFixed(2)}%`,
        detail: "Cross-asset macro monitor",
        coin: null,
        timestamp: topMacro.updatedAt,
      });
    }

    if ((book?.spreadBps ?? 0) > 10) {
      headlines.push({
        id: "liq-warn",
        priority: 80,
        category: "liquidity",
        headline: "LIQUIDITY THINNING",
        detail: `Spread ${book?.spreadBps?.toFixed(1)}bps on ${book?.coin}`,
        coin: book?.coin ?? null,
        timestamp: now,
      });
    }

    return {
      movers: movers.slice(0, 12),
      liquidityShifts,
      headlines: headlines.sort((a, b) => b.priority - a.priority).slice(0, 10),
      regime: atmosphere.regime.regime,
      stressScore: atmosphere.stress.score,
      narrativeAcceleration: atmosphere.regime.narrativeAcceleration,
      updatedAt: now,
    };
  }
}
