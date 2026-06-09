import { historicalEventArchive } from "@/lib/market-memory/historicalEventArchive";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { HistoricalEventKind, HistoricalEventRecord } from "@/types/market-memory";

function record(
  kind: HistoricalEventKind,
  asset: string,
  headline: string,
  detail: string,
  severity: HistoricalEventRecord["severity"],
  tags: string[] = [],
): void {
  historicalEventArchive.append({
    id: `${kind}-${asset}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    asset: asset.toUpperCase(),
    headline,
    detail,
    severity,
    timestamp: Date.now(),
    tags,
  });
}

export class HistoricalEventArchiveEngine {
  static capture(asset: string): number {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    let count = 0;

    for (const item of terminal.intelligence) {
      const kind: HistoricalEventKind = item.title.toLowerCase().includes("liquidation")
        ? "liquidation"
        : item.channel === "market"
          ? "volatility_spike"
          : "narrative_rotation";
      record(kind, item.coin, item.title.slice(0, 72), item.detail, item.severity, [item.channel]);
      count += 1;
    }

    if (atmosphere.regime.regime === "liquidation" || atmosphere.stress.score >= 70) {
      record(
        "volatility_spike",
        asset,
        `Regime stress · ${atmosphere.regime.regime}`,
        `Stress ${atmosphere.stress.score} · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}`,
        atmosphere.stress.score >= 85 ? "critical" : "watch",
        ["regime"],
      );
      count += 1;
    }

    for (const wire of atmosphere.wire.slice(0, 4)) {
      record(
        wire.channel === "macro" ? "macro_reaction" : "narrative_rotation",
        wire.coin,
        wire.headline.slice(0, 72),
        wire.channel,
        wire.severity,
        [wire.channel],
      );
      count += 1;
    }

    try {
      const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
      for (const a of deriv.alerts.slice(0, 3)) {
        record(
          "derivatives_dislocation",
          asset,
          a.headline,
          a.detail,
          a.severity,
          ["derivatives"],
        );
        count += 1;
      }
      if (Math.abs(deriv.funding.hlFundingBps) >= 10) {
        record(
          "funding_shift",
          asset,
          "Funding dislocation archived",
          `${deriv.funding.hlFundingBps} bps HL`,
          "watch",
          ["funding"],
        );
        count += 1;
      }
    } catch {
      /* server / partial */
    }

    try {
      const systemic = SystemicIntelligenceOrchestrator.snapshot(asset);
      for (const a of systemic.alerts.slice(0, 2)) {
        record(
          a.kind === "stablecoin_stress" ? "stablecoin_event" : "liquidity_crisis",
          asset,
          a.headline,
          a.detail,
          a.severity,
          ["systemic"],
        );
        count += 1;
      }
    } catch {
      /* partial */
    }

    if (terminal.book && terminal.book.spreadBps != null && terminal.book.spreadBps > 15) {
      record(
        "liquidity_crisis",
        asset,
        "Spread expansion archived",
        `${terminal.book.spreadBps.toFixed(1)} bps`,
        "watch",
        ["book"],
      );
      count += 1;
    }

    return count;
  }

  static archive(asset: string): HistoricalEventRecord[] {
    HistoricalEventArchiveEngine.capture(asset);
    return historicalEventArchive.forAsset(asset);
  }
}
