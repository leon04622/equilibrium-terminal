"use client";

import { useEffect } from "react";
import type { Layout } from "react-grid-layout";
import { useBootPhase } from "@/hooks/useBootGuard";
import { useExecutionAnalytics } from "@/hooks/useExecutionAnalytics";
import { usePortfolioDesk } from "@/hooks/usePortfolioDesk";
import { useDerivativesDesk } from "@/hooks/useDerivativesDesk";
import { useSystemicIntelligence } from "@/hooks/useSystemicIntelligence";
import { useMarketMemory } from "@/hooks/useMarketMemory";
import { useResearchDesk } from "@/hooks/useResearchDesk";
import { usePlatformDesk } from "@/hooks/usePlatformDesk";
import { useMobileDesk } from "@/hooks/useMobileDesk";
import { useOpsCommand } from "@/hooks/useOpsCommand";
import { useBillingDesk } from "@/hooks/useBillingDesk";
import { useDeskOps } from "@/hooks/useDeskOps";
import { useGlobalIntel } from "@/hooks/useGlobalIntel";
import { useOperatorAi } from "@/hooks/useOperatorAi";
import { useUnifiedOps } from "@/hooks/useUnifiedOps";
import { useLiveExec } from "@/hooks/useLiveExec";
import { useMarketCommand } from "@/hooks/useMarketCommand";
import { useProductMaturity } from "@/hooks/useProductMaturity";
import { useLiveDeployment } from "@/hooks/useLiveDeployment";
import { useOperatorGuide } from "@/hooks/useOperatorGuide";
import { useOperatorJournal } from "@/hooks/useOperatorJournal";
import { useLiveCoach } from "@/hooks/useLiveCoach";
import { useExecutionIntelligence } from "@/hooks/useExecutionIntelligence";
import { useProductionPlatform } from "@/hooks/useProductionPlatform";
import { useQuantResearch } from "@/hooks/useQuantResearch";
import { useAdaptiveWorkspace } from "@/hooks/useAdaptiveWorkspace";
import { useDecisionEngine } from "@/hooks/useDecisionEngine";
import { useInformationDiscovery } from "@/hooks/useInformationDiscovery";
import { useMarketKnowledgeGraph } from "@/hooks/useMarketKnowledgeGraph";
import { useTraderTelemetry } from "@/hooks/useTraderTelemetry";
import { useTraderWorkflow } from "@/hooks/useTraderWorkflow";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useDailyOperations } from "@/hooks/useDailyOperations";
import { useMarketCoverage } from "@/hooks/useMarketCoverage";
import { useReliabilityInfrastructure } from "@/hooks/useReliabilityInfrastructure";
import { useInformationDistribution } from "@/hooks/useInformationDistribution";
import { useExternalNewsFeed } from "@/hooks/useExternalNewsFeed";
import { useLiveBlotter } from "@/hooks/useLiveBlotter";
import { useSettlementLedger } from "@/hooks/useSettlementLedger";
import { useMarketScreener } from "@/hooks/useMarketScreener";
import { useMarketScreenerAlerts } from "@/hooks/useMarketScreenerAlerts";
import { useTradeSurveillanceAlerts } from "@/hooks/useTradeSurveillanceAlerts";
import { usePortfolioRiskAlerts } from "@/hooks/usePortfolioRiskAlerts";
import { useInstrumentMaster } from "@/hooks/useInstrumentMaster";
import { useWireSymbolRouting } from "@/hooks/useWireSymbolRouting";
import { useOperatorBookSensors } from "@/hooks/useOperatorBookSensors";
import { useDataIngestion } from "@/hooks/useDataIngestion";
import { useMarketIntelligence } from "@/hooks/useMarketIntelligence";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useEnterpriseOperations } from "@/hooks/useEnterpriseOperations";
import { useIndustryIntegrations } from "@/hooks/useIndustryIntegrations";
import { useProprietaryIntelligence } from "@/hooks/useProprietaryIntelligence";
import { useCryptoEcosystem } from "@/hooks/useCryptoEcosystem";
import { useGlobalStrategy } from "@/hooks/useGlobalStrategy";
import { useChartAnalytics } from "@/hooks/useChartAnalytics";
import { useCommercialProduct } from "@/hooks/useCommercialProduct";
import { useAlphaLaunch } from "@/hooks/useAlphaLaunch";
import { useLaunchHardening } from "@/hooks/useLaunchHardening";
import { useDevOpsOperations } from "@/hooks/useDevOpsOperations";
import { useSecurityLayer } from "@/hooks/useSecurityLayer";
import { useTerminalExperience } from "@/hooks/useTerminalExperience";
import { panelHookEnabled } from "@/lib/wedge/panelHookGating";
import { AssetWorkspaceOrchestrator } from "@/lib/workflow/AssetWorkspaceOrchestrator";
import { terminalBus } from "@/store/eventBus";

function WorkspaceSystemsCore({
  layout,
  deskFocusMode,
  phase,
  onAdaptiveLayout,
}: {
  layout: Layout[];
  deskFocusMode: boolean;
  phase: number;
  onAdaptiveLayout: (next: Layout[]) => void;
}) {
  const hook = (panelIds: string | string[]) =>
    phase >= 1 && panelHookEnabled(layout, deskFocusMode, panelIds);

  useProductionPlatform({ layout, enabled: phase >= 0 });
  useSecurityLayer(phase >= 0);
  useTerminalExperience(phase >= 0);
  useGlobalShortcuts(phase >= 0);
  useCommercialProduct(phase >= 0);
  useTraderWorkflow(phase >= 0);
  useOperatorGuide(phase >= 0);
  useOperatorBookSensors(phase >= 0 && panelHookEnabled(layout, deskFocusMode, "hyperbook"));
  useAdaptiveWorkspace({
    baseLayout: layout,
    onLayoutCommit: onAdaptiveLayout,
  });
  useTraderTelemetry({
    baseLayout: layout,
    onAdaptiveLayout,
    autoApplyLayout: false,
  });

  useExecutionIntelligence({
    enabled: hook(["domladder", "slippageradar", "execintel", "surveillance"]),
  });
  useExecutionAnalytics(hook(["slippageradar", "execintel"]));
  useChartAnalytics(hook("chart"));
  useInformationDiscovery(hook("intelligence"));
  useInformationDistribution(hook("newswire"));
  useExternalNewsFeed(hook("newswire"));
  useDailyOperations(hook("dailyops"));
  useLiveBlotter(hook(["liveblotter", "paperblotter"]));
  useLiveExec(hook(["liveexec", "liveblotter"]));
  useOperatorJournal(hook("operatorjournal"));
  usePortfolioRiskAlerts(hook(["positions", "portfoliodesk"]));
  useTradeSurveillanceAlerts(hook(["surveillance", "tradesurveillance"]));
  useMarketScreener(hook("screener"));
  useMarketScreenerAlerts(hook("screener"));
  useSettlementLedger(hook("settlementledger"));
  useInstrumentMaster(hook("instrumentmaster"));
  useWireSymbolRouting(hook(["intelligence", "newswire"]));
  useReliabilityInfrastructure(hook("reliability"));
  useQuantResearch(hook(["alphalab", "research"]));
  useDecisionEngine({ enabled: hook("decision") });
  useMarketKnowledgeGraph(hook("knowledgegraph"));
  useMarketCoverage(hook("marketcoverage"));
  useDataIngestion(hook("ingestion"));
  useMarketIntelligence(hook("intelengine"));
  useCollaboration(hook("collab"), layout);
  useLaunchHardening(hook(["infra", "diagnostics"]));
  useAlphaLaunch(hook("commercial"));
  useDevOpsOperations(hook(["infra", "diagnostics"]));

  usePortfolioDesk(hook("portfoliodesk"));
  useDerivativesDesk(hook("derivdesk"));
  useSystemicIntelligence(hook("systemicintel"));
  useMarketMemory(hook("memorydesk"));
  useResearchDesk(hook("researchdesk"));
  usePlatformDesk(hook("platformdesk"));
  useMobileDesk(hook("mobiledesk"));
  useOpsCommand(hook("opscommand"));
  useBillingDesk(hook("billingdesk"));
  useDeskOps(hook("deskops"));
  useGlobalIntel(hook("globaldesk"));
  useOperatorAi(hook("operatordesk"));
  useUnifiedOps(hook("unifiedops"));
  useMarketCommand(hook("marketcmd"));
  useProductMaturity(hook("maturitydesk"));
  useLiveDeployment(hook("livedeploy"));
  useLiveCoach(hook("livementor"));
  useEnterpriseOperations(hook("enterpriseops"));
  useIndustryIntegrations(hook("integrations"));
  useProprietaryIntelligence(hook("propintel"));
  useCryptoEcosystem(hook("ecosystem"));
  useGlobalStrategy(hook("globalstrategy"));

  useEffect(() => {
    if (phase < 0) return;
    const offAgentic = terminalBus.on("agentic:workspace-load", ({ coin }) => {
      AssetWorkspaceOrchestrator.open(coin, { mode: "surveillance", source: "proactive-monitor" });
    });
    return offAgentic;
  }, [phase]);

  return null;
}

/** Background systems — phased and layout-gated to avoid OOM on full workspace. */
export function WorkspaceSystems({
  layout,
  deskFocusMode,
  onAdaptiveLayout,
}: {
  layout: Layout[];
  deskFocusMode: boolean;
  onAdaptiveLayout: (next: Layout[]) => void;
}) {
  const phase = useBootPhase(200, 600);

  if (phase < 0) return null;

  return (
    <WorkspaceSystemsCore
      layout={layout}
      deskFocusMode={deskFocusMode}
      phase={phase}
      onAdaptiveLayout={onAdaptiveLayout}
    />
  );
}
