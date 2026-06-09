/**
 * Live Operational Mentor System.
 * Turns raw live market events into calm, plain-English educational alerts that
 * always carry the four-part structure: what happened, why it matters, what to
 * check next, and what mistake to avoid.
 */

export type CoachSeverity = "info" | "watch" | "critical";

/** Where a live educational alert originated. */
export type CoachSource =
  | "alert"
  | "intelligence"
  | "execution"
  | "funding"
  | "volatility"
  | "liquidity"
  | "spread"
  | "behavioral"
  | "replay"
  | "coaching";

/**
 * PHASE 8 — an educational operational alert.
 * Every live event becomes one of these so nothing is ever shown as raw
 * shorthand without a plain-English expansion attached.
 */
export interface EducationalAlert {
  id: string;
  ts: number;
  source: CoachSource;
  severity: CoachSeverity;
  /** Asset this concerns, if any. */
  coin?: string;
  /** Panel that should be highlighted when this surfaces (visual sync). */
  focusPanel?: string;
  /** The original technical / shorthand line. */
  technical: string;
  /** WHAT IT MEANS (plain English). */
  meaning: string;
  /** WHY IT MATTERS. */
  whyMatters: string;
  /** WHAT TO CHECK NEXT. */
  checkNext: string;
  /** WHAT MISTAKE TO AVOID. */
  mistake: string;
  /** Glossary term this maps to, if any. */
  termId?: string;
  /** Suppression key — repeats of the same key within a window are throttled. */
  dedupeKey: string;
}

/**
 * PHASE 4 / PHASE 10 — a queued voice line for future Leon-voice narration.
 * The queue is calm-paced and de-duplicated so the voice never spams.
 */
export interface VoiceCue {
  id: string;
  ts: number;
  /** Higher = more urgent; criticals jump the queue. */
  priority: number;
  /** Suppression key so identical lines don't repeat. */
  key: string;
  /** The calm-mentor line to speak. */
  text: string;
}
