import {
  MarketStateClassificationEngine,
  type DeskStateLabel,
  type MarketStateClassification,
} from "@/lib/daily/MarketStateClassificationEngine";
import { MarketStateHistoryEngine } from "@/lib/daily/MarketStateHistoryEngine";

export type CoachState = "good" | "neutral" | "warn" | "danger";

export interface MSCoachContext {
  classification: MarketStateClassification;
  history: ReturnType<typeof MarketStateHistoryEngine.recent>;
}

export interface CoachCard {
  state: CoachState;
  liveNow: string;
  lookHere: string;
  whyItMatters: string;
  whatToWatch: string;
  alertLine: string;
}

export interface WorkflowStep {
  order: number;
  label: string;
  region: "classification" | "signals" | "confidence" | "history";
  note: string;
}

function coachState(desk: DeskStateLabel): CoachState {
  if (desk === "STRESS") return "danger";
  if (desk === "THIN" || desk === "ACTIVE") return "warn";
  return "good";
}

export const MarketStateCoach = {
  contextFromClassification(c: MarketStateClassification): MSCoachContext {
    return {
      classification: c,
      history: MarketStateHistoryEngine.recent(6),
    };
  },

  contextLive(): MSCoachContext {
    const c = MarketStateClassificationEngine.classify();
    MarketStateHistoryEngine.record(c.deskState, c.confidence);
    return this.contextFromClassification(c);
  },

  todayReadout(ctx: MSCoachContext): string {
    const { deskState, confidence, layer } = ctx.classification;
    return `${deskState} · ${confidence}% confidence · ${layer.compositeLabel}. Your environment readout.`;
  },

  classificationAdvice(ctx: MSCoachContext): string {
    const { deskState, deskTone } = ctx.classification;
    return `Current classification: ${deskState}. Desk tone: ${deskTone}. This is how Equilibrium summarizes conditions for operators.`;
  },

  calmAdvice(): string {
    return "CALM — stable volatility and workable liquidity. Standard discipline and planned entries are appropriate.";
  },

  activeAdvice(): string {
    return "ACTIVE — volatility expanding. Read faster, tighten risk, and demand stronger confirmation.";
  },

  thinAdvice(): string {
    return "THIN — liquidity deteriorating. Favor limits, reduce size, expect slippage.";
  },

  stressAdvice(): string {
    return "STRESS — defensive posture. Reduce exposure, widen confirmation, or stand aside.";
  },

  confidenceAdvice(ctx: MSCoachContext): string {
    return `Classification confidence ${ctx.classification.confidence}% — based on agreement across volatility, liquidity, macro risk, and breadth signals.`;
  },

  signalsAdvice(ctx: MSCoachContext): string {
    const sig = ctx.classification.supportingSignals.map((s) => `${s.label} ${s.value}`).join(" · ");
    return `Supporting signals: ${sig}. These inputs drive the CALM / ACTIVE / THIN / STRESS label.`;
  },

  historyAdvice(ctx: MSCoachContext): string {
    if (ctx.history.length === 0) return "State history builds as conditions evolve through your session.";
    const latest = ctx.history[0]!;
    const transition = latest.from ? `${latest.from} → ${latest.state}` : latest.state;
    return `Latest transition: ${transition} at ${new Date(latest.at).toLocaleTimeString()}. Watch how states evolve.`;
  },

  workflowSteps(): WorkflowStep[] {
    return [
      { order: 1, label: "Read classification", region: "classification", note: "CALM / ACTIVE / THIN / STRESS" },
      { order: 2, label: "Check confidence", region: "confidence", note: "How sure the layer is" },
      { order: 3, label: "Review signals", region: "signals", note: "Vol · liq · risk · macro inputs" },
      { order: 4, label: "Adjust behavior", region: "history", note: "Size · execution · risk — then trade" },
    ];
  },

  alertLine(ctx: MSCoachContext): string {
    const desk = ctx.classification.deskState;
    if (desk === "STRESS") return "Stress conditions detected — reduce exposure before new entries.";
    if (desk === "THIN") return "Liquidity deteriorating — execution quality at risk.";
    if (desk === "ACTIVE") return "Conditions becoming active — tighten risk and read faster.";
    return "Market currently calm — maintain awareness as states transition.";
  },

  operatorCoach(ctx: MSCoachContext): CoachCard {
    const desk = ctx.classification.deskState;
    return {
      state: coachState(desk),
      liveNow: this.todayReadout(ctx),
      lookHere: "MARKET STATE LAYER → classification · confidence · signals · history.",
      whyItMatters: "This layer ties Daily Operations, Live Desk, volatility, and risk into one behavior guide.",
      whatToWatch: "State transitions from CALM toward ACTIVE, THIN, or STRESS.",
      alertLine: this.alertLine(ctx),
    };
  },
};
