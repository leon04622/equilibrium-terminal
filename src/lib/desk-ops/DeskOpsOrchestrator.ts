import { CollaborationOrchestrator } from "@/lib/collaboration/CollaborationOrchestrator";
import { CollaborativeMarketMemoryDeskEngine } from "@/lib/desk-ops/CollaborativeMarketMemoryDeskEngine";
import { CollaborativeResearchDeskEngine } from "@/lib/desk-ops/CollaborativeResearchDeskEngine";
import { DESK_OPS_DASHBOARD_MODES } from "@/lib/desk-ops/DeskOpsDashboardModes";
import { DeskOpsBriefEngine } from "@/lib/desk-ops/DeskOpsBriefEngine";
import { DeskOpsTelemetry } from "@/lib/desk-ops/DeskOpsTelemetry";
import { EnterpriseIsolationDeskEngine } from "@/lib/desk-ops/EnterpriseIsolationDeskEngine";
import { GovernanceAuditDeskEngine } from "@/lib/desk-ops/GovernanceAuditDeskEngine";
import { OperationalCoordinationEngine } from "@/lib/desk-ops/OperationalCoordinationEngine";
import { OrganizationalAlertingEngine } from "@/lib/desk-ops/OrganizationalAlertingEngine";
import { OrganizationalRbacEngine } from "@/lib/desk-ops/OrganizationalRbacEngine";
import { OrganizationWorkspaceDeskEngine } from "@/lib/desk-ops/OrganizationWorkspaceDeskEngine";
import { SharedIntelligenceDeskEngine } from "@/lib/desk-ops/SharedIntelligenceDeskEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { DeskOpsModeId, DeskOpsSnapshot } from "@/types/desk-operations";

const MODE_STORAGE = "eq-desk-ops-mode-v1";

function readMode(): DeskOpsModeId {
  if (typeof window === "undefined") return "desk_command";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && DESK_OPS_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as DeskOpsModeId;
    }
  } catch {
    /* ignore */
  }
  return "desk_command";
}

export class DeskOpsOrchestrator {
  static snapshot(): DeskOpsSnapshot {
    DeskOpsTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const collab = CollaborationOrchestrator.snapshot();

    const workspaces = OrganizationWorkspaceDeskEngine.workspaces();
    const roles = OrganizationalRbacEngine.roles();
    const sharedIntel = SharedIntelligenceDeskEngine.feed(asset);
    const collabResearch = CollaborativeResearchDeskEngine.publications(asset);
    const orgAlerts = OrganizationalAlertingEngine.alerts(asset);
    const coordination = OperationalCoordinationEngine.board();
    const governance = GovernanceAuditDeskEngine.trail();
    const tenants = EnterpriseIsolationDeskEngine.tenants();
    const collabMemory = CollaborativeMarketMemoryDeskEngine.archive(asset);

    const activeMembers = collab.presence.filter((p) => p.status !== "offline").length;
    const telemetry = DeskOpsTelemetry.snapshot({
      activeMembers,
      sharedAnnotations: collab.annotations.length,
      deskAlerts: orgAlerts.length,
      auditEvents: governance.length,
    });

    const partial = {
      workspaces,
      sharedIntel,
      orgAlerts,
      coordination,
      telemetry,
    };

    return {
      asset,
      workspaces,
      roles,
      sharedIntel,
      collabResearch,
      orgAlerts,
      coordination,
      governance,
      tenants,
      collabMemory,
      orgBrief: DeskOpsBriefEngine.brief(partial),
      dashboardModes: DESK_OPS_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      orgScore: telemetry.orgScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: DeskOpsModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
