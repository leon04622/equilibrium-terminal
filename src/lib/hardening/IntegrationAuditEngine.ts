import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import { SecurityOrchestrator } from "@/lib/security/SecurityOrchestrator";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { HardeningStatus, IntegrationAuditRow } from "@/types/launch-hardening";

function statusFromScore(score: number): HardeningStatus {
  if (score >= 85) return "pass";
  if (score >= 60) return "watch";
  return "fail";
}

function row(
  domain: IntegrationAuditRow["domain"],
  label: string,
  score: number,
  detail: string,
): IntegrationAuditRow {
  return { domain, label, status: statusFromScore(score), score, detail };
}

export class IntegrationAuditEngine {
  static audit(): IntegrationAuditRow[] {
    const reliability = ReliabilityOrchestrator.snapshot();
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const commercial = CommercialOrchestrator.snapshot();
    const claims = useProductionConfigStore.getState().claims;
    const security = SecurityOrchestrator.snapshot(claims);
    const perf = usePerformanceStore.getState().vitals;
    const conn = useTerminalStore.getState().connectionStatus;
    const ent = useProductionConfigStore.getState().entitlements;

    const wsScore =
      conn === "connected" ? 95 : conn === "reconnecting" ? 55 : 25;

    return [
      row(
        "ingestion",
        "Ingestion",
        reliability.data.qualityScore,
        `${reliability.data.staleFeedCount} stale · integrity ${reliability.data.streamIntegrityScore}`,
      ),
      row(
        "intelligence",
        "Intelligence",
        Math.min(100, reliability.data.qualityScore + 4),
        `Conflicts ${reliability.data.conflictCount}`,
      ),
      row(
        "execution",
        "Execution",
        reliability.execution.reconciliationHealth,
        `${reliability.execution.failedOrderCount} failed orders`,
      ),
      row(
        "charting",
        "Charting",
        perf.fps >= 50 ? 90 : perf.fps >= 35 ? 72 : 48,
        `FPS ${perf.fps} · flush ${perf.lastFlushMs}ms`,
      ),
      row(
        "workspaces",
        "Workspaces",
        useProductionConfigStore.getState().lastSnapshotHash ? 88 : 62,
        useProductionConfigStore.getState().cloudSyncStatus,
      ),
      row(
        "collaboration",
        "Collaboration",
        ent.teamNetEnabled ? 84 : 50,
        ent.teamNetEnabled ? "Team Net entitled" : "Desk tier",
      ),
      row(
        "apis",
        "APIs",
        ops.cicdStatus === "pass" ? 90 : ops.cicdStatus === "fail" ? 40 : 70,
        `CI/CD ${ops.cicdStatus}`,
      ),
      row(
        "alerting",
        "Alerting",
        reliability.runtime.websocketHealth === "healthy" ? 86 : 58,
        `Stream ${reliability.runtime.websocketHealth}`,
      ),
      row("omnibar", "OmniBar", 88, "Command registry active"),
      row("knowledge_graph", "Knowledge graph", ent.proprietaryIntelEnabled ? 80 : 55, "Graph modules"),
      row("security", "Security", security.trustScore, `Session ${security.sessionHealth}`),
      row(
        "enterprise",
        "Enterprise",
        ent.enterpriseOpsEnabled ? 85 : commercial.marketReadinessScore,
        ent.enterpriseOpsEnabled ? "Enterprise ops" : "Commercial packaging",
      ),
      row("devops", "Deployment", ops.operationalScore, `Region ${ops.activeRegion}`),
    ];
  }

  static integrationScore(rows: IntegrationAuditRow[]): number {
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length);
  }
}
