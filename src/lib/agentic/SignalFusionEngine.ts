import type {
  AgentKind,
  AgentSignal,
  FusedOpportunity,
  SignalStance,
  WeightedAgentContribution,
} from "@/types/agentic";

/** Base agent weights — sum normalized at fusion time. */
export const AGENT_BASE_WEIGHTS: Record<AgentKind, number> = {
  structure: 0.2,
  whale: 0.25,
  liquidation: 0.2,
  funding: 0.2,
  narrative: 0.15,
};

const STANCE_VECTOR: Record<SignalStance, number> = {
  bullish: 1,
  neutral: 0,
  bearish: -1,
};

function stanceOpposes(a: SignalStance, b: SignalStance): boolean {
  return (
    (a === "bullish" && b === "bearish") || (a === "bearish" && b === "bullish")
  );
}

function dominantStance(vector: number): SignalStance {
  if (vector > 0.15) return "bullish";
  if (vector < -0.15) return "bearish";
  return "neutral";
}

export interface FusionInput {
  coin: string;
  signals: AgentSignal[];
  relevanceScore: number;
}

export interface FusionResult {
  opportunity: FusedOpportunity | null;
  matrix: WeightedAgentContribution[];
  contradictionPenalty: number;
  fusedConfidenceScore: number;
}

export class SignalFusionEngine {
  fuse(input: FusionInput): FusionResult {
    const { coin, signals, relevanceScore } = input;
    if (!signals.length) {
      return {
        opportunity: null,
        matrix: [],
        contradictionPenalty: 0,
        fusedConfidenceScore: 0,
      };
    }

    const weightSum = signals.reduce(
      (acc, s) => acc + AGENT_BASE_WEIGHTS[s.agentId],
      0,
    );

    const matrix: WeightedAgentContribution[] = signals.map((s) => {
      const weight = AGENT_BASE_WEIGHTS[s.agentId] / weightSum;
      return {
        agentId: s.agentId,
        weight,
        confidence: s.confidence,
        stance: s.stance,
        dampedConfidence: s.confidence * weight,
      };
    });

    const contradictionPenalty = this.computeContradictionPenalty(signals);
    const stanceVector = matrix.reduce(
      (acc, row) => acc + row.weight * STANCE_VECTOR[row.stance] * row.confidence,
      0,
    );
    const rawConfidence = matrix.reduce(
      (acc, row) => acc + row.dampedConfidence,
      0,
    );
    const fusedConfidenceScore = Math.min(
      0.99,
      Math.max(0, rawConfidence * (1 - contradictionPenalty) * relevanceScore),
    );

    const dom = dominantStance(stanceVector);
    const thesis = this.compileThesis(coin, dom, matrix, contradictionPenalty);
    const supportingEvidence = this.aggregateEvidence(signals);
    const provenanceKeys = Array.from(
      new Set(signals.flatMap((s) => s.provenanceKeys)),
    ).sort();

    const opportunity: FusedOpportunity = {
      id: `fused-${coin}-${Date.now()}`,
      coin: coin.toUpperCase(),
      timestamp: Date.now(),
      fusedConfidenceScore,
      thesis,
      supportingEvidence,
      provenanceKeys,
      agentContributions: matrix,
      contradictionPenalty,
      relevanceScore,
      dominantStance: dom,
      signals,
    };

    return {
      opportunity,
      matrix,
      contradictionPenalty,
      fusedConfidenceScore,
    };
  }

  private computeContradictionPenalty(signals: AgentSignal[]): number {
    let penalty = 0;
    for (let i = 0; i < signals.length; i++) {
      for (let j = i + 1; j < signals.length; j++) {
        const a = signals[i];
        const b = signals[j];
        if (!stanceOpposes(a.stance, b.stance)) continue;
        const pairWeight =
          (AGENT_BASE_WEIGHTS[a.agentId] + AGENT_BASE_WEIGHTS[b.agentId]) / 2;
        const severity = (a.confidence + b.confidence) / 2;
        penalty += pairWeight * severity * 0.42;
      }
    }
    return Math.min(0.65, penalty);
  }

  private aggregateEvidence(signals: AgentSignal[]): AgentSignal["supportingEvidence"] {
    const seen = new Set<string>();
    const bullets: AgentSignal["supportingEvidence"] = [];
    for (const s of signals) {
      for (const b of s.supportingEvidence) {
        const k = `${b.provenance}:${b.key}`;
        if (seen.has(k)) continue;
        seen.add(k);
        bullets.push(b);
      }
    }
    return bullets.slice(0, 12);
  }

  private compileThesis(
    coin: string,
    stance: SignalStance,
    matrix: WeightedAgentContribution[],
    penalty: number,
  ): string {
    const top = [...matrix].sort((a, b) => b.dampedConfidence - a.dampedConfidence);
    const lead = top[0];
    const contra =
      penalty > 0.2
        ? ` Contradiction damp −${(penalty * 100).toFixed(0)}bps applied.`
        : "";
    if (!lead) return `${coin} — insufficient agent coverage.`;
    return (
      `${coin} ${stance.toUpperCase()} consensus led by ${lead.agentId.toUpperCase()} ` +
      `(${(lead.dampedConfidence * 100).toFixed(0)}% wt).${contra}`
    );
  }
}

export const signalFusionEngine = new SignalFusionEngine();
