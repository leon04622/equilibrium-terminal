"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { ChartWidget } from "@/components/terminal/ChartWidget";
import { TradeTicket } from "@/components/terminal/TradeTicket";
import { PositionsTable } from "@/components/terminal/PositionsTable";
import { PanelLoadingState } from "@/components/terminal/PanelLoadingState";
import { HyperBook } from "@/components/terminal/widgets/HyperBook";
import { TacticalIntelligenceWire } from "@/components/terminal/widgets/TacticalIntelligenceWire";
import { DomLadder } from "@/components/terminal/widgets/DomLadder";
import { SlippageRadar } from "@/components/terminal/widgets/SlippageRadar";
import { AlertPanel } from "@/components/terminal/widgets/AlertPanel";
import { MarketSurveillanceMonitor } from "@/components/terminal/widgets/MarketSurveillanceMonitor";
import { InformationDistributionConsole } from "@/components/terminal/widgets/InformationDistributionConsole";
import { OperatorModeConsole } from "@/components/terminal/widgets/OperatorModeConsole";
import { DailyBriefingConsole } from "@/components/terminal/widgets/DailyBriefingConsole";
import { MarketStateLayerConsole } from "@/components/terminal/widgets/MarketStateLayerConsole";
import { DailyOperatingConsole } from "@/components/terminal/widgets/DailyOperatingConsole";
import { OperatorJournalConsole } from "@/components/terminal/widgets/OperatorJournalConsole";
import { PaperBlotterConsole } from "@/components/terminal/widgets/PaperBlotterConsole";
import { LiveBlotterConsole } from "@/components/terminal/widgets/LiveBlotterConsole";
import { SettlementLedgerConsole } from "@/components/terminal/widgets/SettlementLedgerConsole";
import type { WidgetType } from "@/types/terminal-schema";

const panelLoading = () => <PanelLoadingState label="LOADING" />;

function lazyNamed<T extends ComponentType<object>>(
  loader: () => Promise<Record<string, T>>,
  name: string,
) {
  return dynamic(() => loader().then((mod) => ({ default: mod[name] })), {
    ssr: false,
    loading: panelLoading,
  });
}

const LazyMacroMatrix = lazyNamed(() => import("@/components/terminal/widgets/MacroMatrix"), "MacroMatrix");
const LazyAiCopilot = lazyNamed(() => import("@/components/terminal/AiCopilot"), "AiCopilot");
const LazyProactiveMonitor = lazyNamed(
  () => import("@/components/terminal/widgets/ProactiveMonitor"),
  "ProactiveMonitor",
);
const LazyTeamDeskGrid = lazyNamed(() => import("@/components/terminal/widgets/TeamDeskGrid"), "TeamDeskGrid");
const LazyDiagnosticsDashboard = lazyNamed(
  () => import("@/components/terminal/widgets/DiagnosticsDashboard"),
  "DiagnosticsDashboard",
);
const LazyAlphaLabConsole = lazyNamed(
  () => import("@/components/terminal/widgets/AlphaLabConsole"),
  "AlphaLabConsole",
);
const LazyInfraDiagnostics = lazyNamed(
  () => import("@/components/terminal/widgets/InfraDiagnostics"),
  "InfraDiagnostics",
);
const LazyDecisionCommandCenter = lazyNamed(
  () => import("@/components/terminal/widgets/DecisionCommandCenter"),
  "DecisionCommandCenter",
);
const LazyKnowledgeGraphConsole = lazyNamed(
  () => import("@/components/terminal/widgets/KnowledgeGraphConsole"),
  "KnowledgeGraphConsole",
);
const LazyTraderJournalPanel = lazyNamed(
  () => import("@/components/terminal/widgets/TraderJournalPanel"),
  "TraderJournalPanel",
);
const LazyResearchWorkspacePanel = lazyNamed(
  () => import("@/components/terminal/widgets/ResearchWorkspacePanel"),
  "ResearchWorkspacePanel",
);
const LazyMarketCoverageConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketCoverageConsole"),
  "MarketCoverageConsole",
);
const LazyReliabilityConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ReliabilityConsole"),
  "ReliabilityConsole",
);
const LazyInstitutionalScreenerConsole = lazyNamed(
  () => import("@/components/terminal/widgets/InstitutionalScreenerConsole"),
  "InstitutionalScreenerConsole",
);
const LazyTradeSurveillanceConsole = lazyNamed(
  () => import("@/components/terminal/widgets/TradeSurveillanceConsole"),
  "TradeSurveillanceConsole",
);
const LazyInstrumentMasterConsole = lazyNamed(
  () => import("@/components/terminal/widgets/InstrumentMasterConsole"),
  "InstrumentMasterConsole",
);
const LazyCrossVenueQuotesConsole = lazyNamed(
  () => import("@/components/terminal/widgets/CrossVenueQuotesConsole"),
  "CrossVenueQuotesConsole",
);
const LazyDataIngestionConsole = lazyNamed(
  () => import("@/components/terminal/widgets/DataIngestionConsole"),
  "DataIngestionConsole",
);
const LazyMarketIntelligenceConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketIntelligenceConsole"),
  "MarketIntelligenceConsole",
);
const LazyCollaborationConsole = lazyNamed(
  () => import("@/components/terminal/widgets/CollaborationConsole"),
  "CollaborationConsole",
);
const LazyEnterpriseOperationsConsole = lazyNamed(
  () => import("@/components/terminal/widgets/EnterpriseOperationsConsole"),
  "EnterpriseOperationsConsole",
);
const LazyIndustryIntegrationsConsole = lazyNamed(
  () => import("@/components/terminal/widgets/IndustryIntegrationsConsole"),
  "IndustryIntegrationsConsole",
);
const LazyProprietaryIntelligenceConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ProprietaryIntelligenceConsole"),
  "ProprietaryIntelligenceConsole",
);
const LazyCryptoEcosystemConsole = lazyNamed(
  () => import("@/components/terminal/widgets/CryptoEcosystemConsole"),
  "CryptoEcosystemConsole",
);
const LazyGlobalStrategyConsole = lazyNamed(
  () => import("@/components/terminal/widgets/GlobalStrategyConsole"),
  "GlobalStrategyConsole",
);
const LazyCommercialProductConsole = lazyNamed(
  () => import("@/components/terminal/widgets/CommercialProductConsole"),
  "CommercialProductConsole",
);
const LazyExecutionIntelligenceConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ExecutionIntelligenceConsole"),
  "ExecutionIntelligenceConsole",
);
const LazyPortfolioDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/PortfolioDeskConsole"),
  "PortfolioDeskConsole",
);
const LazyDerivativesDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/DerivativesDeskConsole"),
  "DerivativesDeskConsole",
);
const LazySystemicIntelligenceConsole = lazyNamed(
  () => import("@/components/terminal/widgets/SystemicIntelligenceConsole"),
  "SystemicIntelligenceConsole",
);
const LazyMarketMemoryConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketMemoryConsole"),
  "MarketMemoryConsole",
);
const LazyResearchDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ResearchDeskConsole"),
  "ResearchDeskConsole",
);
const LazyPlatformDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/PlatformDeskConsole"),
  "PlatformDeskConsole",
);
const LazyMobileDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MobileDeskConsole"),
  "MobileDeskConsole",
);
const LazyOpsCommandConsole = lazyNamed(
  () => import("@/components/terminal/widgets/OpsCommandConsole"),
  "OpsCommandConsole",
);
const LazyBillingDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/BillingDeskConsole"),
  "BillingDeskConsole",
);
const LazyDeskOpsConsole = lazyNamed(
  () => import("@/components/terminal/widgets/DeskOpsConsole"),
  "DeskOpsConsole",
);
const LazyGlobalIntelConsole = lazyNamed(
  () => import("@/components/terminal/widgets/GlobalIntelConsole"),
  "GlobalIntelConsole",
);
const LazyOperatorAiConsole = lazyNamed(
  () => import("@/components/terminal/widgets/OperatorAiConsole"),
  "OperatorAiConsole",
);
const LazyUnifiedOpsConsole = lazyNamed(
  () => import("@/components/terminal/widgets/UnifiedOpsConsole"),
  "UnifiedOpsConsole",
);
const LazyLiveExecConsole = lazyNamed(
  () => import("@/components/terminal/widgets/LiveExecConsole"),
  "LiveExecConsole",
);
const LazyMarketCommandConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketCommandConsole"),
  "MarketCommandConsole",
);
const LazyProductMaturityConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ProductMaturityConsole"),
  "ProductMaturityConsole",
);
const LazyLiveDeploymentConsole = lazyNamed(
  () => import("@/components/terminal/widgets/LiveDeploymentConsole"),
  "LiveDeploymentConsole",
);
const LazyExplainDeskConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ExplainDeskConsole"),
  "ExplainDeskConsole",
);
const LazyLiveMentorConsole = lazyNamed(
  () => import("@/components/terminal/widgets/LiveMentorConsole"),
  "LiveMentorConsole",
);

export { TradeTicket, PositionsTable };

const WIDGET_BY_TYPE: Record<WidgetType, ComponentType> = {
  hyperbook: HyperBook,
  chart: ChartWidget,
  intelligence: TacticalIntelligenceWire,
  domladder: DomLadder,
  slippageradar: SlippageRadar,
  alerts: AlertPanel,
  surveillance: MarketSurveillanceMonitor,
  newswire: InformationDistributionConsole,
  operatormode: OperatorModeConsole,
  dailybriefing: DailyBriefingConsole,
  marketstate: MarketStateLayerConsole,
  dailyops: DailyOperatingConsole,
  operatorjournal: OperatorJournalConsole,
  paperblotter: PaperBlotterConsole,
  liveblotter: LiveBlotterConsole,
  settlementledger: SettlementLedgerConsole,
  macro: LazyMacroMatrix,
  copilot: LazyAiCopilot,
  proactive: LazyProactiveMonitor,
  teamdesk: LazyTeamDeskGrid,
  diagnostics: LazyDiagnosticsDashboard,
  alphalab: LazyAlphaLabConsole,
  infra: LazyInfraDiagnostics,
  decision: LazyDecisionCommandCenter,
  knowledgegraph: LazyKnowledgeGraphConsole,
  traderjournal: LazyTraderJournalPanel,
  research: LazyResearchWorkspacePanel,
  marketcoverage: LazyMarketCoverageConsole,
  reliability: LazyReliabilityConsole,
  screener: LazyInstitutionalScreenerConsole,
  tradesurveillance: LazyTradeSurveillanceConsole,
  instrumentmaster: LazyInstrumentMasterConsole,
  crossvenue: LazyCrossVenueQuotesConsole,
  ingestion: LazyDataIngestionConsole,
  intelengine: LazyMarketIntelligenceConsole,
  collab: LazyCollaborationConsole,
  enterpriseops: LazyEnterpriseOperationsConsole,
  integrations: LazyIndustryIntegrationsConsole,
  propintel: LazyProprietaryIntelligenceConsole,
  ecosystem: LazyCryptoEcosystemConsole,
  globalstrategy: LazyGlobalStrategyConsole,
  commercial: LazyCommercialProductConsole,
  execintel: LazyExecutionIntelligenceConsole,
  portfoliodesk: LazyPortfolioDeskConsole,
  derivdesk: LazyDerivativesDeskConsole,
  systemicintel: LazySystemicIntelligenceConsole,
  memorydesk: LazyMarketMemoryConsole,
  researchdesk: LazyResearchDeskConsole,
  platformdesk: LazyPlatformDeskConsole,
  mobiledesk: LazyMobileDeskConsole,
  opscommand: LazyOpsCommandConsole,
  billingdesk: LazyBillingDeskConsole,
  deskops: LazyDeskOpsConsole,
  globaldesk: LazyGlobalIntelConsole,
  operatordesk: LazyOperatorAiConsole,
  unifiedops: LazyUnifiedOpsConsole,
  liveexec: LazyLiveExecConsole,
  marketcmd: LazyMarketCommandConsole,
  maturitydesk: LazyProductMaturityConsole,
  livedeploy: LazyLiveDeploymentConsole,
  explaindesk: LazyExplainDeskConsole,
  livementor: LazyLiveMentorConsole,
};

export function WidgetByType({ type }: { type: WidgetType }) {
  const Widget = WIDGET_BY_TYPE[type];
  return Widget ? <Widget /> : null;
}
