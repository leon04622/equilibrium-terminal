import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { AgentSignal } from "@/types/agentic";
import type { IntelligenceItem } from "@/types/terminal-schema";
import type { FusedOpportunity } from "@/types/agentic";

export interface AggregatedDecisionContext {
  coin: string;
  mid: number | null;
  spreadBps: number;
  agentSignals: AgentSignal[];
  fusedOpportunities: FusedOpportunity[];
  intelligence: IntelligenceItem[];
  executionConfidence: number;
  slippageRiskTier: string;
  slippageBps: number;
  bookSkew: "bid" | "ask" | "neutral";
  regime: string;
  stressScore: number;
  velocityRatio: number;
  narrativeAcceleration: number;
  positionCount: number;
}

export class DecisionContextAggregator {
  static aggregate(coin: string): AggregatedDecisionContext {
    const terminal = useTerminalStore.getState();
    const execution = useExecutionIntelligenceStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const agentic = useAgentOperationsStore.getState();

    const upper = coin.toUpperCase();
    const book = terminal.book;
    const imb = execution.imbalance;

    const bookSkew: "bid" | "ask" | "neutral" = imb.skew;

    const agentSignals = agentic.signals.filter(
      (s) => s.coin.toUpperCase() === upper,
    );
    const fusedOpportunities = agentic.fusedMatrix.filter(
      (f) => f.coin.toUpperCase() === upper,
    );
    const intelligence = terminal.intelligence.filter(
      (i) => i.coin.toUpperCase() === upper,
    );

    return {
      coin: upper,
      mid: book?.mid ?? null,
      spreadBps: book?.spreadBps ?? execution.slippage.spreadBps ?? 0,
      agentSignals,
      fusedOpportunities,
      intelligence,
      executionConfidence: execution.executionConfidence,
      slippageRiskTier: execution.slippage.riskTier,
      slippageBps: execution.slippage.slippageBps,
      bookSkew,
      regime: atmosphere.regime.regime,
      stressScore: atmosphere.stress.score,
      velocityRatio: atmosphere.stress.velocityRatio,
      narrativeAcceleration: atmosphere.regime.narrativeAcceleration,
      positionCount: terminal.positions.length,
    };
  }
}
