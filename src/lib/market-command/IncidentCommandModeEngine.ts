import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import { SystemicAlertEngine } from "@/lib/systemic-intelligence/SystemicAlertEngine";
import type { IncidentCommandRow } from "@/types/market-command";

const PLAYBOOKS: Record<string, string> = {
  liquidation_cascade: "Reduce gross · widen stops · monitor funding",
  stablecoin_depeg: "Treasury protocol · verify reserves · halt size",
  exchange_outage: "Venue failover · confirm fills · ops bridge",
  abnormal_volatility: "Vol command mode · hedge delta · desk alert",
  treasury_movement: "Treasury desk · flow verification",
};

export class IncidentCommandModeEngine {
  static incidents(asset: string): IncidentCommandRow[] {
    const rows: IncidentCommandRow[] = [];
    const dist = InformationDistributionOrchestrator.snapshot();

    for (const inc of dist.incidents.filter((i) => i.status !== "resolved")) {
      rows.push({
        id: inc.id,
        incident: inc.headline.slice(0, 40),
        severity: inc.severity,
        playbook: PLAYBOOKS[inc.kind] ?? "Incident desk · unified ops",
      });
    }

    for (const a of SystemicAlertEngine.evaluate(asset).filter((x) => x.severity !== "info")) {
      rows.push({
        id: a.id,
        incident: a.headline.slice(0, 40),
        severity: a.severity,
        playbook: "Systemic watch · cascade panel",
      });
    }

    if (rows.length === 0) {
      rows.push({
        id: "inc-clear",
        incident: "No active incident command triggers",
        severity: "info",
        playbook: "Standard situational monitoring",
      });
    }

    return rows;
  }
}
