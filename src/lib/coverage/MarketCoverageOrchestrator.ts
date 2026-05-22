import { DataQualityGovernor } from "@/lib/coverage/DataQualityGovernor";
import { EventIngestPipeline } from "@/lib/coverage/EventIngestPipeline";
import { InstitutionalMonitorEngine } from "@/lib/coverage/InstitutionalMonitorEngine";
import { MarketCoverageRegistry } from "@/lib/coverage/MarketCoverageRegistry";
import { MarketHealthEngine } from "@/lib/coverage/MarketHealthEngine";
import { OnChainIntelligenceEngine } from "@/lib/coverage/OnChainIntelligenceEngine";
import { ProprietaryMetricsEngine } from "@/lib/coverage/ProprietaryMetricsEngine";
import type { MarketCoverageSnapshot } from "@/types/market-coverage";

export class MarketCoverageOrchestrator {
  static snapshot(): MarketCoverageSnapshot {
    const venues = MarketCoverageRegistry.list();
    const live = venues.filter((v) => v.status === "live").length;
    const proprietaryMetrics = ProprietaryMetricsEngine.compute();
    const healthIndicators = MarketHealthEngine.assess();
    const healthAvg =
      healthIndicators.reduce((s, h) => s + h.score, 0) / Math.max(healthIndicators.length, 1);

    return {
      venues,
      proprietaryMetrics,
      onChainSignals: OnChainIntelligenceEngine.collect(),
      healthIndicators,
      institutionalWatches: InstitutionalMonitorEngine.list(),
      rankedEvents: EventIngestPipeline.ingest(),
      dataQuality: DataQualityGovernor.audit(),
      coverageScore: Math.round((live / venues.length) * 40 + healthAvg * 0.6),
      updatedAt: Date.now(),
    };
  }
}
