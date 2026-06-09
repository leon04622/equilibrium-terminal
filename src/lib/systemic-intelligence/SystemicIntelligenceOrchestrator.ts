import { AiContextualizationEngine } from "@/lib/systemic-intelligence/AiContextualizationEngine";
import { ContextualEnrichmentEngine } from "@/lib/systemic-intelligence/ContextualEnrichmentEngine";
import { EventCascadeEngine } from "@/lib/systemic-intelligence/EventCascadeEngine";
import { KnowledgeMemoryEngine } from "@/lib/systemic-intelligence/KnowledgeMemoryEngine";
import { LiquidityFlowMappingEngine } from "@/lib/systemic-intelligence/LiquidityFlowMappingEngine";
import { MarketEntityGraphEngine } from "@/lib/systemic-intelligence/MarketEntityGraphEngine";
import { NarrativePropagationEngine } from "@/lib/systemic-intelligence/NarrativePropagationEngine";
import { RelationshipEngine } from "@/lib/systemic-intelligence/RelationshipEngine";
import { SystemicAlertEngine } from "@/lib/systemic-intelligence/SystemicAlertEngine";
import { SYSTEMIC_DASHBOARD_MODES } from "@/lib/systemic-intelligence/SystemicDashboardModes";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { SystemicTelemetry } from "@/lib/systemic-intelligence/SystemicTelemetry";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type {
  MarketEntityNode,
  SystemicDashboardModeId,
  SystemicIntelligenceSnapshot,
} from "@/types/systemic-intelligence";

const MODE_STORAGE = "eq-systemic-mode-v1";

function readMode(): SystemicDashboardModeId {
  if (typeof window === "undefined") return "relationship_map";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && SYSTEMIC_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as SystemicDashboardModeId;
    }
  } catch {
    /* ignore */
  }
  return "relationship_map";
}

function entityNodes(asset: string): MarketEntityNode[] {
  const center = `asset:${asset.toUpperCase()}`;
  const { entities } = marketKnowledgeGraph.getNeighbors(center, 2);
  return entities.slice(0, 28).map((e) => ({
    id: e.id,
    kind: e.kind,
    label: e.label,
    coin: e.coin,
    systemicWeight: Math.min(
      100,
      (e.kind === "exchange" || e.kind === "stablecoin" ? 70 : 40) +
        (e.metadata.systemic === true ? 20 : 0),
    ),
  }));
}

export class SystemicIntelligenceOrchestrator {
  static snapshot(asset: string): SystemicIntelligenceSnapshot {
    SystemicTelemetry.begin();
    MarketEntityGraphEngine.run(asset);
    KnowledgeMemoryEngine.record(asset);

    const center = `asset:${asset.toUpperCase()}`;
    const subgraph = marketKnowledgeGraph.getNeighbors(center, 2);
    const relationships = RelationshipEngine.edges(asset);
    const relationshipMetrics = RelationshipEngine.metrics(asset);
    const systemicRisk = SystemicRiskEngine.metrics(asset);
    const narratives = NarrativePropagationEngine.analyze(asset);
    const liquidityFlows = LiquidityFlowMappingEngine.flows(asset);
    const cascades = EventCascadeEngine.analyze(asset);
    const enrichments = ContextualEnrichmentEngine.enrich(asset);
    const alerts = SystemicAlertEngine.evaluate(asset);
    const memory = KnowledgeMemoryEngine.points();
    const telemetry = SystemicTelemetry.snapshot();
    const aiSummary = AiContextualizationEngine.summary(asset);

    const graphBoost = telemetry.entityCount > 0 ? 30 + telemetry.linkCount / 50 : 20;
    const systemicScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          graphBoost +
            (100 - systemicRisk.contagionRisk) * 0.35 +
            narratives.emergenceScore * 0.1 +
            telemetry.memoryPoints * 0.5,
        ),
      ),
    );

    return {
      asset,
      entities: entityNodes(asset),
      relationships,
      relationshipMetrics,
      systemicRisk,
      narratives,
      liquidityFlows,
      cascades,
      enrichments,
      memory,
      alerts,
      subgraph: {
        entities: subgraph.entities,
        links: subgraph.links,
      },
      dashboardModes: SYSTEMIC_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      systemicScore,
      aiContextSummary: aiSummary,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: SystemicDashboardModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
