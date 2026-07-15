import {
  lessonProgress,
  type RawAcademyProgress,
} from "@/lib/education/learningAcademy";
import type { OperatorPhase, ReviewTaskId, TradingTaskId } from "@/lib/operator-mode/OperatorModeEngine";

export interface OperatorProCapabilities {
  orderBookChecks: boolean;
  executionGuidance: boolean;
  journalReview: boolean;
  contextWorkflow: boolean;
}

export const EMPTY_PRO: OperatorProCapabilities = {
  orderBookChecks: false,
  executionGuidance: false,
  journalReview: false,
  contextWorkflow: false,
};

export function resolveProCapabilities(raw: RawAcademyProgress): OperatorProCapabilities {
  return {
    orderBookChecks: lessonProgress("order-book", raw).mastery,
    executionGuidance: lessonProgress("execution", raw).mastery,
    journalReview: lessonProgress("operator-journal", raw).mastery,
    contextWorkflow: lessonProgress("market-memory", raw).mastery,
  };
}

export function hasAnyProCapability(pro: OperatorProCapabilities): boolean {
  return pro.orderBookChecks || pro.executionGuidance || pro.journalReview || pro.contextWorkflow;
}

export function visiblePhases(pro: OperatorProCapabilities): OperatorPhase[] {
  const phases: OperatorPhase[] = ["morning"];
  if (pro.orderBookChecks || pro.executionGuidance) phases.push("trading");
  if (pro.journalReview) phases.push("review");
  return phases;
}

export function clampPhaseTab(tab: OperatorPhase, pro: OperatorProCapabilities): OperatorPhase {
  const phases = visiblePhases(pro);
  return phases.includes(tab) ? tab : (phases[0] ?? "morning");
}

export function visibleTradingTaskIds(pro: OperatorProCapabilities): TradingTaskId[] {
  const ids: TradingTaskId[] = [];
  if (pro.orderBookChecks) ids.push("liquidity", "spread");
  if (pro.executionGuidance) ids.push("volatility", "position-size", "market-state");
  return ids;
}

export function visibleReviewTaskIds(pro: OperatorProCapabilities): ReviewTaskId[] {
  if (!pro.journalReview) return [];
  const ids: ReviewTaskId[] = ["journal-updated", "session-reviewed", "mistakes-reviewed"];
  if (pro.contextWorkflow) ids.push("lessons-recorded");
  return ids;
}

/** Academy lesson hints shown in Lite panel when Pro not yet unlocked. */
export const PRO_UNLOCK_HINTS = [
  { lesson: "Order Book", lessonId: "order-book", unlocks: "Liquidity & spread execution checks" },
  { lesson: "Execution", lessonId: "execution", unlocks: "Advanced pre-trade execution guidance" },
  { lesson: "Operator Journal", lessonId: "operator-journal", unlocks: "Session review workflow" },
  { lesson: "Market Memory", lessonId: "market-memory", unlocks: "Historical context workflow" },
] as const;
