import type { EnterpriseAlertRule } from "@/types/enterprise-operations";

export class EnterpriseAlertGovernanceEngine {
  static rules(): EnterpriseAlertRule[] {
    const now = Date.now();
    return [
      {
        id: "ealert-org-01",
        name: "Org-wide liquidation cascade",
        scope: "org",
        deskType: null,
        condition: "Cross-asset liquidation > $100M / 15m",
        severity: "critical",
        escalation: "executive",
        owner: "OPS DESK",
        subscriberCount: 12,
        active: true,
        lastTriggeredAt: now - 86_400_000,
      },
      {
        id: "ealert-desk-exec-01",
        name: "Execution slippage breach",
        scope: "desk",
        deskType: "execution",
        condition: "Avg slippage > 15bps sustained 3m",
        severity: "watch",
        escalation: "desk",
        owner: "EXEC DESK A",
        subscriberCount: 5,
        active: true,
        lastTriggeredAt: now - 3600_000,
      },
      {
        id: "ealert-desk-treasury-01",
        name: "Stablecoin depeg watch",
        scope: "desk",
        deskType: "treasury",
        condition: "USDT/USDC deviation > 25bps",
        severity: "critical",
        escalation: "compliance",
        owner: "TREASURY OPS",
        subscriberCount: 8,
        active: true,
        lastTriggeredAt: null,
      },
      {
        id: "ealert-desk-macro-01",
        name: "Macro event window",
        scope: "org",
        deskType: "macro",
        condition: "Scheduled macro release ±30m",
        severity: "watch",
        escalation: "org",
        owner: "MACRO COMMAND",
        subscriberCount: 14,
        active: true,
        lastTriggeredAt: now - 7200_000,
      },
      {
        id: "ealert-desk-monitor-01",
        name: "Surveillance anomaly cluster",
        scope: "desk",
        deskType: "monitoring",
        condition: "Anomaly score > 85 for 2+ assets",
        severity: "watch",
        escalation: "org",
        owner: "SURVEILLANCE",
        subscriberCount: 6,
        active: true,
        lastTriggeredAt: now - 1800_000,
      },
    ];
  }
}
