/** 90-day execution roadmap — canonical phase metadata (see docs/90_DAY_ROADMAP.md). */

export type RoadmapPhaseId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RoadmapPhase {
  id: RoadmapPhaseId;
  name: string;
  goal: string;
  days: string;
}

export const EXECUTION_ROADMAP: RoadmapPhase[] = [
  { id: 1, name: "Stabilization", goal: "Daily usable product", days: "1–21" },
  { id: 2, name: "Core Workflow", goal: "Workflow superiority", days: "15–45" },
  { id: 3, name: "Real-Time Intel", goal: "Operational visibility", days: "30–60" },
  { id: 4, name: "Data Expansion", goal: "Cross-market read layer", days: "45–75" },
  { id: 5, name: "Retention", goal: "Daily dependency", days: "60–85" },
  { id: 6, name: "Polish", goal: "Institutional feel", days: "70–90" },
  { id: 7, name: "Distribution", goal: "Market validation", days: "75–90+" },
];

/** Active build phase — update when exit criteria met. */
export const CURRENT_ROADMAP_PHASE: RoadmapPhaseId = 1;

export function getCurrentPhase(): RoadmapPhase {
  return EXECUTION_ROADMAP.find((p) => p.id === CURRENT_ROADMAP_PHASE) ?? EXECUTION_ROADMAP[0];
}
