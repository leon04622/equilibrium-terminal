import { AiContextualizationEngine } from "@/lib/systemic-intelligence/AiContextualizationEngine";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ContextualInsightRow } from "@/types/operator-ai";

export class ContextualMarketAssistantEngine {
  static insights(asset: string): ContextualInsightRow[] {
    const atmosphere = useMarketAtmosphereStore.getState();
    const terminal = useTerminalStore.getState();
    const deriv = DerivativesIntelligenceOrchestrator.snapshot(asset);
    const rows: ContextualInsightRow[] = [];

    rows.push({
      id: "ctx-regime",
      domain: "regime",
      summary: `Regime ${atmosphere.regime.regime} · stress ${atmosphere.stress.score.toFixed(0)} · DXY-linked macro ${atmosphere.regime.dominantMacro ?? "—"}`,
      confidence: atmosphere.regime.confidencePulse,
    });

    rows.push({
      id: "ctx-liq",
      domain: "liquidity",
      summary: `Book imbalance ${atmosphere.stress.bookImbalance.toFixed(2)} · spread ${atmosphere.stress.spreadBps.toFixed(1)} bps · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}x`,
      confidence: 72,
    });

    rows.push({
      id: "ctx-deriv",
      domain: "derivatives",
      summary: `Derivatives score ${deriv.derivativesScore} · funding environment on ${asset} — review vol surface tab for positioning context`,
      confidence: 68,
    });

    const critical = terminal.intelligence.filter((i) => i.severity !== "info").slice(0, 2);
    for (const i of critical) {
      rows.push({
        id: `ctx-intel-${i.id}`,
        domain: "intelligence",
        summary: i.title,
        confidence: 65,
      });
    }

    rows.push({
      id: "ctx-systemic",
      domain: "systemic",
      summary: AiContextualizationEngine.summary(asset),
      confidence: 60,
    });

    return rows;
  }
}
