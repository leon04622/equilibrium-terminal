import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { DataQualityEngine } from "@/lib/hardening/DataQualityEngine";
import { IntegrationAuditEngine } from "@/lib/hardening/IntegrationAuditEngine";
import { LaunchReadinessEngine } from "@/lib/hardening/LaunchReadinessEngine";
import { PRE_LAUNCH_ENVIRONMENTS } from "@/lib/hardening/PreLaunchEnvironments";
import { WorkflowContinuityEngine } from "@/lib/hardening/WorkflowContinuityEngine";
import { SecurityOrchestrator } from "@/lib/security/SecurityOrchestrator";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { LaunchHardeningSnapshot } from "@/types/launch-hardening";

export class HardeningOrchestrator {
  static snapshot(): LaunchHardeningSnapshot {
    const integration = IntegrationAuditEngine.audit();
    const workflows = WorkflowContinuityEngine.evaluate();
    const dataQuality = DataQualityEngine.checks();
    const claims = useProductionConfigStore.getState().claims;
    const security = SecurityOrchestrator.snapshot(claims);
    const perf = usePerformanceStore.getState().vitals;
    const commercial = CommercialOrchestrator.snapshot();
    const experience = useTerminalExperienceStore.getState();

    const integrationScore = IntegrationAuditEngine.integrationScore(integration);
    const workflowScore = WorkflowContinuityEngine.workflowScore(workflows);
    const dataQualityScore = DataQualityEngine.score(dataQuality);

    const performanceScore = Math.round(
      Math.min(100, perf.fps * 1.4) * (perf.stressActive ? 0.85 : 1),
    );

    let uxCohesionScore = 82;
    if (!experience.reducedMotion) uxCohesionScore += 4;
    if (experience.calmMode) uxCohesionScore += 4;
    if (experience.density === "standard") uxCohesionScore += 2;
    uxCohesionScore = Math.min(100, uxCohesionScore);

    const gates = LaunchReadinessEngine.gates({
      integrationScore,
      workflowScore,
      dataQualityScore,
      securityScore: security.trustScore,
      performanceScore,
      commercialScore: commercial.marketReadinessScore,
      uxCohesionScore,
    });

    const launchReadinessScore = LaunchReadinessEngine.composite(gates);
    const blockers = LaunchReadinessEngine.blockers(gates);

    return {
      launchReadinessScore,
      integrationScore,
      workflowScore,
      dataQualityScore,
      securityScore: security.trustScore,
      performanceScore,
      uxCohesionScore,
      integration,
      workflows,
      dataQuality,
      gates,
      environments: PRE_LAUNCH_ENVIRONMENTS,
      blockers,
      launchApproved: LaunchReadinessEngine.approved(gates) && blockers.length === 0,
      updatedAt: Date.now(),
    };
  }
}
