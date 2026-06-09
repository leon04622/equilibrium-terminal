import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { SystemContextRow } from "@/types/operator-ai";

export class CrossSystemContextEngine {
  static systems(asset: string): SystemContextRow[] {
    const global = GlobalIntelOrchestrator.snapshot();
    const memory = MarketMemoryOrchestrator.snapshot(asset);
    const portfolio = PortfolioDeskOrchestrator.snapshot(asset);
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
    const graph = marketKnowledgeGraph.snapshot();

    return [
      { system: "market_data", status: "live", score: null },
      { system: "global_intel", status: "active", score: global.globalScore },
      { system: "derivatives", status: "active", score: deriv.derivativesScore },
      { system: "portfolio", status: "active", score: portfolio.portfolioHealthScore },
      { system: "market_memory", status: "indexed", score: memory.memoryScore },
      { system: "knowledge_graph", status: "linked", score: Math.min(100, graph.entityCount) },
    ];
  }
}
