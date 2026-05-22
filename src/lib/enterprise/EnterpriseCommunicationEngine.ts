import type { EnterpriseNotice } from "@/types/enterprise-operations";

export class EnterpriseCommunicationEngine {
  static notices(): EnterpriseNotice[] {
    const now = Date.now();
    const notices: EnterpriseNotice[] = [
      {
        id: "notice-brief-01",
        kind: "briefing",
        headline: "Daily institutional briefing — risk-on posture maintained",
        body: "Macro desk confirms funding normalization. Treasury stablecoin allocation within policy bands.",
        severity: "info",
        authorHandle: "MACRO COMMAND",
        deskType: "macro",
        timestamp: now - 7200_000,
      },
      {
        id: "notice-incident-01",
        kind: "incident",
        headline: "Surveillance desk degraded — elevated anomaly cluster",
        body: "Monitoring desk operating in degraded mode. Escalation routed to org ops.",
        severity: "watch",
        authorHandle: "SURVEILLANCE",
        deskType: "monitoring",
        timestamp: now - 1800_000,
      },
      {
        id: "notice-ops-01",
        kind: "operational",
        headline: "Scheduled maintenance window — gateway redundancy test",
        body: "Failover drill scheduled 02:00 UTC. No execution impact expected.",
        severity: "info",
        authorHandle: "OPS DESK",
        deskType: null,
        timestamp: now - 3600_000,
      },
      {
        id: "notice-exec-01",
        kind: "execution_coord",
        headline: "HYPE execution routing — limit-only until depth recovers",
        body: "Execution desk coordinating limit ladder routing. Slippage elevated 8bps.",
        severity: "watch",
        authorHandle: "EXEC DESK A",
        deskType: "execution",
        timestamp: now - 900_000,
      },
    ];

    return notices.sort((a, b) => b.timestamp - a.timestamp);
  }
}
