import { AnnotationInfrastructureEngine } from "@/lib/research-desk/AnnotationInfrastructureEngine";
import { MarketJournalEngine } from "@/lib/research-desk/MarketJournalEngine";
import { ThesisTrackingEngine } from "@/lib/research-desk/ThesisTrackingEngine";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { ResearchDeskTelemetrySnapshot } from "@/types/research-operating";

let lastComputeAt = 0;

export class ResearchDeskTelemetry {
  static begin(): void {
    lastComputeAt = performance.now();
  }

  static snapshot(asset: string): ResearchDeskTelemetrySnapshot {
    const latency = lastComputeAt > 0 ? Math.max(0, Math.round(performance.now() - lastComputeAt)) : 0;
    const journalCount = MarketJournalEngine.entries(asset).length;
    const thesisCount = ThesisTrackingEngine.theses(asset).length;
    const annotationCount = AnnotationInfrastructureEngine.list(asset).length;
    const continuityScore = Math.min(
      100,
      (useTraderWorkflowStore.getState().hydrated ? 40 : 10) +
        journalCount * 2 +
        thesisCount * 5 +
        annotationCount * 2,
    );

    return {
      journalCount,
      thesisCount,
      annotationCount,
      computeLatencyMs: latency,
      continuityScore,
    };
  }
}
