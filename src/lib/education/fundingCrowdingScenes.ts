/**
 * FUNDING & MARKET CROWDING SIMULATOR — first-principles curriculum.
 *
 * Cloned from ORDER BOOK LEARNING TEMPLATE V1 (Market Mechanics pattern).
 * Teaches what funding is, why it exists, who pays whom, crowding, and squeezes
 * — in plain English, one concept per screen, before the live bridge.
 */

export type FCVisual =
  | "intro"
  | "crowdBuilding"
  | "balancing"
  | "positiveFunding"
  | "negativeFunding"
  | "shortSqueeze"
  | "longSqueeze"
  | "recap";

export interface FCScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: FCVisual;
  holdMs?: number;
}

export const FUNDING_CROWDING_SCENES: FCScene[] = [
  {
    id: "intro",
    lesson: 0,
    chapter: "FUNDING & CROWDING",
    title: "Why traders talk about funding",
    voice:
      "Traders constantly mention funding and crowded positioning — let's see what they actually mean.",
    takeaway: "Plain language first. No formulas yet.",
    visual: "intro",
    holdMs: 900,
  },
  {
    id: "crowding",
    lesson: 1,
    chapter: "LESSON 1 · CROWDING",
    title: "When everyone wants the same side",
    voice: "When too many traders take the same side, risk begins to build.",
    takeaway: "Imagine almost everyone wants to buy.",
    visual: "crowdBuilding",
    holdMs: 1800,
  },
  {
    id: "why-funding",
    lesson: 2,
    chapter: "LESSON 2 · WHY FUNDING EXISTS",
    title: "Funding balances the crowd",
    voice: "Funding is a balancing mechanism — it nudges traders away from a one-sided crowd.",
    takeaway: "Not a fee for fun. A pressure valve.",
    visual: "balancing",
    holdMs: 1700,
  },
  {
    id: "positive",
    lesson: 3,
    chapter: "LESSON 3 · POSITIVE FUNDING",
    title: "Longs pay shorts",
    voice: "Positive funding means long traders pay short traders — because too many want to be long.",
    takeaway: "Crowded longs → longs pay.",
    visual: "positiveFunding",
    holdMs: 1800,
  },
  {
    id: "negative",
    lesson: 4,
    chapter: "LESSON 4 · NEGATIVE FUNDING",
    title: "Shorts pay longs",
    voice: "Negative funding means short traders pay long traders — because too many want to be short.",
    takeaway: "Crowded shorts → shorts pay.",
    visual: "negativeFunding",
    holdMs: 1800,
  },
  {
    id: "short-squeeze",
    lesson: 5,
    chapter: "LESSON 5 · SHORT SQUEEZE",
    title: "How a short squeeze accelerates",
    voice: "When price rises against crowded shorts, they are forced to buy back — and that buying pushes price even higher.",
    takeaway: "Many shorts + rising price = squeeze.",
    visual: "shortSqueeze",
    holdMs: 2200,
  },
  {
    id: "long-squeeze",
    lesson: 6,
    chapter: "LESSON 6 · LONG SQUEEZE",
    title: "How a long squeeze accelerates",
    voice: "When price falls against crowded longs, liquidations force selling — and that selling pushes price even lower.",
    takeaway: "Many longs + falling price = cascade.",
    visual: "longSqueeze",
    holdMs: 2200,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "READY",
    title: "You understand the basics",
    voice:
      "Funding balances crowds. Positive means longs pay shorts. Negative means shorts pay longs. Crowding creates squeeze risk.",
    takeaway: "Next: find this in the live terminal.",
    visual: "recap",
    holdMs: 1400,
  },
];
