"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
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

function lazyAcademy(loader: () => Promise<Record<string, ComponentType>>, exportName: string) {
  return dynamic(
    () =>
      loader().then((mod) => {
        const Component = mod[exportName];
        if (!Component) {
          throw new Error(`Academy overlay missing export: ${exportName}`);
        }
        return Component;
      }),
    { ssr: false },
  );
}

const CinematicOrderBookLesson = lazyAcademy(
  () => import("@/components/terminal/explain/CinematicOrderBookLesson"),
  "CinematicOrderBookLesson",
);
const MarketMechanicsSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/MarketMechanicsSimulator"),
  "MarketMechanicsSimulator",
);
const MarketMechanicsLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/MarketMechanicsLiveBridge"),
  "MarketMechanicsLiveBridge",
);
const LessonLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/LessonLiveBridge"),
  "LessonLiveBridge",
);
const FundingCrowdingSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/FundingCrowdingSimulator"),
  "FundingCrowdingSimulator",
);
const FundingLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/FundingLiveBridge"),
  "FundingLiveBridge",
);
const TradeTypesSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/TradeTypesSimulator"),
  "TradeTypesSimulator",
);
const TradeTypesLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/TradeTypesLiveBridge"),
  "TradeTypesLiveBridge",
);
const LiquidationsSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/LiquidationsSimulator"),
  "LiquidationsSimulator",
);
const LiquidationsLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/LiquidationsLiveBridge"),
  "LiquidationsLiveBridge",
);
const RiskManagementSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/RiskManagementSimulator"),
  "RiskManagementSimulator",
);
const RiskManagementLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/RiskManagementLiveBridge"),
  "RiskManagementLiveBridge",
);
const SlippageSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/SlippageSimulator"),
  "SlippageSimulator",
);
const SlippageLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/SlippageLiveBridge"),
  "SlippageLiveBridge",
);
const ExecutionSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/ExecutionSimulator"),
  "ExecutionSimulator",
);
const ExecutionLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/ExecutionLiveBridge"),
  "ExecutionLiveBridge",
);
const FirstTradeSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/FirstTradeSimulator"),
  "FirstTradeSimulator",
);
const FirstTradeLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/FirstTradeLiveBridge"),
  "FirstTradeLiveBridge",
);
const MarketStructureSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/MarketStructureSimulator"),
  "MarketStructureSimulator",
);
const MarketStructureLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/MarketStructureLiveBridge"),
  "MarketStructureLiveBridge",
);
const LiquidityDeepSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/LiquidityDeepSimulator"),
  "LiquidityDeepSimulator",
);
const LiquidityDeepLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/LiquidityDeepLiveBridge"),
  "LiquidityDeepLiveBridge",
);
const CrossMarketSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/CrossMarketSimulator"),
  "CrossMarketSimulator",
);
const CrossMarketLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/CrossMarketLiveBridge"),
  "CrossMarketLiveBridge",
);
const MacroFlowsSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/MacroFlowsSimulator"),
  "MacroFlowsSimulator",
);
const MacroFlowsLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/MacroFlowsLiveBridge"),
  "MacroFlowsLiveBridge",
);
const IntelligenceDeskSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/IntelligenceDeskSimulator"),
  "IntelligenceDeskSimulator",
);
const IntelligenceDeskLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/IntelligenceDeskLiveBridge"),
  "IntelligenceDeskLiveBridge",
);
const PortfolioRiskSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/PortfolioRiskSimulator"),
  "PortfolioRiskSimulator",
);
const PortfolioRiskLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/PortfolioRiskLiveBridge"),
  "PortfolioRiskLiveBridge",
);
const DailyOperationsSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/DailyOperationsSimulator"),
  "DailyOperationsSimulator",
);
const DailyOperationsLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/DailyOperationsLiveBridge"),
  "DailyOperationsLiveBridge",
);
const OperatorJournalSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/OperatorJournalSimulator"),
  "OperatorJournalSimulator",
);
const OperatorJournalLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/OperatorJournalLiveBridge"),
  "OperatorJournalLiveBridge",
);
const LiveDeskSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/LiveDeskSimulator"),
  "LiveDeskSimulator",
);
const LiveDeskLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/LiveDeskLiveBridge"),
  "LiveDeskLiveBridge",
);
const MarketStateSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/MarketStateSimulator"),
  "MarketStateSimulator",
);
const MarketStateLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/MarketStateLiveBridge"),
  "MarketStateLiveBridge",
);
const DailyBriefingSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/DailyBriefingSimulator"),
  "DailyBriefingSimulator",
);
const DailyBriefingLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/DailyBriefingLiveBridge"),
  "DailyBriefingLiveBridge",
);
const MarketMemorySimulator = lazyAcademy(
  () => import("@/components/terminal/explain/MarketMemorySimulator"),
  "MarketMemorySimulator",
);
const MarketMemoryLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/MarketMemoryLiveBridge"),
  "MarketMemoryLiveBridge",
);
const CryptoFinancialOsSimulator = lazyAcademy(
  () => import("@/components/terminal/explain/CryptoFinancialOsSimulator"),
  "CryptoFinancialOsSimulator",
);
const CryptoFinancialOsLiveBridge = lazyAcademy(
  () => import("@/components/terminal/explain/CryptoFinancialOsLiveBridge"),
  "CryptoFinancialOsLiveBridge",
);

function AcademyPair({
  simActive,
  bridgeActive,
  Sim,
  Bridge,
}: {
  simActive: boolean;
  bridgeActive: boolean;
  Sim: ComponentType;
  Bridge: ComponentType;
}) {
  if (!simActive && !bridgeActive) return null;
  return (
    <>
      {simActive ? <Sim /> : null}
      {bridgeActive ? <Bridge /> : null}
    </>
  );
}

/** Mount academy overlays only while a lesson or bridge session is active. */
export function AcademyOverlayHost() {
  const orderBookActive = useOrderBookLessonStore((s) => s.active);
  const lessonBridgeActive = useLessonBridgeStore((s) => s.active);

  const mmSim = useMarketMechanicsStore((s) => s.active);
  const mmBridge = useMarketMechanicsBridgeStore((s) => s.active);
  const fundingSim = useFundingCrowdingStore((s) => s.active);
  const fundingBridge = useFundingBridgeStore((s) => s.active);
  const tradeTypesSim = useTradeTypesStore((s) => s.active);
  const tradeTypesBridge = useTradeTypesBridgeStore((s) => s.active);
  const liqSim = useLiquidationsStore((s) => s.active);
  const liqBridge = useLiquidationsBridgeStore((s) => s.active);
  const riskSim = useRiskManagementStore((s) => s.active);
  const riskBridge = useRiskManagementBridgeStore((s) => s.active);
  const slipSim = useSlippageStore((s) => s.active);
  const slipBridge = useSlippageBridgeStore((s) => s.active);
  const execSim = useExecutionLessonStore((s) => s.active);
  const execBridge = useExecutionLessonBridgeStore((s) => s.active);
  const firstTradeSim = useFirstTradeLessonStore((s) => s.active);
  const firstTradeBridge = useFirstTradeBridgeStore((s) => s.active);
  const mktStructSim = useMarketStructureLessonStore((s) => s.active);
  const mktStructBridge = useMarketStructureBridgeStore((s) => s.active);
  const liqDeepSim = useLiquidityDeepLessonStore((s) => s.active);
  const liqDeepBridge = useLiquidityDeepBridgeStore((s) => s.active);
  const crossMktSim = useCrossMarketLessonStore((s) => s.active);
  const crossMktBridge = useCrossMarketBridgeStore((s) => s.active);
  const macroSim = useMacroFlowsLessonStore((s) => s.active);
  const macroBridge = useMacroFlowsBridgeStore((s) => s.active);
  const intelDeskSim = useIntelligenceDeskLessonStore((s) => s.active);
  const intelDeskBridge = useIntelligenceDeskBridgeStore((s) => s.active);
  const portRiskSim = usePortfolioRiskStore((s) => s.active);
  const portRiskBridge = usePortfolioRiskBridgeStore((s) => s.active);
  const dailyOpsSim = useDailyOperationsLessonStore((s) => s.active);
  const dailyOpsBridge = useDailyOperationsBridgeStore((s) => s.active);
  const opJournalSim = useOperatorJournalLessonStore((s) => s.active);
  const opJournalBridge = useOperatorJournalBridgeStore((s) => s.active);
  const liveDeskSim = useLiveDeskLessonStore((s) => s.active);
  const liveDeskBridge = useLiveDeskBridgeStore((s) => s.active);
  const mktStateSim = useMarketStateLessonStore((s) => s.active);
  const mktStateBridge = useMarketStateBridgeStore((s) => s.active);
  const dailyBriefSim = useDailyBriefingLessonStore((s) => s.active);
  const dailyBriefBridge = useDailyBriefingBridgeStore((s) => s.active);
  const mktMemSim = useMarketMemoryLessonStore((s) => s.active);
  const mktMemBridge = useMarketMemoryBridgeStore((s) => s.active);
  const cfoSim = useCryptoFinancialOsLessonStore((s) => s.active);
  const cfoBridge = useCryptoFinancialOsBridgeStore((s) => s.active);

  return (
    <>
      {orderBookActive ? <CinematicOrderBookLesson /> : null}
      {lessonBridgeActive ? <LessonLiveBridge /> : null}

      <AcademyPair simActive={mmSim} bridgeActive={mmBridge} Sim={MarketMechanicsSimulator} Bridge={MarketMechanicsLiveBridge} />
      <AcademyPair simActive={fundingSim} bridgeActive={fundingBridge} Sim={FundingCrowdingSimulator} Bridge={FundingLiveBridge} />
      <AcademyPair simActive={tradeTypesSim} bridgeActive={tradeTypesBridge} Sim={TradeTypesSimulator} Bridge={TradeTypesLiveBridge} />
      <AcademyPair simActive={liqSim} bridgeActive={liqBridge} Sim={LiquidationsSimulator} Bridge={LiquidationsLiveBridge} />
      <AcademyPair simActive={riskSim} bridgeActive={riskBridge} Sim={RiskManagementSimulator} Bridge={RiskManagementLiveBridge} />
      <AcademyPair simActive={slipSim} bridgeActive={slipBridge} Sim={SlippageSimulator} Bridge={SlippageLiveBridge} />
      <AcademyPair simActive={execSim} bridgeActive={execBridge} Sim={ExecutionSimulator} Bridge={ExecutionLiveBridge} />
      <AcademyPair simActive={firstTradeSim} bridgeActive={firstTradeBridge} Sim={FirstTradeSimulator} Bridge={FirstTradeLiveBridge} />
      <AcademyPair simActive={mktStructSim} bridgeActive={mktStructBridge} Sim={MarketStructureSimulator} Bridge={MarketStructureLiveBridge} />
      <AcademyPair simActive={liqDeepSim} bridgeActive={liqDeepBridge} Sim={LiquidityDeepSimulator} Bridge={LiquidityDeepLiveBridge} />
      <AcademyPair simActive={crossMktSim} bridgeActive={crossMktBridge} Sim={CrossMarketSimulator} Bridge={CrossMarketLiveBridge} />
      <AcademyPair simActive={macroSim} bridgeActive={macroBridge} Sim={MacroFlowsSimulator} Bridge={MacroFlowsLiveBridge} />
      <AcademyPair simActive={intelDeskSim} bridgeActive={intelDeskBridge} Sim={IntelligenceDeskSimulator} Bridge={IntelligenceDeskLiveBridge} />
      <AcademyPair simActive={portRiskSim} bridgeActive={portRiskBridge} Sim={PortfolioRiskSimulator} Bridge={PortfolioRiskLiveBridge} />
      <AcademyPair simActive={dailyOpsSim} bridgeActive={dailyOpsBridge} Sim={DailyOperationsSimulator} Bridge={DailyOperationsLiveBridge} />
      <AcademyPair simActive={opJournalSim} bridgeActive={opJournalBridge} Sim={OperatorJournalSimulator} Bridge={OperatorJournalLiveBridge} />
      <AcademyPair simActive={liveDeskSim} bridgeActive={liveDeskBridge} Sim={LiveDeskSimulator} Bridge={LiveDeskLiveBridge} />
      <AcademyPair simActive={mktStateSim} bridgeActive={mktStateBridge} Sim={MarketStateSimulator} Bridge={MarketStateLiveBridge} />
      <AcademyPair simActive={dailyBriefSim} bridgeActive={dailyBriefBridge} Sim={DailyBriefingSimulator} Bridge={DailyBriefingLiveBridge} />
      <AcademyPair simActive={mktMemSim} bridgeActive={mktMemBridge} Sim={MarketMemorySimulator} Bridge={MarketMemoryLiveBridge} />
      <AcademyPair simActive={cfoSim} bridgeActive={cfoBridge} Sim={CryptoFinancialOsSimulator} Bridge={CryptoFinancialOsLiveBridge} />
    </>
  );
}
