import type { OperationalIncident } from "@/types/devops-operations";

const incidents: OperationalIncident[] = [];

export const RUNBOOKS = {
  ws_outage: "runbooks/STREAM_RECONNECT.md",
  deploy_rollback: "runbooks/DEPLOYMENT_ROLLBACK.md",
  stress_event: "runbooks/HIGH_VOLATILITY.md",
  auth_incident: "runbooks/AUTH_INCIDENT.md",
} as const;

export class IncidentResponseEngine {
  static open(input: Omit<OperationalIncident, "id" | "openedAt" | "status">): OperationalIncident {
    const incident: OperationalIncident = {
      ...input,
      id: `inc_${Date.now().toString(36)}`,
      status: "open",
      openedAt: Date.now(),
    };
    incidents.unshift(incident);
    if (incidents.length > 32) incidents.length = 32;
    return incident;
  }

  static list(): OperationalIncident[] {
    return incidents.filter((i) => i.status !== "resolved").slice(0, 8);
  }

  static autoDetect(input: {
    wsConnected: boolean;
    lastMessageAgeMs: number;
    stressMode: boolean;
    operationalScore: number;
  }): OperationalIncident | null {
    if (!input.wsConnected || input.lastMessageAgeMs > 30_000) {
      return IncidentResponseEngine.open({
        severity: "sev2",
        title: "Market stream degraded",
        runbookId: RUNBOOKS.ws_outage,
      });
    }
    if (input.stressMode && input.operationalScore < 70) {
      return IncidentResponseEngine.open({
        severity: "sev3",
        title: "High-volatility infrastructure stress",
        runbookId: RUNBOOKS.stress_event,
      });
    }
    return null;
  }
}
