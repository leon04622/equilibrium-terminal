import { OperationalMemoryEngine } from "@/lib/proprietary/OperationalMemoryEngine";
import type { MarketMemoryNode } from "@/types/crypto-ecosystem";

export class MarketMemoryEngine {
  static graph(): MarketMemoryNode[] {
    return OperationalMemoryEngine.archive().map((m) => ({
      id: m.id,
      kind:
        m.kind === "vol_analog"
          ? "vol_analog"
          : m.kind === "narrative"
            ? "narrative"
            : m.kind === "liquidity_regime"
              ? "liquidity_regime"
              : "event",
      title: m.title,
      relevance: m.relevanceScore,
      archivedAt: m.archivedAt,
    }));
  }
}
