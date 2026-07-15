/**
 * MARKET STATE LAYER v1 — STABILITY FREEZE
 * Platform-specific academy module.
 * Teaches how Equilibrium classifies CALM / ACTIVE / THIN / STRESS and adapts behavior.
 */

export type MSVisual =
  | "whyStates"
  | "calm"
  | "active"
  | "thin"
  | "stress"
  | "transitions"
  | "operatorWorkflow"
  | "recap";

export interface MSScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: MSVisual;
  holdMs?: number;
}

export const MARKET_STATE_SCENES: MSScene[] = [
  {
    id: "why-states",
    lesson: 1,
    chapter: "PHASE 1 · WHY MARKET STATES EXIST",
    title: "Trader A vs Trader B",
    voice:
      "Trader A trades the same way every day. Trader B checks the Market State Layer first and adapts. Different environments require different behavior. The market environment changes — professional operators change with it.",
    takeaway: "Adapt to the environment — don't repeat one mode every session.",
    visual: "whyStates",
    holdMs: 3000,
  },
  {
    id: "calm",
    lesson: 2,
    chapter: "PHASE 2 · CALM STATE",
    title: "Stable conditions",
    voice:
      "CALM means normal volatility and healthy liquidity. Spreads are workable and execution quality is reliable. Operators use planned entries, standard size, and normal confirmation rules.",
    takeaway: "CALM supports disciplined planned execution — not complacency.",
    visual: "calm",
    holdMs: 2800,
  },
  {
    id: "active",
    lesson: 3,
    chapter: "PHASE 3 · ACTIVE STATE",
    title: "Movement expanding",
    voice:
      "ACTIVE means volatility is expanding. Opportunities increase but attention must increase too. Operators read faster, tighten risk, and require stronger confirmation before adding size.",
    takeaway: "ACTIVE demands faster reads and tighter risk.",
    visual: "active",
    holdMs: 2800,
  },
  {
    id: "thin",
    lesson: 4,
    chapter: "PHASE 4 · THIN STATE",
    title: "Liquidity deteriorating",
    voice:
      "THIN means liquidity is weak — spreads widen and slippage risk rises. Market orders cost more. Operators favor limits, reduce size, and accept that fills may be partial or delayed.",
    takeaway: "THIN means execution quality is at risk — trade accordingly.",
    visual: "thin",
    holdMs: 2800,
  },
  {
    id: "stress",
    lesson: 5,
    chapter: "PHASE 5 · STRESS STATE",
    title: "Defensive posture",
    voice:
      "STRESS means elevated volatility, unstable conditions, and liquidation risk. Emotional markets punish reactive traders. Operators reduce size, widen confirmation, or stand aside until conditions stabilize.",
    takeaway: "STRESS requires caution — protect capital first.",
    visual: "stress",
    holdMs: 3000,
  },
  {
    id: "transitions",
    lesson: 6,
    chapter: "PHASE 6 · STATE TRANSITIONS",
    title: "CALM → ACTIVE → STRESS",
    voice:
      "States evolve through the session. CALM can shift to ACTIVE as volatility expands. ACTIVE can deteriorate into STRESS when liquidity fails. STRESS can ease back toward CALM. Watch transitions — behavior must shift with them.",
    takeaway: "State transitions are signals — not noise.",
    visual: "transitions",
    holdMs: 3000,
  },
  {
    id: "operator-workflow",
    lesson: 7,
    chapter: "PHASE 7 · OPERATOR WORKFLOW",
    title: "Check state before trading",
    voice:
      "Professional workflow: open terminal, read Market State Layer classification, review supporting signals, adjust position sizing, adjust execution style, adjust risk. Then trade. Context before clicks.",
    takeaway: "Check state → adjust size, execution, risk → then trade.",
    visual: "operatorWorkflow",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Behavior follows environment",
    voice:
      "The Market State Layer exists so you stop using one approach every day. Next: open the real Market State Layer panel and walk through classification, confidence, history, and signals live.",
    takeaway: "The market environment changes — your behavior should change with it.",
    visual: "recap",
    holdMs: 2400,
  },
];
