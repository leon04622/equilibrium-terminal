import { AlphaOrchestrator } from "@/lib/alpha/AlphaOrchestrator";
import { ControlledAlphaDeploymentEngine } from "@/lib/live-deployment/ControlledAlphaDeploymentEngine";
import { EnterpriseReadinessDeskEngine } from "@/lib/live-deployment/EnterpriseReadinessDeskEngine";
import { InstitutionalFeedbackEngine } from "@/lib/live-deployment/InstitutionalFeedbackEngine";
import { LIVE_DEPLOYMENT_DASHBOARD_MODES } from "@/lib/live-deployment/LiveDeploymentDashboardModes";
import { LiveDeploymentBriefEngine } from "@/lib/live-deployment/LiveDeploymentBriefEngine";
import { LiveDeploymentTelemetry } from "@/lib/live-deployment/LiveDeploymentTelemetry";
import { LiveInfrastructureValidationEngine } from "@/lib/live-deployment/LiveInfrastructureValidationEngine";
import { OperationalHardeningDeskEngine } from "@/lib/live-deployment/OperationalHardeningDeskEngine";
import { OperationalTelemetryDeskEngine } from "@/lib/live-deployment/OperationalTelemetryDeskEngine";
import { RetentionDependencyEngine } from "@/lib/live-deployment/RetentionDependencyEngine";
import { SupportIncidentOpsEngine } from "@/lib/live-deployment/SupportIncidentOpsEngine";
import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { LiveDeploymentModeId, LiveDeploymentSnapshot } from "@/types/live-deployment";

const MODE_STORAGE = "eq-live-deployment-mode-v1";

function readMode(): LiveDeploymentModeId {
  if (typeof window === "undefined") return "alpha_control";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && LIVE_DEPLOYMENT_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as LiveDeploymentModeId;
    }
  } catch {
    /* ignore */
  }
  return "alpha_control";
}

export class LiveDeploymentOrchestrator {
  static snapshot(): LiveDeploymentSnapshot {
    LiveDeploymentTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const alpha = AlphaOrchestrator.snapshot();
    const devops = DevOpsOperationsOrchestrator.snapshot();

    const alphaControls = ControlledAlphaDeploymentEngine.controls();
    const infraValidation = LiveInfrastructureValidationEngine.validate(asset);
    const telemetryRows = OperationalTelemetryDeskEngine.metrics();
    const retentionInsights = RetentionDependencyEngine.insights();
    const feedbackLoops = InstitutionalFeedbackEngine.loops();
    const hardening = OperationalHardeningDeskEngine.priorities();
    const supportOps = SupportIncidentOpsEngine.workflows();
    const enterpriseReadiness = EnterpriseReadinessDeskEngine.assets();

    const successMet = alpha.successIndicators.filter((s) => s.met).length;
    const telemetryMeta = LiveDeploymentTelemetry.snapshot({
      rolloutPct: alpha.rolloutPct,
      inviteValidated: alpha.inviteValidated,
      killSwitchActive: alpha.killSwitchActive,
      alphaScore: alpha.operationalScore,
      opsScore: devops.operationalScore,
      successMet,
      successTotal: alpha.successIndicators.length,
    });

    const partial = {
      telemetryMeta,
      successIndicators: alpha.successIndicators,
      iterationFocus: alpha.iterationFocus,
    };

    return {
      asset,
      alphaControls,
      infraValidation,
      telemetry: telemetryRows,
      retentionInsights,
      feedbackLoops,
      hardening,
      supportOps,
      enterpriseReadiness,
      successIndicators: alpha.successIndicators,
      deploymentBrief: LiveDeploymentBriefEngine.brief(partial),
      iterationFocus: alpha.iterationFocus,
      dashboardModes: LIVE_DEPLOYMENT_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetryMeta,
      deploymentScore: telemetryMeta.deploymentScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: LiveDeploymentModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
