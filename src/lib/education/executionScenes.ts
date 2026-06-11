/**
 * EXECUTION SIMULATOR — institutional curriculum.
 *
 * Cloned from LEARNING TEMPLATE V1.
 * Teaches timing, patience, scaling, and execution quality vs trade ideas.
 */

export type ExecVisual =
  | "whatIsExecution"
  | "chasingPrice"
  | "patientExecution"
  | "scalingIn"
  | "scalingOut"
  | "volatilityExecution"
  | "thinLiquidity"
  | "goodVsBad"
  | "recap";

export interface ExecScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: ExecVisual;
  holdMs?: number;
}

export const EXECUTION_SCENES: ExecScene[] = [
  {
    id: "what-is-execution",
    lesson: 1,
    chapter: "PHASE 1 · WHAT IS EXECUTION?",
    title: "Same idea, different outcome",
    voice:
      "Trader A has a good idea but poor execution — chasing entries and oversizing. Trader B has the same idea with better execution — patient entries and controlled size. Execution determines how efficiently you enter and exit markets.",
    takeaway: "A good trade idea can fail on poor execution.",
    visual: "whatIsExecution",
    holdMs: 2600,
  },
  {
    id: "chasing",
    lesson: 2,
    chapter: "PHASE 2 · CHASING PRICE",
    title: "Buying higher repeatedly",
    voice:
      "Price moves quickly. The trader keeps buying higher, afraid to miss the move. Each click pays a worse price. Emotional execution turns a valid idea into a poor entry. Chasing is not a strategy.",
    takeaway: "Chasing price destroys entry quality.",
    visual: "chasingPrice",
    holdMs: 2400,
  },
  {
    id: "patient",
    lesson: 3,
    chapter: "PHASE 3 · PATIENT EXECUTION",
    title: "Wait for conditions",
    voice:
      "The patient trader waits. Liquidity improves. The spread narrows. The entry fills at a better level. Patience is often an edge — you do not have to click the moment you feel urgency.",
    takeaway: "Patience can improve fill quality.",
    visual: "patientExecution",
    holdMs: 2400,
  },
  {
    id: "scale-in",
    lesson: 4,
    chapter: "PHASE 4 · SCALING IN",
    title: "One shot vs layers",
    voice:
      "A single large entry moves the market against you. Multiple smaller entries let you test the idea and average in with less impact. Scaling in trades immediacy for control — useful when conviction builds gradually.",
    takeaway: "Layers reduce impact · one shot maximizes urgency.",
    visual: "scalingIn",
    holdMs: 2600,
  },
  {
    id: "scale-out",
    lesson: 5,
    chapter: "PHASE 5 · SCALING OUT",
    title: "Managing exits",
    voice:
      "Professionals rarely exit all at once. Partial profit taking locks in gains. Position reduction lowers risk as the trade develops. Scaling out manages uncertainty — you keep exposure without betting everything on one exit.",
    takeaway: "Scale out to reduce risk and lock gains.",
    visual: "scalingOut",
    holdMs: 2400,
  },
  {
    id: "vol-exec",
    lesson: 6,
    chapter: "PHASE 6 · VOLATILITY",
    title: "Same idea, different conditions",
    voice:
      "In a calm market, spreads stay tight and fills are predictable. In a volatile market, the same trade idea gets worse execution — wider spreads, faster moves, more slippage. Volatility demands smaller size and more patience.",
    takeaway: "Volatile markets punish rushed execution.",
    visual: "volatilityExecution",
    holdMs: 2400,
  },
  {
    id: "thin-liq",
    lesson: 7,
    chapter: "PHASE 7 · THIN LIQUIDITY",
    title: "When the book is weak",
    voice:
      "Strong liquidity absorbs orders cleanly. Weak liquidity means spread expansion, slippage risk, and poor fills. Executing large size into a thin book is how good ideas become bad trades.",
    takeaway: "Thin liquidity → widen spreads · worse fills.",
    visual: "thinLiquidity",
    holdMs: 2600,
  },
  {
    id: "good-vs-bad",
    lesson: 8,
    chapter: "PHASE 8 · GOOD VS BAD",
    title: "Professional habits",
    voice:
      "Good execution: patience, planning, liquidity awareness. Bad execution: chasing, emotional decisions, poor timing. Professionals plan the entry before they click — they do not react to every tick.",
    takeaway: "Plan the entry · do not chase the tick.",
    visual: "goodVsBad",
    holdMs: 2400,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Execution is the edge",
    voice:
      "Before you enter, check liquidity, spread, volatility, size, and order type. A good idea without good execution still loses. Next: find these controls on your live terminal and execute with intention.",
    takeaway: "Good idea + poor execution = failed trade.",
    visual: "recap",
    holdMs: 2200,
  },
];
