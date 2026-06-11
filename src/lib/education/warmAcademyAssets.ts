/**
 * ACADEMY FRAMEWORK V1 — preload voices and lesson metadata on hub open.
 */

import { armLessonVoice } from "@/lib/education/LessonNarrator";

let warmed = false;

export function warmAcademyAssets(): void {
  if (typeof window === "undefined") return;
  armLessonVoice();

  if (warmed) return;
  warmed = true;

  // Warm scene modules in idle time — reduces first-open latency per lesson.
  const preload = () => {
    void import("@/lib/education/marketMechanicsScenes");
    void import("@/lib/education/tradeTypesScenes");
    void import("@/lib/education/fundingCrowdingScenes");
    void import("@/lib/education/liquidationsScenes");
    void import("@/lib/education/riskManagementScenes");
    void import("@/lib/education/slippageScenes");
    void import("@/lib/education/executionScenes");
    void import("@/lib/education/portfolioRiskScenes");
    void import("@/lib/education/dailyOperationsScenes");
    void import("@/lib/education/operatorJournalScenes");
    void import("@/lib/education/liveDeskScenes");
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(preload, { timeout: 2500 });
  } else {
    setTimeout(preload, 400);
  }
}
