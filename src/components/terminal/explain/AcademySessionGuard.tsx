"use client";

import { useEffect } from "react";
import { cancelLesson, disarmLessonVoice } from "@/lib/education/LessonNarrator";
import { academyPerf } from "@/lib/education/academyPerformance";
import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";
import { useFundingCrowdingStore } from "@/store/useFundingCrowdingStore";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";
import { useTradeTypesStore } from "@/store/useTradeTypesStore";
import { useTradeTypesBridgeStore } from "@/store/useTradeTypesBridgeStore";
import { useLiquidationsStore } from "@/store/useLiquidationsStore";
import { useLiquidationsBridgeStore } from "@/store/useLiquidationsBridgeStore";
import { useRiskManagementStore } from "@/store/useRiskManagementStore";
import { useRiskManagementBridgeStore } from "@/store/useRiskManagementBridgeStore";
import { useSlippageStore } from "@/store/useSlippageStore";
import { useSlippageBridgeStore } from "@/store/useSlippageBridgeStore";
import { useExecutionLessonStore } from "@/store/useExecutionLessonStore";
import { useExecutionLessonBridgeStore } from "@/store/useExecutionLessonBridgeStore";
import { usePortfolioRiskStore } from "@/store/usePortfolioRiskStore";
import { usePortfolioRiskBridgeStore } from "@/store/usePortfolioRiskBridgeStore";
import { useDailyOperationsLessonStore } from "@/store/useDailyOperationsLessonStore";
import { useDailyOperationsBridgeStore } from "@/store/useDailyOperationsBridgeStore";
import { useOperatorJournalLessonStore } from "@/store/useOperatorJournalLessonStore";
import { useOperatorJournalBridgeStore } from "@/store/useOperatorJournalBridgeStore";
import { useLiveDeskLessonStore } from "@/store/useLiveDeskLessonStore";
import { useLiveDeskBridgeStore } from "@/store/useLiveDeskBridgeStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

/**
 * ACADEMY FRAMEWORK V1 — stops narration when no lesson overlay is active.
 */
export function AcademySessionGuard() {
  const mm = useMarketMechanicsStore((s) => s.active);
  const ob = useOrderBookLessonStore((s) => s.active);
  const obBridge = useLessonBridgeStore((s) => s.active);
  const funding = useFundingCrowdingStore((s) => s.active);
  const fundingBridge = useFundingBridgeStore((s) => s.active);
  const tt = useTradeTypesStore((s) => s.active);
  const ttBridge = useTradeTypesBridgeStore((s) => s.active);
  const liq = useLiquidationsStore((s) => s.active);
  const liqBridge = useLiquidationsBridgeStore((s) => s.active);
  const rm = useRiskManagementStore((s) => s.active);
  const rmBridge = useRiskManagementBridgeStore((s) => s.active);
  const slip = useSlippageStore((s) => s.active);
  const slipBridge = useSlippageBridgeStore((s) => s.active);
  const exec = useExecutionLessonStore((s) => s.active);
  const execBridge = useExecutionLessonBridgeStore((s) => s.active);
  const pr = usePortfolioRiskStore((s) => s.active);
  const prBridge = usePortfolioRiskBridgeStore((s) => s.active);
  const dailyOps = useDailyOperationsLessonStore((s) => s.active);
  const dailyOpsBridge = useDailyOperationsBridgeStore((s) => s.active);
  const oj = useOperatorJournalLessonStore((s) => s.active);
  const ojBridge = useOperatorJournalBridgeStore((s) => s.active);
  const liveDesk = useLiveDeskLessonStore((s) => s.active);
  const liveDeskBridge = useLiveDeskBridgeStore((s) => s.active);
  const guidedLesson = Boolean(useOperatorGuideStore((s) => s.activeLessonPanelId));

  const anyActive =
    mm || ob || obBridge || funding || fundingBridge || tt || ttBridge || liq || liqBridge || rm || rmBridge || slip || slipBridge || exec || execBridge || pr || prBridge || dailyOps || dailyOpsBridge || oj || ojBridge || liveDesk || liveDeskBridge || guidedLesson;

  useEffect(() => {
    if (anyActive) return;
    cancelLesson();
    const disarmTimer = window.setTimeout(() => {
      disarmLessonVoice();
      academyPerf.markLessonClose();
    }, 400);
    return () => window.clearTimeout(disarmTimer);
  }, [anyActive]);

  return null;
}
