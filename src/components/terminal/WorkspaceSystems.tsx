"use client";

import type { Layout } from "react-grid-layout";
import { useBootGuard } from "@/hooks/useBootGuard";
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
import { useTerminalExperience } from "@/hooks/useTerminalExperience";

function WorkspaceSystemsCore({
  layout,
  onAdaptiveLayout,
}: {
  layout: Layout[];
  onAdaptiveLayout: (next: Layout[]) => void;
}) {
  useProductionPlatform({ layout, enabled: true });
  useExecutionIntelligence({ enabled: true });
  useQuantResearch();
  useTraderTelemetry({
    baseLayout: layout,
    onAdaptiveLayout,
    autoApplyLayout: false,
  });
  useAdaptiveWorkspace({
    baseLayout: layout,
    onLayoutCommit: onAdaptiveLayout,
  });
  useDecisionEngine({ enabled: true });
  useInformationDiscovery(true);
  useMarketKnowledgeGraph(true);
  useTraderWorkflow(true);
  useGlobalShortcuts(true);
  useDailyOperations(true);
  useMarketCoverage(true);
  useReliabilityInfrastructure(true);
  useInformationDistribution(true);
  useDataIngestion(true);
  useMarketIntelligence(true);
  useCollaboration(true, layout);
  useEnterpriseOperations(true);
  useIndustryIntegrations(true);
  useProprietaryIntelligence(true);
  useCryptoEcosystem(true);
  useTerminalExperience(true);
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
