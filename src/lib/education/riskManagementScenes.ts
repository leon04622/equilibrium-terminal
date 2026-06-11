/**
 * RISK MANAGEMENT SIMULATOR — institutional curriculum.
 *
 * Cloned from LEARNING TEMPLATE V1.
 * Teaches position sizing, stops, risk per trade, R:R, drawdowns, and survival.
 */

export type RMVisual =
  | "whyTradersFail"
  | "positionSize"
  | "stopLosses"
  | "riskPerTrade"
  | "riskReward"
  | "drawdowns"
  | "accountSurvival"
  | "recap";

export interface RMScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: RMVisual;
  holdMs?: number;
}

export const RISK_MANAGEMENT_SCENES: RMScene[] = [
  {
    id: "why-fail",
    lesson: 1,
    chapter: "PHASE 1 · WHY TRADERS FAIL",
    title: "Win rate is not survival",
    voice:
      "Trader A wins often but risks too much on each trade. Trader B wins less often but controls risk. Over time, Trader B survives longer. Protecting capital matters more than finding entries.",
    takeaway: "Survival beats win rate.",
    visual: "whyTradersFail",
    holdMs: 2600,
  },
  {
    id: "position-size",
    lesson: 2,
    chapter: "PHASE 2 · POSITION SIZE",
    title: "Same setup, different risk",
    voice:
      "Two traders see the same setup. One uses a small position. One uses a large position. The trade moves against them. The small position loses a little. The large position loses a lot. Size determines damage.",
    takeaway: "Size controls how much you lose.",
    visual: "positionSize",
    holdMs: 2400,
  },
  {
    id: "stop-losses",
    lesson: 3,
    chapter: "PHASE 3 · STOP LOSSES",
    title: "Exit on your terms",
    voice:
      "A stop loss is a planned exit when price moves against you. Without a stop, one bad trade can erase weeks of gains. With a controlled stop, you cap the loss and stay in the game.",
    takeaway: "Stops cap damage before emotion takes over.",
    visual: "stopLosses",
    holdMs: 2400,
  },
  {
    id: "risk-per-trade",
    lesson: 4,
    chapter: "PHASE 4 · RISK PER TRADE",
    title: "How much of your account?",
    voice:
      "Risk one percent per trade and a string of losses is manageable. Risk five percent and a few losses cut your account deeply. Risk ten percent and recovery becomes extremely difficult. Small risk compounds into survival.",
    takeaway: "1–2% per trade · survive strings of losses.",
    visual: "riskPerTrade",
    holdMs: 2600,
  },
  {
    id: "risk-reward",
    lesson: 5,
    chapter: "PHASE 5 · RISK / REWARD",
    title: "Profitability over time",
    voice:
      "A one-to-one reward-to-risk needs a high win rate to profit. A two-to-one ratio lets you win less and still grow. A three-to-one ratio gives room for mistakes. You do not need to be right every time — you need favorable math.",
    takeaway: "2:1+ R:R · win less, still profit.",
    visual: "riskReward",
    holdMs: 2400,
  },
  {
    id: "drawdowns",
    lesson: 6,
    chapter: "PHASE 6 · DRAWDOWNS",
    title: "Recovery gets harder",
    voice:
      "A ten percent drawdown needs an eleven percent gain to recover. Twenty percent needs twenty-five. Fifty percent needs one hundred. Eighty percent needs four hundred. The deeper the hole, the harder the climb.",
    takeaway: "Avoid deep drawdowns — recovery is brutal.",
    visual: "drawdowns",
    holdMs: 2600,
  },
  {
    id: "survival",
    lesson: 7,
    chapter: "PHASE 7 · ACCOUNT SURVIVAL",
    title: "Stay in the game",
    voice:
      "The goal is not maximum profit on one trade. The goal is long-term survival. Traders who protect capital get more chances to learn, adapt, and compound. You cannot compound if you are out of the game.",
    takeaway: "Survive first · profit second.",
    visual: "accountSurvival",
    holdMs: 2400,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "How much can I lose?",
    voice:
      "Before every trade, ask: how much can I lose — not how much can I make? Set size, set a stop, risk a small percent, respect drawdowns, and stay in the game. Next: find these controls on your live terminal.",
    takeaway: "Protect capital · size · stop · survive.",
    visual: "recap",
    holdMs: 2200,
  },
];
