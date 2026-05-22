import { ProprietaryMetricsEngine } from "@/lib/proprietary/ProprietaryMetricsEngine";
import { MarketStructureAnalyticsEngine } from "@/lib/proprietary/MarketStructureAnalyticsEngine";
import { InstitutionalBenchmarkEngine } from "@/lib/proprietary/InstitutionalBenchmarkEngine";
import { NetworkIntelligenceEngine } from "@/lib/proprietary/NetworkIntelligenceEngine";
import { WorkflowEmbeddingEngine } from "@/lib/proprietary/WorkflowEmbeddingEngine";
import { SignatureFeaturesEngine } from "@/lib/proprietary/SignatureFeaturesEngine";
import { OperationalMemoryEngine } from "@/lib/proprietary/OperationalMemoryEngine";
import { IntelligenceDistributionEngine } from "@/lib/proprietary/IntelligenceDistributionEngine";
import type { ProprietaryIntelligenceSnapshot } from "@/types/proprietary-intelligence";

export class ProprietaryIntelligenceOrchestrator {
  static snapshot(): ProprietaryIntelligenceSnapshot {
    const metrics = ProprietaryMetricsEngine.metrics();
    const marketStructure = MarketStructureAnalyticsEngine.signals();
    const benchmarks = InstitutionalBenchmarkEngine.rankings();
    const networkSignals = NetworkIntelligenceEngine.signals();
    const workflowEmbedding = WorkflowEmbeddingEngine.metrics();
    const signatureFeatures = SignatureFeaturesEngine.features();
    const operationalMemory = OperationalMemoryEngine.archive();
    const distribution = IntelligenceDistributionEngine.items();

    const criticalMetrics = metrics.filter((m) => m.band === "critical" || m.band === "elevated").length;
    const embedHigh = workflowEmbedding.filter((w) => w.dependencyBand === "high" || w.dependencyBand === "critical").length;

    const differentiationScore = Math.round(
      Math.min(
        100,
        metrics.length * 4 +
          signatureFeatures.filter((f) => f.status === "active").length * 8 +
          benchmarks.length * 0.5 +
          operationalMemory.length * 2,
      ),
    );

    const moatScore = Math.round(
      Math.min(
        100,
        differentiationScore * 0.35 +
          embedHigh * 12 +
          networkSignals.length * 6 +
          criticalMetrics * 3 +
          (signatureFeatures.length >= 6 ? 15 : 0),
      ),
    );

    return {
      metrics,
      marketStructure,
      benchmarks,
      networkSignals,
      workflowEmbedding,
      signatureFeatures,
      operationalMemory,
      distribution,
      differentiationScore,
      moatScore,
      updatedAt: Date.now(),
    };
  }
}
