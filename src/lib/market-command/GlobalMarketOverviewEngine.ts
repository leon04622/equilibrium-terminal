import { MarketCoverageOrchestrator } from "@/lib/coverage/MarketCoverageOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketOverviewRow } from "@/types/market-command";

export class GlobalMarketOverviewEngine {
  static overview(): MarketOverviewRow[] {
    const coverage = MarketCoverageOrchestrator.snapshot();
    const atmosphere = useMarketAtmosphereStore.getState();
    const terminal = useTerminalStore.getState();
    const liveVenues = coverage.venues.filter((v) => v.status === "live").length;

    return [
      {
        id: "ov-coverage",
        domain: "coverage",
        metric: "venues_live",
        value: `${liveVenues}/${coverage.venues.length}`,
        status: liveVenues >= coverage.venues.length * 0.7 ? "healthy" : "degraded",
      },
      {
        id: "ov-regime",
        domain: "volatility",
        metric: "regime",
        value: atmosphere.regime.regime,
        status: atmosphere.regime.regime === "risk-off" ? "watch" : "ok",
      },
      {
        id: "ov-stress",
        domain: "stress",
        metric: "composite_stress",
        value: `${atmosphere.stress.score.toFixed(0)}`,
        status: atmosphere.stress.score > 65 ? "elevated" : "ok",
      },
      {
        id: "ov-intel",
        domain: "intel",
        metric: "active_signals",
        value: `${terminal.intelligence.length}`,
        status: terminal.intelligence.length > 8 ? "busy" : "ok",
      },
      {
        id: "ov-quality",
        domain: "data",
        metric: "coverage_score",
        value: `${coverage.coverageScore}`,
        status: coverage.coverageScore >= 70 ? "ok" : "watch",
      },
    ];
  }
}
