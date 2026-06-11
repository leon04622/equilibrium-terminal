/**
 * OPERATOR JOURNAL — platform-specific academy module.
 * Teaches Equilibrium Terminal's trading memory system.
 */

export type OJVisual =
  | "whyJournal"
  | "journalStructure"
  | "sessionTracking"
  | "decisionLogging"
  | "executionReview"
  | "behaviorAnalysis"
  | "patternsReview"
  | "recap";

export interface OJScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: OJVisual;
  holdMs?: number;
}

export const OPERATOR_JOURNAL_SCENES: OJScene[] = [
  {
    id: "why-journal",
    lesson: 1,
    chapter: "PHASE 1 · WHY JOURNAL?",
    title: "Trader A vs Trader B",
    voice:
      "Trader A places trades and forgets why. Trader B records every decision and reviews patterns. Trader A repeats the same mistakes. Trader B improves because they remember decisions — not just outcomes. Most traders judge themselves by profit and loss. Professionals judge themselves by decision quality.",
    takeaway: "Remember decisions — not just outcomes.",
    visual: "whyJournal",
    holdMs: 3000,
  },
  {
    id: "journal-structure",
    lesson: 2,
    chapter: "PHASE 2 · JOURNAL STRUCTURE",
    title: "Six sections",
    voice:
      "The Operator Journal has six sections. Session tracks your live desk time. Log captures entries, exits, adjustments, observations, and skipped trades. Exec reviews execution quality. Behavior flags revenge trading, overtrading, and emotional decisions. Review debriefs your session. Patterns surfaces repeated strengths and weaknesses over time.",
    takeaway: "Session · Log · Exec · Behavior · Review · Patterns.",
    visual: "journalStructure",
    holdMs: 3200,
  },
  {
    id: "session-tracking",
    lesson: 3,
    chapter: "PHASE 3 · SESSION TRACKING",
    title: "Context capture",
    voice:
      "Every session has a start and an end. The journal stamps regimes, volatility exposure, liquidity conditions, and decision count as you work. Session tracking answers: what kind of desk day was this? Context matters when you review performance later.",
    takeaway: "Sessions frame every decision with context.",
    visual: "sessionTracking",
    holdMs: 2600,
  },
  {
    id: "decision-logging",
    lesson: 4,
    chapter: "PHASE 4 · DECISION LOGGING",
    title: "Capture the why",
    voice:
      "Log entries, exits, adjustments, observations, and skipped trades. Record your thesis, confidence, emotion, and risk note. A skipped trade with a clear reason is often your best decision. The journal becomes your trading memory — what happened and why it happened.",
    takeaway: "Log the why — not just the fill.",
    visual: "decisionLogging",
    holdMs: 2800,
  },
  {
    id: "execution-review",
    lesson: 5,
    chapter: "PHASE 5 · EXECUTION REVIEW",
    title: "Good vs poor execution",
    voice:
      "The Exec tab scores chase rate, overtrading pressure, and low-liquidity execution. Good execution is patient and sized to conditions. Poor execution chases moves and ignores the book. The journal shows both — so you can fix execution without guessing.",
    takeaway: "Execution quality is measurable — review it.",
    visual: "executionReview",
    holdMs: 2600,
  },
  {
    id: "behavior-analysis",
    lesson: 6,
    chapter: "PHASE 6 · BEHAVIOR ANALYSIS",
    title: "Detect patterns early",
    voice:
      "Revenge trading, overtrading, impatience, and emotional entries show up in the Behavior tab before they destroy a week. The journal detects these patterns automatically. You cannot fix behavior you do not see — this tab makes it visible.",
    takeaway: "Behavior flags surface discipline leaks early.",
    visual: "behaviorAnalysis",
    holdMs: 2600,
  },
  {
    id: "patterns-review",
    lesson: 7,
    chapter: "PHASE 7–8 · REVIEW & PATTERNS",
    title: "Long-term improvement",
    voice:
      "After the session, Review highlights your best and worst decisions, dangerous behaviors, and desk debrief notes. Patterns tab shows repeated mistakes and repeated strengths across sessions. This is how long-term improvement happens — review decisions, find patterns, adjust behavior.",
    takeaway: "Review sessions · discover patterns · improve.",
    visual: "patternsReview",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Your trading memory",
    voice:
      "The Operator Journal is your trading memory on Equilibrium Terminal. Next: open the real Operator Journal panel and walk through each section live.",
    takeaway: "The Operator Journal is my trading memory.",
    visual: "recap",
    holdMs: 2400,
  },
];
