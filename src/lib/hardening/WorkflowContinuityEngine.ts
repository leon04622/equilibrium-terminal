import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { HardeningStatus, WorkflowContinuityRow } from "@/types/launch-hardening";

function statusFromPct(pct: number): HardeningStatus {
  if (pct >= 85) return "pass";
  if (pct >= 65) return "watch";
  return "fail";
}

export class WorkflowContinuityEngine {
  static evaluate(): WorkflowContinuityRow[] {
    const conn = useTerminalStore.getState().connectionStatus;
    const auth = useTerminalStore.getState().authStatus;
    const hasAsset = !!useTerminalStore.getState().selectedAsset;
    const snapshot = useProductionConfigStore.getState().lastSnapshotHash;
    const onboardPct = OnboardingEngine.completionPct();

    const streamOk = conn === "connected" ? 95 : conn === "reconnecting" ? 50 : 20;
    const execOk = auth === "agent_ready" ? 92 : auth === "connected" ? 70 : 35;

    const stages: Array<Omit<WorkflowContinuityRow, "status">> = [
      {
        stage: "discovery",
        label: "Discovery",
        continuityPct: hasAsset ? 90 : 55,
        detail: hasAsset ? "Asset selected" : "Select instrument",
      },
      {
        stage: "analysis",
        label: "Analysis",
        continuityPct: streamOk,
        detail: "Chart + L2 streams",
      },
      {
        stage: "monitoring",
        label: "Monitoring",
        continuityPct: streamOk - 5,
        detail: "Surveillance + tape",
      },
      {
        stage: "execution",
        label: "Execution",
        continuityPct: execOk,
        detail: auth,
      },
      {
        stage: "journaling",
        label: "Journaling",
        continuityPct: snapshot ? 85 : 45,
        detail: snapshot ? "Workspace persisted" : "No snapshot",
      },
      {
        stage: "alerting",
        label: "Alerting",
        continuityPct: streamOk - 8,
        detail: "Alert engine bound to streams",
      },
      {
        stage: "persistence",
        label: "Persistence",
        continuityPct: snapshot ? 88 : 50,
        detail: useProductionConfigStore.getState().cloudSyncStatus,
      },
      {
        stage: "research",
        label: "Research",
        continuityPct: onboardPct > 50 ? 78 : 52,
        detail: "Research workspace available",
      },
      {
        stage: "collaboration",
        label: "Collaboration",
        continuityPct: useProductionConfigStore.getState().entitlements.teamNetEnabled ? 80 : 48,
        detail: "Team Net entitlement",
      },
    ];

    return stages.map((s) => ({
      ...s,
      status: statusFromPct(s.continuityPct),
    }));
  }

  static workflowScore(rows: WorkflowContinuityRow[]): number {
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((a, r) => a + r.continuityPct, 0) / rows.length);
  }
}
