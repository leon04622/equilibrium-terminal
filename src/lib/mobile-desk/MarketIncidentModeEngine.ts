import { IncidentMonitorEngine } from "@/lib/distribution/IncidentMonitorEngine";
import type { IncidentModeCard, MobileAlertSeverity } from "@/types/mobile-operational";

const INCIDENT_ACTIONS: Record<string, string[]> = {
  exchange_outage: ["Verify venue status", "Pause new orders", "Check backup routes"],
  api_instability: ["Check connection health", "Failover to backup feed", "Open diagnostics"],
  liquidation_cascade: ["Review leverage", "Monitor liq clusters", "Reduce size if critical"],
  stablecoin_depeg: ["Check treasury exposure", "Halt bridge flows", "Alert desk lead"],
  abnormal_volatility: ["Widen risk limits review", "Check vol surfaces", "Session handoff to desk"],
  treasury_movement: ["Verify treasury balances", "Sync with portfolio desk"],
  chain_congestion: ["Monitor bridge latency", "Defer large transfers"],
  bridge_failure: ["Halt bridge flows", "Alert operations lead"],
};

export class MarketIncidentModeEngine {
  static active(): IncidentModeCard | null {
    const incidents = IncidentMonitorEngine.scan();
    const critical = incidents.find((i) => i.severity === "critical") ?? incidents[0];
    if (!critical) return null;

    const kind = critical.kind;
    const actions =
      INCIDENT_ACTIONS[kind] ??
      INCIDENT_ACTIONS.abnormal_volatility ??
      ["Open desktop terminal", "Review incident tape"];

    return {
      id: critical.id,
      kind,
      headline: critical.headline,
      operationalSummary: critical.detail,
      severity: critical.severity as MobileAlertSeverity,
      actions,
    };
  }
}
