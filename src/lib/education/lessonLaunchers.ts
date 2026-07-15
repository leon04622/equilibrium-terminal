/**
 * Central launch actions for the Learning Command Center lesson library.
 */

import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";
import { useMarketMechanicsBridgeStore } from "@/store/useMarketMechanicsBridgeStore";
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
import { useMarketStateLessonStore } from "@/store/useMarketStateLessonStore";
import { useMarketStateBridgeStore } from "@/store/useMarketStateBridgeStore";
import { useDailyBriefingLessonStore } from "@/store/useDailyBriefingLessonStore";
import { useDailyBriefingBridgeStore } from "@/store/useDailyBriefingBridgeStore";
import { useMarketMemoryLessonStore } from "@/store/useMarketMemoryLessonStore";
import { useMarketMemoryBridgeStore } from "@/store/useMarketMemoryBridgeStore";
import { useCryptoFinancialOsLessonStore } from "@/store/useCryptoFinancialOsLessonStore";
import { useCryptoFinancialOsBridgeStore } from "@/store/useCryptoFinancialOsBridgeStore";
import { useFirstTradeLessonStore } from "@/store/useFirstTradeLessonStore";
import { useFirstTradeBridgeStore } from "@/store/useFirstTradeBridgeStore";
import { useMarketStructureLessonStore } from "@/store/useMarketStructureLessonStore";
import { useMarketStructureBridgeStore } from "@/store/useMarketStructureBridgeStore";
import { useLiquidityDeepLessonStore } from "@/store/useLiquidityDeepLessonStore";
import { useLiquidityDeepBridgeStore } from "@/store/useLiquidityDeepBridgeStore";
import { useCrossMarketLessonStore } from "@/store/useCrossMarketLessonStore";
import { useCrossMarketBridgeStore } from "@/store/useCrossMarketBridgeStore";
import { useMacroFlowsLessonStore } from "@/store/useMacroFlowsLessonStore";
import { useMacroFlowsBridgeStore } from "@/store/useMacroFlowsBridgeStore";
import { useIntelligenceDeskLessonStore } from "@/store/useIntelligenceDeskLessonStore";
import { useIntelligenceDeskBridgeStore } from "@/store/useIntelligenceDeskBridgeStore";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { academyPerf, beginAcademyTransition, endAcademyTransition } from "@/lib/education/academyPerformance";
import { warmAcademyAssets } from "@/lib/education/warmAcademyAssets";

export type LaunchMode = "start" | "restart" | "review" | "bridge" | "simulator" | "replay";

export function useLessonLaunchers() {
  const closeHub = useLearningAcademyStore((s) => s.close);
  const bump = useLearningAcademyStore((s) => s.bumpProgress);

  const openMM = useMarketMechanicsStore((s) => s.open);
  const restartMM = useMarketMechanicsStore((s) => s.restart);
  const startMmBridge = useMarketMechanicsBridgeStore((s) => s.start);

  const openOB = useOrderBookLessonStore((s) => s.open);
  const restartOB = useOrderBookLessonStore((s) => s.restart);

  const startObBridge = useLessonBridgeStore((s) => s.start);

  const openFunding = useFundingCrowdingStore((s) => s.open);
  const restartFunding = useFundingCrowdingStore((s) => s.restart);

  const startFundingBridge = useFundingBridgeStore((s) => s.start);

  const openTradeTypes = useTradeTypesStore((s) => s.open);
  const restartTradeTypes = useTradeTypesStore((s) => s.restart);

  const startTradeTypesBridge = useTradeTypesBridgeStore((s) => s.start);

  const openLiquidations = useLiquidationsStore((s) => s.open);
  const restartLiquidations = useLiquidationsStore((s) => s.restart);
  const startLiquidationsBridge = useLiquidationsBridgeStore((s) => s.start);

  const openRiskManagement = useRiskManagementStore((s) => s.open);
  const restartRiskManagement = useRiskManagementStore((s) => s.restart);
  const startRiskManagementBridge = useRiskManagementBridgeStore((s) => s.start);

  const openSlippage = useSlippageStore((s) => s.open);
  const restartSlippage = useSlippageStore((s) => s.restart);
  const startSlippageBridge = useSlippageBridgeStore((s) => s.start);

  const openExecution = useExecutionLessonStore((s) => s.open);
  const restartExecution = useExecutionLessonStore((s) => s.restart);
  const startExecutionBridge = useExecutionLessonBridgeStore((s) => s.start);

  const openPortfolioRisk = usePortfolioRiskStore((s) => s.open);
  const restartPortfolioRisk = usePortfolioRiskStore((s) => s.restart);
  const startPortfolioRiskBridge = usePortfolioRiskBridgeStore((s) => s.start);

  const openDailyOps = useDailyOperationsLessonStore((s) => s.open);
  const restartDailyOps = useDailyOperationsLessonStore((s) => s.restart);
  const startDailyOpsBridge = useDailyOperationsBridgeStore((s) => s.start);

  const openOperatorJournal = useOperatorJournalLessonStore((s) => s.open);
  const restartOperatorJournal = useOperatorJournalLessonStore((s) => s.restart);
  const startOperatorJournalBridge = useOperatorJournalBridgeStore((s) => s.start);

  const openLiveDesk = useLiveDeskLessonStore((s) => s.open);
  const restartLiveDesk = useLiveDeskLessonStore((s) => s.restart);
  const startLiveDeskBridge = useLiveDeskBridgeStore((s) => s.start);

  const openMarketState = useMarketStateLessonStore((s) => s.open);
  const restartMarketState = useMarketStateLessonStore((s) => s.restart);
  const startMarketStateBridge = useMarketStateBridgeStore((s) => s.start);

  const openDailyBriefing = useDailyBriefingLessonStore((s) => s.open);
  const restartDailyBriefing = useDailyBriefingLessonStore((s) => s.restart);
  const startDailyBriefingBridge = useDailyBriefingBridgeStore((s) => s.start);

  const openMarketMemory = useMarketMemoryLessonStore((s) => s.open);
  const restartMarketMemory = useMarketMemoryLessonStore((s) => s.restart);
  const startMarketMemoryBridge = useMarketMemoryBridgeStore((s) => s.start);

  const openCryptoFinancialOs = useCryptoFinancialOsLessonStore((s) => s.open);
  const restartCryptoFinancialOs = useCryptoFinancialOsLessonStore((s) => s.restart);
  const startCryptoFinancialOsBridge = useCryptoFinancialOsBridgeStore((s) => s.start);

  const openFirstTrade = useFirstTradeLessonStore((s) => s.open);
  const restartFirstTrade = useFirstTradeLessonStore((s) => s.restart);
  const startFirstTradeBridge = useFirstTradeBridgeStore((s) => s.start);

  const openMarketStructure = useMarketStructureLessonStore((s) => s.open);
  const restartMarketStructure = useMarketStructureLessonStore((s) => s.restart);
  const startMarketStructureBridge = useMarketStructureBridgeStore((s) => s.start);

  const openLiquidityDeep = useLiquidityDeepLessonStore((s) => s.open);
  const restartLiquidityDeep = useLiquidityDeepLessonStore((s) => s.restart);
  const startLiquidityDeepBridge = useLiquidityDeepBridgeStore((s) => s.start);

  const openCrossMarket = useCrossMarketLessonStore((s) => s.open);
  const restartCrossMarket = useCrossMarketLessonStore((s) => s.restart);
  const startCrossMarketBridge = useCrossMarketBridgeStore((s) => s.start);

  const openMacroFlows = useMacroFlowsLessonStore((s) => s.open);
  const restartMacroFlows = useMacroFlowsLessonStore((s) => s.restart);
  const startMacroFlowsBridge = useMacroFlowsBridgeStore((s) => s.start);

  const openIntelligenceDesk = useIntelligenceDeskLessonStore((s) => s.open);
  const restartIntelligenceDesk = useIntelligenceDeskLessonStore((s) => s.restart);
  const startIntelligenceDeskBridge = useIntelligenceDeskBridgeStore((s) => s.start);

  const launch = (lessonId: string, mode: LaunchMode = "start") => {
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    armLessonVoice();
    warmAcademyAssets();
    beginAcademyTransition();
    closeHub();
    bump();

    switch (lessonId) {
      case "market-mechanics":
        if (mode === "bridge") startMmBridge();
        else if (mode === "restart" || mode === "simulator") restartMM();
        else openMM();
        break;
      case "order-book":
        if (mode === "bridge") startObBridge();
        else if (mode === "restart" || mode === "simulator") restartOB();
        else openOB();
        break;
      case "funding":
        if (mode === "bridge") startFundingBridge();
        else if (mode === "restart" || mode === "simulator") restartFunding();
        else openFunding();
        break;
      case "trade-types":
        if (mode === "bridge") startTradeTypesBridge();
        else if (mode === "restart" || mode === "simulator") restartTradeTypes();
        else openTradeTypes();
        break;
      case "liquidations":
        if (mode === "bridge") startLiquidationsBridge();
        else if (mode === "restart" || mode === "simulator") restartLiquidations();
        else openLiquidations();
        break;
      case "risk-management":
        if (mode === "bridge") startRiskManagementBridge();
        else if (mode === "restart" || mode === "simulator") restartRiskManagement();
        else openRiskManagement();
        break;
      case "slippage":
        if (mode === "bridge") startSlippageBridge();
        else if (mode === "restart" || mode === "simulator") restartSlippage();
        else openSlippage();
        break;
      case "execution":
        if (mode === "bridge") startExecutionBridge();
        else if (mode === "restart" || mode === "simulator") restartExecution();
        else openExecution();
        break;
      case "portfolio-risk":
        if (mode === "bridge") startPortfolioRiskBridge();
        else if (mode === "restart" || mode === "simulator") restartPortfolioRisk();
        else openPortfolioRisk();
        break;
      case "daily-operations":
        if (mode === "bridge") startDailyOpsBridge();
        else if (mode === "restart" || mode === "simulator") restartDailyOps();
        else openDailyOps();
        break;
      case "operator-journal":
        if (mode === "bridge") startOperatorJournalBridge();
        else if (mode === "restart" || mode === "simulator") restartOperatorJournal();
        else openOperatorJournal();
        break;
      case "live-desk":
        if (mode === "bridge") startLiveDeskBridge();
        else if (mode === "restart" || mode === "simulator") restartLiveDesk();
        else openLiveDesk();
        break;
      case "market-state":
        if (mode === "bridge") startMarketStateBridge();
        else if (mode === "restart" || mode === "simulator") restartMarketState();
        else openMarketState();
        break;
      case "daily-briefing":
        if (mode === "bridge") startDailyBriefingBridge();
        else if (mode === "restart" || mode === "simulator") restartDailyBriefing();
        else openDailyBriefing();
        break;
      case "market-memory":
        if (mode === "bridge") startMarketMemoryBridge();
        else if (mode === "restart" || mode === "simulator") restartMarketMemory();
        else openMarketMemory();
        break;
      case "crypto-financial-os":
        if (mode === "bridge") startCryptoFinancialOsBridge();
        else if (mode === "restart" || mode === "simulator") restartCryptoFinancialOs();
        else openCryptoFinancialOs();
        break;
      case "first-trade-checklist":
        if (mode === "bridge") startFirstTradeBridge();
        else if (mode === "restart" || mode === "simulator") restartFirstTrade();
        else openFirstTrade();
        break;
      case "market-structure":
        if (mode === "bridge") startMarketStructureBridge();
        else if (mode === "restart" || mode === "simulator") restartMarketStructure();
        else openMarketStructure();
        break;
      case "liquidity-deep":
        if (mode === "bridge") startLiquidityDeepBridge();
        else if (mode === "restart" || mode === "simulator") restartLiquidityDeep();
        else openLiquidityDeep();
        break;
      case "cross-market":
        if (mode === "bridge") startCrossMarketBridge();
        else if (mode === "restart" || mode === "simulator") restartCrossMarket();
        else openCrossMarket();
        break;
      case "macro-flows":
        if (mode === "bridge") startMacroFlowsBridge();
        else if (mode === "restart" || mode === "simulator") restartMacroFlows();
        else openMacroFlows();
        break;
      case "intelligence-desk":
        if (mode === "bridge") startIntelligenceDeskBridge();
        else if (mode === "restart" || mode === "simulator") restartIntelligenceDesk();
        else openIntelligenceDesk();
        break;
      default:
        break;
    }
    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
    academyPerf.markLessonOpen(lessonId, t1 - t0);
    endAcademyTransition();
  };

  return { launch };
}
