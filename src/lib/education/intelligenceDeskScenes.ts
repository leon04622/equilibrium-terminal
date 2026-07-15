export type IntelligenceDeskVisual =
  | "whyDesk"
  | "tacticalWire"
  | "surveillance"
  | "movers"
  | "headlines"
  | "operatorFlow"
  | "recap";

export interface IntelligenceDeskScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: IntelligenceDeskVisual;
  holdMs?: number;
}

export const INTELLIGENCE_DESK_SCENES: IntelligenceDeskScene[] = [
  {
    id: "why-desk",
    lesson: 1,
    chapter: "PHASE 1 · WHY INTELLIGENCE DESK",
    title: "Speed without chaos",
    voice:
      "The intelligence desk is where fast-moving information becomes actionable workflow. Bloomberg operators do not scroll randomly — they run wire, surveillance, and operator checklist as one disciplined stack.",
    takeaway: "Intelligence desk = wire + surveillance + workflow.",
    visual: "whyDesk",
    holdMs: 2800,
  },
  {
    id: "wire",
    lesson: 2,
    chapter: "PHASE 2 · TACTICAL WIRE",
    title: "Vectors in real time",
    voice:
      "Tactical Wire streams direction, confidence, and acceleration tags on live headlines. Critical vectors flash first — click to pivot the desk or open the article without losing context.",
    takeaway: "Wire is your fastest narrative channel.",
    visual: "tacticalWire",
    holdMs: 2600,
  },
  {
    id: "surveillance",
    lesson: 3,
    chapter: "PHASE 3 · SURVEILLANCE STRIP",
    title: "Regime, funding, stress",
    voice:
      "Market Surveillance compresses regime, funding bias, stress, spread, and book imbalance into one strip. When the strip shifts, your intelligence read changes before price confirms.",
    takeaway: "Surveillance strip = composite threat radar.",
    visual: "surveillance",
    holdMs: 2800,
  },
  {
    id: "movers",
    lesson: 4,
    chapter: "PHASE 4 · MOVERS",
    title: "Who is moving now",
    voice:
      "Movers rank symbols by session change. Intelligence operators scan movers before depth — rotation and leadership often show up here before your chart updates.",
    takeaway: "Movers surface leadership and laggards fast.",
    visual: "movers",
    holdMs: 2600,
  },
  {
    id: "headlines",
    lesson: 5,
    chapter: "PHASE 5 · WHAT MATTERS NOW",
    title: "Curated surveillance headlines",
    voice:
      "What Matters Now filters surveillance headlines to the highest-signal items. This is not a firehose — it is an editor layer that tells you what to investigate next.",
    takeaway: "Headlines layer = editorial filter on noise.",
    visual: "headlines",
    holdMs: 2800,
  },
  {
    id: "operator",
    lesson: 6,
    chapter: "PHASE 6 · OPERATOR WORKFLOW",
    title: "Morning, trading, review",
    voice:
      "Operator Mode turns intelligence into a daily checklist: morning prep, pre-trade gates, and review. Professional desks never trade on wire alone — they complete the workflow stack first.",
    takeaway: "Workflow converts intel into disciplined action.",
    visual: "operatorFlow",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Wire, watch, work",
    voice:
      "You have the intelligence desk vocabulary: tactical wire, surveillance strip, movers, curated headlines, and operator workflow. Next: walk Tactical Wire, Market Surveillance, and Operator Mode on your live desk.",
    takeaway: "Wire → watch → work — then route size.",
    visual: "recap",
    holdMs: 2400,
  },
];
