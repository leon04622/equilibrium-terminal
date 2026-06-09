import { MarketCoverageOrchestrator } from "@/lib/coverage/MarketCoverageOrchestrator";
import type { EtfFlowRow } from "@/types/global-intelligence";

export class EtfFlowDeskEngine {
  static flows(): EtfFlowRow[] {
    const coverage = MarketCoverageOrchestrator.snapshot();
    return coverage.institutionalWatches
      .filter((w) => w.category === "etf")
      .map((w) => ({
        id: w.id,
        entity: w.entity,
        note: w.note,
        category: w.category,
      }));
  }
}
