import type { EnterpriseConnector } from "@/types/platform-extensibility";

export class EnterpriseIntegrationEngine {
  static connectors(): EnterpriseConnector[] {
    return [
      {
        id: "ent-treasury",
        system: "Treasury Management",
        category: "treasury",
        protocol: "rest",
        status: "connected",
      },
      {
        id: "ent-oms",
        system: "Multi-Venue OMS",
        category: "execution",
        protocol: "rest",
        status: "connected",
      },
      {
        id: "ent-risk",
        system: "Portfolio Risk Engine",
        category: "risk",
        protocol: "webhook",
        status: "connected",
      },
      {
        id: "ent-reporting",
        system: "Institutional Reporting Hub",
        category: "reporting",
        protocol: "rest",
        status: "staged",
      },
      {
        id: "ent-dashboard",
        system: "Internal Market Dashboard",
        category: "dashboard",
        protocol: "rest",
        status: "connected",
      },
      {
        id: "ent-fix",
        system: "FIX Gateway (institutional)",
        category: "execution",
        protocol: "fix_staged",
        status: "staged",
      },
    ];
  }
}
