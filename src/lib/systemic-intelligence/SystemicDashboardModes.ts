import type { SystemicDashboardMode } from "@/types/systemic-intelligence";

export const SYSTEMIC_DASHBOARD_MODES: SystemicDashboardMode[] = [
  {
    id: "relationship_map",
    label: "Relationship map",
    description: "Entity graph, correlations, and dependency edges.",
    panels: ["systemicintel", "knowledgegraph", "intelligence"],
  },
  {
    id: "systemic_risk",
    label: "Systemic risk",
    description: "Concentration, contagion, and leverage stress.",
    panels: ["systemicintel", "portfoliodesk", "surveillance"],
  },
  {
    id: "narrative_flow",
    label: "Narrative flow",
    description: "Emergence, acceleration, and sector spread.",
    panels: ["systemicintel", "intelligence", "newswire"],
  },
  {
    id: "liquidity_flows",
    label: "Liquidity flows",
    description: "Stablecoin, bridge, and exchange migration.",
    panels: ["systemicintel", "execintel", "ingestion"],
  },
  {
    id: "event_cascade",
    label: "Event cascade",
    description: "Macro, liquidation, and regulatory propagation.",
    panels: ["systemicintel", "alerts", "macro"],
  },
];
