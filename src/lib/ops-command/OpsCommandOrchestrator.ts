import { AdminDashboardEngine } from "@/lib/ops-command/AdminDashboardEngine";
import { BillingEntitlementOpsEngine } from "@/lib/ops-command/BillingEntitlementOpsEngine";
import { CustomerSupportOpsEngine } from "@/lib/ops-command/CustomerSupportOpsEngine";
import { FeatureFlagReleaseEngine } from "@/lib/ops-command/FeatureFlagReleaseEngine";
import { IncidentManagementEngine } from "@/lib/ops-command/IncidentManagementEngine";
import { OPS_COMMAND_DASHBOARD_MODES } from "@/lib/ops-command/OpsCommandDashboardModes";
import { OpsCommandBriefEngine } from "@/lib/ops-command/OpsCommandBriefEngine";
import { OpsCommandTelemetry } from "@/lib/ops-command/OpsCommandTelemetry";
import { OrgAdministrationEngine } from "@/lib/ops-command/OrgAdministrationEngine";
import { PlatformObservabilityCenterEngine } from "@/lib/ops-command/PlatformObservabilityCenterEngine";
import { ProductIntelligenceEngine } from "@/lib/ops-command/ProductIntelligenceEngine";
import { RuntimeControlEngine } from "@/lib/ops-command/RuntimeControlEngine";
import { SecurityAuditOpsEngine } from "@/lib/ops-command/SecurityAuditOpsEngine";
import type { OpsCommandModeId, OpsCommandSnapshot } from "@/types/ops-command";

const MODE_STORAGE = "eq-ops-command-mode-v1";

function readMode(): OpsCommandModeId {
  if (typeof window === "undefined") return "command_center";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && OPS_COMMAND_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as OpsCommandModeId;
    }
  } catch {
    /* ignore */
  }
  return "command_center";
}

export class OpsCommandOrchestrator {
  static snapshot(): OpsCommandSnapshot {
    OpsCommandTelemetry.begin();
    const telemetry = OpsCommandTelemetry.snapshot();

    return {
      adminDomains: AdminDashboardEngine.domains(),
      serviceHealth: PlatformObservabilityCenterEngine.services(),
      incidents: IncidentManagementEngine.incidents(),
      featureFlags: FeatureFlagReleaseEngine.flags(),
      organizations: OrgAdministrationEngine.organizations(),
      runtimeControls: RuntimeControlEngine.controls(),
      supportTickets: CustomerSupportOpsEngine.tickets(),
      auditEvents: SecurityAuditOpsEngine.events(),
      billing: BillingEntitlementOpsEngine.rows(),
      productIntel: ProductIntelligenceEngine.metrics(),
      commandBrief: OpsCommandBriefEngine.brief(),
      dashboardModes: OPS_COMMAND_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      controlScore: telemetry.controlScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: OpsCommandModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
