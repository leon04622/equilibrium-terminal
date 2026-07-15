export type MacroFlowsVisual =
  | "whyFlows"
  | "regime"
  | "stressGauge"
  | "tickerFlows"
  | "stateLayer"
  | "positioning"
  | "recap";

export interface MacroFlowsScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: MacroFlowsVisual;
  holdMs?: number;
}

export const MACRO_FLOWS_SCENES: MacroFlowsScene[] = [
  {
    id: "why-flows",
    lesson: 1,
    chapter: "PHASE 1 · WHY MACRO FLOWS",
    title: "Regime before routing",
    voice:
      "Macro flows describe where capital is moving — rates, dollar, stress, and risk appetite. Bloomberg operators read regime and flow direction before they size crypto. Direction without context is gambling.",
    takeaway: "Flows filter every cross-market read.",
    visual: "whyFlows",
    holdMs: 2800,
  },
  {
    id: "regime",
    lesson: 2,
    chapter: "PHASE 2 · REGIME STRIP",
    title: "Risk-on, risk-off, compression",
    voice:
      "The Macro Matrix header compresses regime label and stress score. Risk-on favors beta; risk-off tightens size; compression rewards mean reversion. Your first macro read is always here.",
    takeaway: "Regime strip = macro compass.",
    visual: "regime",
    holdMs: 2600,
  },
  {
    id: "stress",
    lesson: 3,
    chapter: "PHASE 3 · STRESS GAUGE",
    title: "When flows accelerate",
    voice:
      "Stress gauge tracks systemic pressure. Rising stress widens spreads, thins liquidity, and accelerates narrative. When stress climbs, reduce leverage and widen stops before you chase.",
    takeaway: "Stress rising = flows getting violent.",
    visual: "stressGauge",
    holdMs: 2800,
  },
  {
    id: "tickers",
    lesson: 4,
    chapter: "PHASE 4 · TICKER FLOWS",
    title: "DXY, rates, and crypto beta",
    voice:
      "Macro ticker rows show live flow direction — dollar, yields, equities, and crypto proxies. Leaders in this grid often move before your perp tape. Trade with the flow grid, not against it.",
    takeaway: "Ticker grid = institutional flow tape.",
    visual: "tickerFlows",
    holdMs: 2600,
  },
  {
    id: "state",
    lesson: 5,
    chapter: "PHASE 5 · MARKET STATE",
    title: "Desk behavior layer",
    voice:
      "Market State classifies volatility and liquidity into desk behavior — calm, stress, thin. Macro flows set the backdrop; state layer tells you how to execute inside that backdrop.",
    takeaway: "State layer translates macro into desk behavior.",
    visual: "stateLayer",
    holdMs: 2800,
  },
  {
    id: "positioning",
    lesson: 6,
    chapter: "PHASE 6 · POSITIONING CONTEXT",
    title: "Briefing + outlook stack",
    voice:
      "Daily Briefing ties macro flows to today's risk and opportunity outlook. Professional workflow: regime and stress from Macro Matrix, behavior from Market State, positioning from Briefing — then route.",
    takeaway: "Stack macro → state → briefing before size.",
    visual: "positioning",
    holdMs: 2600,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Read flows, then position",
    voice:
      "You have the macro flow vocabulary: regime, stress, ticker direction, market state, and briefing outlook. Next: walk Macro Matrix, Market State, and Daily Briefing on your desk in the live bridge.",
    takeaway: "Macro flows first — positioning second.",
    visual: "recap",
    holdMs: 2400,
  },
];
