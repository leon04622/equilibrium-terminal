/**
 * LIQUIDATIONS SIMULATOR — full 12-phase institutional curriculum.
 *
 * Cloned from ORDER BOOK / FUNDING LEARNING TEMPLATE V1.
 * Teaches leverage, margin, forced exits, cascades, squeezes, and survival.
 */

export type LiqVisual =
  | "whatIsLeverage"
  | "whatIsMargin"
  | "whatIsLiq"
  | "longLiq"
  | "shortLiq"
  | "cascade"
  | "shortSqueeze"
  | "longSqueeze"
  | "proVsReckless"
  | "recognitionChecks"
  | "recap";

export interface LiqScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: LiqVisual;
  holdMs?: number;
}

export const LIQUIDATIONS_SCENES: LiqScene[] = [
  {
    id: "leverage",
    lesson: 1,
    chapter: "PHASE 1 · LEVERAGE",
    title: "Same capital, different exposure",
    voice:
      "Trader A uses one thousand pounds with no leverage. Trader B uses the same one thousand pounds with ten times leverage. They control very different position sizes. Leverage increases both gains and losses.",
    takeaway: "£1,000 · 1x vs 10x — size changes everything.",
    visual: "whatIsLeverage",
    holdMs: 2400,
  },
  {
    id: "margin",
    lesson: 2,
    chapter: "PHASE 2 · MARGIN",
    title: "Your safety buffer",
    voice:
      "Margin is the capital protecting your position. Think of it as a safety buffer. When price moves against you, the buffer shrinks. Less margin means less room before a forced exit.",
    takeaway: "Margin = protection buffer.",
    visual: "whatIsMargin",
    holdMs: 2000,
  },
  {
    id: "definition",
    lesson: 3,
    chapter: "PHASE 3 · LIQUIDATION",
    title: "A forced position closure",
    voice:
      "A liquidation is a forced closure of a position. When a trader runs out of margin, the exchange closes the trade automatically. The exchange closes the trade to prevent further losses.",
    takeaway: "No margin → automatic exit.",
    visual: "whatIsLiq",
    holdMs: 2000,
  },
  {
    id: "long-liq",
    lesson: 4,
    chapter: "PHASE 4 · LONG LIQUIDATION",
    title: "Price falls against a long",
    voice:
      "A trader goes long. Price falls. Margin decreases. The liquidation level approaches. The position closes — often at the worst price.",
    takeaway: "Long + drop → forced sell.",
    visual: "longLiq",
    holdMs: 2400,
  },
  {
    id: "short-liq",
    lesson: 5,
    chapter: "PHASE 5 · SHORT LIQUIDATION",
    title: "Price rises against a short",
    voice:
      "A trader goes short. Price rises. Margin decreases. The liquidation level approaches. The short is force-closed — buying back into the rally.",
    takeaway: "Short + rally → forced buy-back.",
    visual: "shortLiq",
    holdMs: 2400,
  },
  {
    id: "cascade",
    lesson: 6,
    chapter: "PHASE 6 · CASCADE",
    title: "One liquidation triggers the next",
    voice:
      "One liquidation causes another. Then another. Then another. Forced market orders move price. That triggers more liquidations. This is why markets can accelerate violently.",
    takeaway: "Chain reaction · violent moves.",
    visual: "cascade",
    holdMs: 2400,
  },
  {
    id: "short-squeeze",
    lesson: 7,
    chapter: "PHASE 7 · SHORT SQUEEZE",
    title: "Crowded shorts, rising price",
    voice:
      "Too many traders are short. Price rises. Shorts get liquidated. Forced buying pushes price higher. More liquidations occur. The move accelerates.",
    takeaway: "Crowded shorts + rally = squeeze.",
    visual: "shortSqueeze",
    holdMs: 2400,
  },
  {
    id: "long-squeeze",
    lesson: 8,
    chapter: "PHASE 8 · LONG SQUEEZE",
    title: "Crowded longs, falling price",
    voice:
      "Too many traders are long. Price falls. Longs get liquidated. Forced selling pushes price lower. More liquidations occur. The cascade accelerates down.",
    takeaway: "Crowded longs + drop = cascade.",
    visual: "longSqueeze",
    holdMs: 2400,
  },
  {
    id: "avoid",
    lesson: 9,
    chapter: "PHASE 9 · RISK CONTROL",
    title: "Professional vs reckless",
    voice:
      "Professionals use lower leverage, smaller size, stop losses, risk limits, and avoid crowded trades. They ask: would I survive normal volatility with this position?",
    takeaway: "Survive first · profit second.",
    visual: "proVsReckless",
    holdMs: 2200,
  },
  {
    id: "recognize",
    lesson: 10,
    chapter: "PHASE 10 · RECOGNITION",
    title: "See the danger",
    voice:
      "Which trader is at greater risk? Which position survives normal volatility? Where is the liquidation danger? Watch the visuals — the answer is in the chart, not a quiz.",
    takeaway: "Read risk before you click.",
    visual: "recognitionChecks",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "READY",
    title: "You understand liquidations",
    voice:
      "You know leverage, margin, liquidations, cascades, and squeezes. Next: find these controls and risk metrics on the live terminal.",
    takeaway: "→ Live terminal bridge.",
    visual: "recap",
    holdMs: 1400,
  },
];
