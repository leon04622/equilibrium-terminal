import { AiIntelligenceSummarizer } from "@/lib/intelligence/AiIntelligenceSummarizer";
import { AnomalyDetectionEngine } from "@/lib/intelligence/AnomalyDetectionEngine";
import { AssetIntelligenceEngine } from "@/lib/intelligence/AssetIntelligenceEngine";
import { EventDetectionEngine } from "@/lib/intelligence/EventDetectionEngine";
import { EventEnrichmentEngine } from "@/lib/intelligence/EventEnrichmentEngine";
import { IntelligenceMarketStateEngine } from "@/lib/intelligence/IntelligenceMarketStateEngine";
import { IntelligencePrioritizer } from "@/lib/intelligence/IntelligencePrioritizer";
import { NarrativeSectorEngine } from "@/lib/intelligence/NarrativeSectorEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketIntelligenceSnapshot } from "@/types/market-intelligence";

export class IntelligenceOrchestrator {
  static snapshot(): MarketIntelligenceSnapshot {
    const raw = EventDetectionEngine.detect();
    const ranked = IntelligencePrioritizer.rank(raw);
    const events = EventEnrichmentEngine.enrich(ranked).sort(
      (a, b) => b.compositeScore - a.compositeScore || b.timestamp - a.timestamp,
    );
    const marketState = IntelligenceMarketStateEngine.classify();
    const assetProfiles = AssetIntelligenceEngine.profiles();
    const sectorNarratives = NarrativeSectorEngine.track();
    const activeCoin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      null;
    const aiBrief = AiIntelligenceSummarizer.brief(events, marketState, activeCoin);
    const anomalyCount = AnomalyDetectionEngine.count();

    const intelligenceScore = Math.round(
      Math.min(100, events.length * 2) * 0.2 +
        marketState.marketBreadth * 0.15 +
        (100 - anomalyCount * 8) * 0.15 +
        (events[0]?.compositeScore ?? 40) * 0.35 +
        (aiBrief ? 75 : 50) * 0.15,
    );

    return {
      events,
      marketState,
      assetProfiles,
      sectorNarratives,
      aiBrief,
      anomalyCount,
      intelligenceScore: Math.min(100, intelligenceScore),
      updatedAt: Date.now(),
    };
  }
}
