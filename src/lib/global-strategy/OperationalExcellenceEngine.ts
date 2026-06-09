import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import { EnterpriseReliabilityEngine } from "@/lib/enterprise/EnterpriseReliabilityEngine";
import { ReliabilityOrchestrator } from "@/lib/reliability/ReliabilityOrchestrator";
import type { OperationalExcellenceRow } from "@/types/global-infrastructure";

export class OperationalExcellenceEngine {
  static systems(): OperationalExcellenceRow[] {
    const snap = ReliabilityOrchestrator.snapshot();
    const enterprise = EnterpriseReliabilityEngine.state();
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const uptime = Math.max(enterprise.uptimePct, ops.uptimePct);
    const dataTrust = snap.data.qualityScore;
    const openSignals =
      snap.data.staleFeedCount +
      snap.execution.failedOrderCount +
      snap.data.conflictCount +
      ops.incidents.length;

    const status = (pct: number): OperationalExcellenceRow["status"] =>
      pct >= 85 ? "pass" : pct >= 60 ? "watch" : "fail";

    return [
      {
        kind: "support",
        label: "Support Infrastructure",
        status: status(72),
        coveragePct: 72,
      },
      {
        kind: "incident_mgmt",
        label: "Incident Management",
        status: openSignals > 2 ? "watch" : "pass",
        coveragePct: openSignals > 0 ? 78 : 90,
      },
      {
        kind: "uptime_monitor",
        label: "Uptime Monitoring",
        status: status(uptime),
        coveragePct: Math.round(uptime),
      },
      {
        kind: "runbooks",
        label: "Operational Runbooks",
        status: ops.incidents.length === 0 ? "pass" : "watch",
        coveragePct: ops.incidents.length === 0 ? 85 : 70,
      },
      {
        kind: "deployment",
        label: "Deployment Systems",
        status: ops.cicdStatus === "pass" ? "pass" : ops.cicdStatus === "fail" ? "fail" : "watch",
        coveragePct: ops.operationalScore,
      },
      {
        kind: "observability",
        label: "Infrastructure Observability",
        status: status(Math.round((dataTrust + ops.operationalScore) / 2)),
        coveragePct: Math.round((dataTrust + ops.operationalScore) / 2),
      },
      {
        kind: "recovery",
        label: "Recovery Procedures",
        status: enterprise.failoverReady && ops.database.failoverReady ? "pass" : "watch",
        coveragePct: enterprise.failoverReady ? 88 : 55,
      },
    ];
  }
}
