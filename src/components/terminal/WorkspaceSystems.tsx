"use client";

import type { Layout } from "react-grid-layout";
import { useBootGuard } from "@/hooks/useBootGuard";
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
import { useWedgeStore } from "@/store/useWedgeStore";

function WorkspaceSystemsCore({
  layout,
  onAdaptiveLayout,
}: {
  layout: Layout[];
  onAdaptiveLayout: (next: Layout[]) => void;
}) {
  const deskFocus = useWedgeStore((s) => s.deskFocusMode);
  const advanced = !deskFocus;

  useProductionPlatform({ layout, enabled: true });
  useExecutionIntelligence({ enabled: true });
  useExecutionAnalytics(true);
  useLiveExec(true);
  useMarketCommand(true);
  useProductMaturity(true);
  useLiveDeployment(true);
  useOperatorGuide(true);
  useOperatorJournal(true);
  useLiveCoach(true);
  usePortfolioDesk(true);
  useDerivativesDesk(true);
  useSystemicIntelligence(true);
  useMarketMemory(true);
  useResearchDesk(true);
  usePlatformDesk(true);
  useMobileDesk(true);
  useOpsCommand(true);
  useBillingDesk(true);
  useTraderTelemetry({
    baseLayout: layout,
    onAdaptiveLayout,
    autoApplyLayout: false,
  });
  useAdaptiveWorkspace({
    baseLayout: layout,
    onLayoutCommit: onAdaptiveLayout,
  });
  useInformationDiscovery(true);
  useTraderWorkflow(true);
  useGlobalShortcuts(true);
  useReliabilityInfrastructure(true);
  useSecurityLayer(true);
  useDevOpsOperations(true);
  useCommercialProduct(true);
  useLaunchHardening(true);
  useAlphaLaunch(true);
  useTerminalExperience(true);
  useChartAnalytics(true);
  useQuantResearch(advanced);
  useDecisionEngine({ enabled: advanced });
  useMarketKnowledgeGraph(advanced);
  useDailyOperations(advanced);
  useMarketCoverage(advanced);
  useInformationDistribution(advanced);
  useDataIngestion(advanced);
  useMarketIntelligence(advanced);
  useCollaboration(advanced, layout);
  useDeskOps(advanced);
  useGlobalIntel(advanced);
  useOperatorAi(advanced);
  useUnifiedOps(advanced);
  useEnterpriseOperations(advanced);
  useIndustryIntegrations(advanced);
  useProprietaryIntelligence(advanced);
  useCryptoEcosystem(advanced);
  useGlobalStrategy(advanced);
  return null;
}

/** Background systems — deferred so the workspace grid paints first. */
export function WorkspaceSystems({
  layout,
  onAdaptiveLayout,
}: {
  layout: Layout[];
  onAdaptiveLayout: (next: Layout[]) => void;
}) {
  const systemsReady = useBootGuard(600);

  if (!systemsReady) return null;

  return (
    <WorkspaceSystemsCore layout={layout} onAdaptiveLayout={onAdaptiveLayout} />
  );
}
