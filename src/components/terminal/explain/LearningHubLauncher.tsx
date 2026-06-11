"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { ACADEMY_LESSONS, buildLessonStatuses, operatorLevel } from "@/lib/education/learningAcademy";
import { readAcademyProgress } from "@/lib/education/learningProgressSnapshot";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
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
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { warmAcademyAssets } from "@/lib/education/warmAcademyAssets";

/**
 * Opens the Learning Command Center — front door to the training program.
 */
export function LearningHubLauncher() {
  const openHub = useLearningAcademyStore((s) => s.open);
  const hubActive = useLearningAcademyStore((s) => s.active);

  const marketsActive = useMarketMechanicsStore((s) => s.active);
  const obActive = useOrderBookLessonStore((s) => s.active);
  const obBridgeActive = useLessonBridgeStore((s) => s.active);
  const fundingActive = useFundingCrowdingStore((s) => s.active);
  const fundingBridgeActive = useFundingBridgeStore((s) => s.active);
  const tradeTypesActive = useTradeTypesStore((s) => s.active);
  const tradeTypesBridgeActive = useTradeTypesBridgeStore((s) => s.active);
  const liquidationsActive = useLiquidationsStore((s) => s.active);
  const liquidationsBridgeActive = useLiquidationsBridgeStore((s) => s.active);
  const riskManagementActive = useRiskManagementStore((s) => s.active);
  const riskManagementBridgeActive = useRiskManagementBridgeStore((s) => s.active);
  const slippageActive = useSlippageStore((s) => s.active);
  const slippageBridgeActive = useSlippageBridgeStore((s) => s.active);
  const executionActive = useExecutionLessonStore((s) => s.active);
  const executionBridgeActive = useExecutionLessonBridgeStore((s) => s.active);
  const portfolioRiskActive = usePortfolioRiskStore((s) => s.active);
  const portfolioRiskBridgeActive = usePortfolioRiskBridgeStore((s) => s.active);
  const dailyOpsActive = useDailyOperationsLessonStore((s) => s.active);
  const dailyOpsBridgeActive = useDailyOperationsBridgeStore((s) => s.active);
  const ojActive = useOperatorJournalLessonStore((s) => s.active);
  const ojBridgeActive = useOperatorJournalBridgeStore((s) => s.active);

  const progressVersion = useLearningAcademyStore((s) => s.progressVersion);

  const anyLessonActive =
    marketsActive ||
    obActive ||
    obBridgeActive ||
    fundingActive ||
    fundingBridgeActive ||
    tradeTypesActive ||
    tradeTypesBridgeActive ||
    liquidationsActive ||
    liquidationsBridgeActive ||
    riskManagementActive ||
    riskManagementBridgeActive ||
    slippageActive ||
    slippageBridgeActive ||
    executionActive ||
    executionBridgeActive ||
    portfolioRiskActive ||
    portfolioRiskBridgeActive ||
    dailyOpsActive ||
    dailyOpsBridgeActive ||
    ojActive ||
    ojBridgeActive;

  const { completedCount, liveTotal, rankTitle } = useMemo(() => {
    void progressVersion;
    const raw = readAcademyProgress();
    const statuses = buildLessonStatuses(raw);
    const rank = operatorLevel(raw, statuses);
    const live = ACADEMY_LESSONS.filter((l) => l.live);
    const done = live.filter((l) => statuses.get(l.id) === "completed").length;
    return { completedCount: done, liveTotal: live.length, rankTitle: rank.title };
  }, [progressVersion]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        armLessonVoice();
        warmAcademyAssets();
        openHub();
      }}
      title="Learning Command Center — training paths, progress, and next lesson"
      className={cn(
        TERMINAL_TYPO.micro,
        "relative z-[10] flex shrink-0 items-center gap-1.5 border px-2.5 py-1 transition-colors",
        hubActive || anyLessonActive
          ? "border-cyan-500/70 bg-cyan-950/50 text-cyan-100"
          : "border-slate-600 bg-slate-900/80 text-slate-200 hover:border-slate-500 hover:bg-slate-900",
      )}
    >
      <BookOpen className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
      <span className="whitespace-nowrap font-semibold tracking-wide">LEARNING</span>
      <span className="rounded-sm border border-slate-700 px-1 font-mono text-[9px] text-slate-500">
        {completedCount}/{liveTotal}
      </span>
      <span className="hidden font-mono text-[8px] text-slate-500 md:inline">{rankTitle}</span>
    </button>
  );
}
