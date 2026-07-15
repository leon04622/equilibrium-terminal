"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { PanelLoadingState } from "@/components/terminal/PanelLoadingState";
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

const LazyHyperBook = lazyNamed(() => import("@/components/terminal/widgets/HyperBook"), "HyperBook");
const LazyChartWidget = lazyNamed(() => import("@/components/terminal/ChartWidget"), "ChartWidget");
const LazyTacticalIntelligenceWire = lazyNamed(
  () => import("@/components/terminal/widgets/TacticalIntelligenceWire"),
  "TacticalIntelligenceWire",
);
const LazyMacroMatrix = lazyNamed(() => import("@/components/terminal/widgets/MacroMatrix"), "MacroMatrix");
const LazyAiCopilot = lazyNamed(() => import("@/components/terminal/AiCopilot"), "AiCopilot");
const LazyAlertPanel = lazyNamed(() => import("@/components/terminal/widgets/AlertPanel"), "AlertPanel");
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
const LazyDomLadder = lazyNamed(() => import("@/components/terminal/widgets/DomLadder"), "DomLadder");
const LazySlippageRadar = lazyNamed(
  () => import("@/components/terminal/widgets/SlippageRadar"),
  "SlippageRadar",
);
const LazyDecisionCommandCenter = lazyNamed(
  () => import("@/components/terminal/widgets/DecisionCommandCenter"),
  "DecisionCommandCenter",
);
const LazyMarketSurveillanceMonitor = lazyNamed(
  () => import("@/components/terminal/widgets/MarketSurveillanceMonitor"),
  "MarketSurveillanceMonitor",
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
const LazyDailyOperatingConsole = lazyNamed(
  () => import("@/components/terminal/widgets/DailyOperatingConsole"),
  "DailyOperatingConsole",
);
const LazyMarketStateLayerConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketStateLayerConsole"),
  "MarketStateLayerConsole",
);
const LazyDailyBriefingConsole = lazyNamed(
  () => import("@/components/terminal/widgets/DailyBriefingConsole"),
  "DailyBriefingConsole",
);
const LazyMarketCoverageConsole = lazyNamed(
  () => import("@/components/terminal/widgets/MarketCoverageConsole"),
  "MarketCoverageConsole",
);
const LazyReliabilityConsole = lazyNamed(
  () => import("@/components/terminal/widgets/ReliabilityConsole"),
  "ReliabilityConsole",
);
const LazyInformationDistributionConsole = lazyNamed(
  () => import("@/components/terminal/widgets/InformationDistributionConsole"),
  "InformationDistributionConsole",
);
const LazyPaperBlotterConsole = lazyNamed(
  () => import("@/components/terminal/widgets/PaperBlotterConsole"),
  "PaperBlotterConsole",
);
const LazyLiveBlotterConsole = lazyNamed(
  () => import("@/components/terminal/widgets/LiveBlotterConsole"),
  "LiveBlotterConsole",
);
const LazySettlementLedgerConsole = lazyNamed(
  () => import("@/components/terminal/widgets/SettlementLedgerConsole"),
  "SettlementLedgerConsole",
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
const LazyOperatorJournalConsole = lazyNamed(
  () => import("@/components/terminal/widgets/OperatorJournalConsole"),
  "OperatorJournalConsole",
);
const LazyLiveMentorConsole = lazyNamed(
  () => import("@/components/terminal/widgets/LiveMentorConsole"),
  "LiveMentorConsole",
);
const LazyOperatorModeConsole = lazyNamed(
  () => import("@/components/terminal/widgets/OperatorModeConsole"),
  "OperatorModeConsole",
);

export const LazyTradeTicket = lazyNamed(() => import("@/components/terminal/TradeTicket"), "TradeTicket");
export const LazyPositionsTable = lazyNamed(
  () => import("@/components/terminal/PositionsTable"),
  "PositionsTable",
);

const WIDGET_BY_TYPE: Record<WidgetType, ComponentType> = {
  hyperbook: LazyHyperBook,
  chart: LazyChartWidget,
  intelligence: LazyTacticalIntelligenceWire,
  macro: LazyMacroMatrix,
  copilot: LazyAiCopilot,
  alerts: LazyAlertPanel,
  proactive: LazyProactiveMonitor,
  teamdesk: LazyTeamDeskGrid,
  diagnostics: LazyDiagnosticsDashboard,
  alphalab: LazyAlphaLabConsole,
  infra: LazyInfraDiagnostics,
  domladder: LazyDomLadder,
  slippageradar: LazySlippageRadar,
  decision: LazyDecisionCommandCenter,
  surveillance: LazyMarketSurveillanceMonitor,
  knowledgegraph: LazyKnowledgeGraphConsole,
  traderjournal: LazyTraderJournalPanel,
  research: LazyResearchWorkspacePanel,
  dailyops: LazyDailyOperatingConsole,
  marketstate: LazyMarketStateLayerConsole,
  dailybriefing: LazyDailyBriefingConsole,
  marketcoverage: LazyMarketCoverageConsole,
  reliability: LazyReliabilityConsole,
  newswire: LazyInformationDistributionConsole,
  paperblotter: LazyPaperBlotterConsole,
  liveblotter: LazyLiveBlotterConsole,
  settlementledger: LazySettlementLedgerConsole,
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
  operatorjournal: LazyOperatorJournalConsole,
  livementor: LazyLiveMentorConsole,
  operatormode: LazyOperatorModeConsole,
};

export function WidgetByType({ type }: { type: WidgetType }) {
  const Widget = WIDGET_BY_TYPE[type];
  return Widget ? <Widget /> : null;
}
