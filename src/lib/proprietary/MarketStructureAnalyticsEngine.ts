import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { MarketCoverageRegistry } from "@/lib/coverage/MarketCoverageRegistry";
import type { MarketStructureSignal } from "@/types/proprietary-intelligence";

export class MarketStructureAnalyticsEngine {
  static signals(): MarketStructureSignal[] {
    const intel = IntelligenceOrchestrator.snapshot();
    const venues = MarketCoverageRegistry.list();
    const liveVenues = venues.filter((v) => v.status === "live").length;
    const now = Date.now();

    const signals: MarketStructureSignal[] = [
      {
        id: "mstruct-liq-01",
        domain: "cross_liquidity",
        headline: `Cross-venue depth dispersion — ${liveVenues} live feeds`,
        detail: `Liquidity environment: ${intel.marketState.liquidityEnvironment}. Fragmentation elevated on alt perps.`,
        score: 72,
        affectedAssets: ["BTC", "ETH", "HYPE"],
        timestamp: now,
      },
      {
        id: "mstruct-flow-01",
        domain: "order_flow",
        headline: "Order flow fragmentation rising on HYPE perp",
        detail: "Bid/ask imbalance concentrated; execution desk routing limit-only.",
        score: 68,
        affectedAssets: ["HYPE"],
        timestamp: now - 900_000,
      },
      {
        id: "mstruct-stable-01",
        domain: "stablecoin",
        headline: "Stablecoin circulation velocity stable — confidence intact",
        detail: `EQ-SCI ${intel.marketState.sentimentState === "risk-off" ? "watch" : "normal"} band.`,
        score: 45,
        affectedAssets: ["USDT", "USDC"],
        timestamp: now - 3600_000,
      },
      {
        id: "mstruct-lev-01",
        domain: "leverage",
        headline: `Leverage concentration — ${intel.marketState.leverageEnvironment}`,
        detail: "OI build concentrated in majors; alt beta lagging.",
        score: 74,
        affectedAssets: ["BTC", "ETH"],
        timestamp: now - 1800_000,
      },
      {
        id: "mstruct-macro-01",
        domain: "macro",
        headline: `Macro sensitivity — ${intel.marketState.macroRiskLevel} risk window`,
        detail: intel.marketState.compositeLabel,
        score: 62,
        affectedAssets: ["BTC"],
        timestamp: now - 7200_000,
      },
      {
        id: "mstruct-sector-01",
        domain: "sector",
        headline: intel.sectorNarratives[0]?.summary ?? "Sector rotation monitoring active",
        detail: `Leaders: ${intel.sectorNarratives[0]?.leaders.join(", ") ?? "—"}`,
        score: intel.sectorNarratives[0]?.velocity ?? 50,
        affectedAssets: intel.sectorNarratives[0]?.leaders ?? [],
        timestamp: now - 5400_000,
      },
    ];

    return signals.sort((a, b) => b.timestamp - a.timestamp);
  }
}
