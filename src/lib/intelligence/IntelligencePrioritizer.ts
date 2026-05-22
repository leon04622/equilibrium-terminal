import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { IntelligenceEvent } from "@/types/market-intelligence";

export class IntelligencePrioritizer {
  static rank(events: IntelligenceEvent[]): IntelligenceEvent[] {
    const watchlist = new Set(
      useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin),
    );
    const activeCoin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      null;

    return events.map((e) => {
      let urgency = e.severity;
      const ageMin = (Date.now() - e.timestamp) / 60_000;
      if (ageMin < 2) urgency += 15;
      else if (ageMin < 10) urgency += 6;
      urgency = Math.min(100, urgency);

      let impact = 35 + e.severity * 0.45;
      if (e.category === "macro" || e.category === "stablecoin") impact += 12;
      if (e.category === "liquidation" || e.category === "exchange") impact += 10;
      if (e.affectedAssets.some((a) => a === "BTC" || a === "ETH")) impact += 8;
      impact = Math.min(100, Math.round(impact));

      let relevance = 30;
      if (activeCoin && e.affectedAssets.includes(activeCoin)) relevance += 35;
      if (e.affectedAssets.some((a) => watchlist.has(a))) relevance += 22;
      if (e.category === "liquidity" || e.category === "volatility") relevance += 10;
      relevance = Math.min(100, Math.round(relevance));

      const composite = Math.round(
        urgency * 0.36 + impact * 0.34 + relevance * 0.22 + e.confidence * 100 * 0.08,
      );

      return {
        ...e,
        urgencyScore: urgency,
        impactScore: impact,
        relevanceScore: relevance,
        compositeScore: Math.min(100, composite),
      };
    });
  }
}
