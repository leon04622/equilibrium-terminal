import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { EventCascadeStep } from "@/types/systemic-intelligence";

export class EventCascadeEngine {
  static analyze(asset: string): EventCascadeStep[] {
    const steps: EventCascadeStep[] = [];
    const risk = SystemicRiskEngine.metrics(asset);
    const macros = marketKnowledgeGraph.findByKind("macro_event").slice(0, 3);
    const events = marketKnowledgeGraph.findByKind("event").slice(0, 4);
    const intel = useTerminalStore.getState().intelligence.filter((i) => i.severity !== "info").slice(0, 3);

    for (const m of macros) {
      steps.push({
        id: `cascade-macro-${m.id}`,
        trigger: m.label,
        propagation: "Vol regime → perp funding → alt beta",
        affectedEntities: ["regime", asset, "ETH"],
        severity: risk.contagionRisk >= 60 ? "critical" : "watch",
      });
    }

    for (const e of events) {
      steps.push({
        id: `cascade-event-${e.id}`,
        trigger: e.label.slice(0, 48),
        propagation: "Narrative → sector rotation → liquidity migration",
        affectedEntities: e.coin ? [e.coin] : [asset],
        severity: e.metadata.severity === "critical" ? "critical" : "watch",
      });
    }

    for (const item of intel) {
      if (item.title.toLowerCase().includes("liquidation")) {
        steps.push({
          id: `cascade-liq-${item.id}`,
          trigger: item.title.slice(0, 48),
          propagation: "Liquidation → book stress → cross-venue divergence",
          affectedEntities: [item.coin, "exchange:hyperliquid"],
          severity: "critical",
        });
      }
    }

    if (risk.stablecoinDependency >= 60) {
      steps.push({
        id: "cascade-stable",
        trigger: "Stablecoin concentration",
        propagation: "Treasury stress → margin tightening → vol expansion",
        affectedEntities: ["USDT", "USDC", asset],
        severity: risk.riskTier === "critical" ? "critical" : "watch",
      });
    }

    return steps.slice(0, 10);
  }
}
