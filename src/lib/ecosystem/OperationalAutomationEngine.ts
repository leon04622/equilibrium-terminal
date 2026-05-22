import type { OperationalAutomationTask } from "@/types/crypto-ecosystem";

/** Automation reduces friction only — never replaces trader judgment. */
export class OperationalAutomationEngine {
  static tasks(): OperationalAutomationTask[] {
    const now = Date.now();
    return [
      {
        id: "auto-workflow-01",
        kind: "workflow_routing",
        label: "Asset workspace orchestration",
        description: "Opens coordinated panel set on asset select — human confirms execution.",
        humanInLoop: true,
        active: true,
        lastRunAt: now - 120_000,
      },
      {
        id: "auto-monitor-01",
        kind: "monitoring",
        label: "Liquidity stress monitor",
        description: "EQ-LSI threshold alerts to surveillance — no auto-trading.",
        humanInLoop: true,
        active: true,
        lastRunAt: now - 300_000,
      },
      {
        id: "auto-info-01",
        kind: "information_organize",
        label: "Intelligence wire dedupe",
        description: "Organizes high-score intel into tape and journal — AI organize only.",
        humanInLoop: false,
        active: true,
        lastRunAt: now - 60_000,
      },
      {
        id: "auto-report-01",
        kind: "report_dispatch",
        label: "Daily ops briefing dispatch",
        description: "Schedules institutional briefing to collab + enterprise channels.",
        humanInLoop: true,
        active: true,
        lastRunAt: now - 3600_000,
      },
      {
        id: "auto-alert-01",
        kind: "alert_escalation",
        label: "Critical alert escalation",
        description: "Routes critical alerts to desk + enterprise — trader acknowledges.",
        humanInLoop: true,
        active: true,
        lastRunAt: now - 1800_000,
      },
    ];
  }
}
