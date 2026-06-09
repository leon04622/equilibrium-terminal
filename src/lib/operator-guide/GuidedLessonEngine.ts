import { OperationalPlaybooks } from "@/lib/operator-guide/OperationalPlaybooks";
import type { ExplainLabel, GuidedLesson, GuidedLessonStep } from "@/types/operator-guide";

function step(
  order: number,
  instruction: string,
  focusPanel: string,
  visualCue: GuidedLessonStep["visualCue"],
  cause: string,
  effect: string,
  beginnerNote: string,
  proNote: string,
  labels?: ExplainLabel[],
  narration?: string,
): GuidedLessonStep {
  return {
    id: `step-${order}`,
    order,
    instruction,
    focusPanel,
    visualCue,
    cause,
    effect,
    beginnerNote,
    proNote,
    labels,
    narration,
  };
}

/** Hand-authored cinematic lessons for the core execution-critical panels. */
const LESSONS: Record<string, GuidedLesson> = {
  // PHASE 1–8 — the flagship guided learning module. This is the blueprint
  // every future lesson follows: plain-English narration, visual labels synced
  // to each step, progressive pacing, and a real mini-replay at the end.
  hyperbook: {
    id: "lesson-hyperbook",
    panelId: "hyperbook",
    title: "Teach Me The Order Book",
    objective: "Understand the order book well enough to judge a fill before you click.",
    replayScenarioId: "sc-liq-cascade-btc",
    steps: [
      step(
        1,
        "What are bids?",
        "hyperbook",
        "bid_stack",
        "Bids are resting buy orders sitting below the current price.",
        "When lots of bids are stacked up, buyers are ready to step in and that can slow a fall.",
        "Bids are offers to buy, waiting below the price.",
        "Resting bid depth = passive demand; watch whether it reloads.",
        [{ text: "BIDS", anchor: "bl", tone: "good" }],
        "Let's start with the bids. Look at the green side of the order book, below the price. These are bids — offers from people who want to buy, each one waiting at a price below where the market is now. When you see lots of bids stacked up, it means many buyers are ready to step in, which can help slow the price from falling.",
      ),
      step(
        2,
        "What are asks?",
        "hyperbook",
        "ask_reload",
        "Asks are resting sell orders sitting above the current price.",
        "A thick wall of asks acts like a ceiling — price struggles to rise through heavy selling.",
        "Asks are offers to sell, waiting above the price.",
        "Resting ask depth = passive supply; a wall caps advances until absorbed or pulled.",
        [
          { text: "BIDS", anchor: "bl", tone: "good" },
          { text: "ASKS", anchor: "tr", tone: "bad" },
        ],
        "Now the asks. Look at the red side, above the price. These are asks — offers from people who want to sell, each waiting at a price above the market. A thick wall of asks acts like a ceiling. Price often struggles to push higher until those sell orders are either bought up or pulled away.",
      ),
      step(
        3,
        "What is the spread?",
        "hyperbook",
        "spread_compress",
        "The spread is the gap between the highest bid and the lowest ask.",
        "A small spread means trading is cheap; a wide spread means you pay up the moment you enter.",
        "The spread is the gap in the middle — the instant cost of trading.",
        "Spread is the cost of crossing the book; it sets your urgency budget.",
        [{ text: "SPREAD", anchor: "center", tone: "warn" }],
        "In the middle, between the highest bid and the lowest ask, there is a gap. That gap is called the spread. It is the instant cost of trading right now. A small spread means buying and selling is cheap and the market is healthy. A wide spread means you will pay more the moment you enter or exit a trade.",
      ),
      step(
        4,
        "What is liquidity?",
        "hyperbook",
        "bid_stack",
        "Liquidity is how much size is resting across all the price levels.",
        "Deep liquidity lets you trade size without moving price; thin liquidity moves fast on small orders.",
        "Liquidity is how much size is waiting to trade.",
        "Cumulative resting depth governs market impact and fillability.",
        [{ text: "LIQUIDITY WALL", anchor: "left", tone: "good" }],
        "Liquidity is simply how much size is waiting to trade across all of these price levels. When there is lots of liquidity, you can buy or sell a large amount without moving the price much. When liquidity is thin, even a small order can push the price around. More resting size means a smoother, safer market.",
      ),
      step(
        5,
        "What is imbalance?",
        "hyperbook",
        "flow_imbalance",
        "Imbalance is when one side of the book clearly has more size than the other.",
        "Heavier buyers than sellers tends to push price up short-term, and the reverse pushes it down.",
        "Imbalance shows which side has more pressure building.",
        "Resting/aggressive skew signals near-term directional pressure.",
        [
          { text: "BIDS", anchor: "bl", tone: "good" },
          { text: "ASKS", anchor: "tr", tone: "bad" },
          { text: "PRESSURE", anchor: "center", tone: "warn" },
        ],
        "Now compare the two sides. When one side clearly has more size than the other, that is called an imbalance. If there are far more buyers than sellers, price tends to get pushed up in the short term. If there are far more sellers, price tends to get pushed down. Imbalance gives you a hint about which way pressure is building.",
      ),
      step(
        6,
        "What happens when liquidity disappears?",
        "hyperbook",
        "spread_widen",
        "Traders can pull their resting orders, removing support or resistance instantly.",
        "When buy orders below price vanish, there is less to catch price, so it can fall faster.",
        "Disappearing orders are an early warning a move could speed up.",
        "Liquidity withdrawal precedes impulsive moves; the book thins before it runs.",
        [{ text: "LIQUIDITY PULL", anchor: "bl", tone: "warn" }],
        "Sometimes the resting orders suddenly disappear, because traders pull their orders. When the buy orders below the price vanish, there is less support underneath. That means price can fall faster, because fewer buyers are waiting to catch it. Disappearing liquidity is an early warning that a move could speed up.",
      ),
      step(
        7,
        "What creates dangerous execution?",
        "hyperbook",
        "spread_widen",
        "Danger builds when the spread widens and liquidity thins at the same time.",
        "A market order can then fill far from the expected price — that gap is slippage.",
        "Wide spread plus thin book = your order can fill at a bad price.",
        "Spread expansion into thin depth = elevated slippage; switch to limits or cut size.",
        [
          { text: "SPREAD WIDENING", anchor: "center", tone: "warn" },
          { text: "DANGER ZONE", anchor: "br", tone: "bad" },
        ],
        "Execution becomes dangerous when the spread widens and liquidity thins out at the same time. In those conditions, a market order can fill far away from the price you expected. That difference is called slippage. The safest response is to slow down — use a limit order, reduce your size, or wait for the market to calm and the spread to tighten.",
      ),
      step(
        8,
        "How professionals use this panel",
        "hyperbook",
        "spread_compress",
        "Pros read the book to judge fill quality before they ever place a trade.",
        "Check the spread, find where real size rests, and watch if it holds or disappears.",
        "Trade when liquidity is healthy; stand aside when it is thin.",
        "Pre-trade: grade spread, map resting size, confirm reload vs. vacuum, then size.",
        [
          { text: "SPREAD", anchor: "center", tone: "warn" },
          { text: "BIDS", anchor: "bl", tone: "good" },
          { text: "ASKS", anchor: "tr", tone: "bad" },
        ],
        "Here is how professionals read this panel. Before clicking buy or sell, they check the spread to judge the cost, scan both sides for where the real size is resting, and watch whether that size holds or disappears when trades hit it. They trade when liquidity is healthy, and they stand aside when it is thin. The order book tells you the quality of your fill before you ever place the trade. When you are ready, press Watch It Happen to see these changes play out on a real market example.",
      ),
    ],
  },

  chart: {
    id: "lesson-chart",
    panelId: "chart",
    title: "Reading structure & volatility",
    objective: "Learn when a breakout is real vs a trap.",
    replayScenarioId: "sc-vol-fomc-eth",
    steps: [
      step(
        1,
        "Identify the regime — trend, range, or stress.",
        "surveillance",
        "vol_expand",
        "Regime decides which playbook is valid.",
        "Trend = follow; range = fade edges; stress = stand aside.",
        "First ask: is the market trending, chopping, or panicking?",
        "Regime mismatch is the #1 cause of good setups failing.",
      ),
      step(
        2,
        "Mark the key level price is testing.",
        "chart",
        "breakout",
        "Levels are where decisions cluster.",
        "A clean break + hold = continuation; a poke + reject = trap.",
        "Draw a line where price keeps reacting.",
        "Acceptance beyond the level matters more than the first touch.",
      ),
      step(
        3,
        "Watch volatility expand on the break.",
        "chart",
        "vol_expand",
        "Breakouts release stored energy as volatility.",
        "Expansion with tight spread = healthy. Expansion with wide spread = unstable.",
        "Big candles mean the market woke up — check if it's clean.",
        "Pair vol expansion with book quality before committing size.",
      ),
      step(
        4,
        "Confirm on the retest.",
        "hyperbook",
        "bid_stack",
        "Retests reveal whether new buyers defend the level.",
        "Bids reload above old resistance = continuation confirmed.",
        "Does price come back, test the line, and hold?",
        "Enter on the retest hold, not the emotional first break.",
      ),
    ],
  },

  alerts: {
    id: "lesson-alerts",
    panelId: "alerts",
    title: "From alert to action",
    objective: "Turn a tripwire into a disciplined decision.",
    replayScenarioId: "sc-liq-cascade-btc",
    steps: [
      step(
        1,
        "An alert fires — read the rule and severity.",
        "alerts",
        "liquidation",
        "Alerts are exceptions worth a look, not entries.",
        "Critical severity = drop what you're doing and check.",
        "A bell rang — find out why before reacting.",
        "Two confirming rules in 60s = high-conviction interrupt.",
      ),
      step(
        2,
        "Jump to the tape to see the flow behind it.",
        "intelligence",
        "tape_sell",
        "The alert summarizes; the tape shows the raw behavior.",
        "Cluster of large sells = cascade risk building.",
        "Look at the actual buys/sells that set off the alarm.",
        "Grade whether flow is initiative or absorption.",
      ),
      step(
        3,
        "Confirm on the book before doing anything.",
        "hyperbook",
        "spread_widen",
        "Price can already be extended by the time you look.",
        "Wide spread + thin bids = do NOT chase with market.",
        "Check if it's already too late / too expensive to enter.",
        "Late + thin = stand aside; reload + tight = act with plan.",
      ),
      step(
        4,
        "Decide: act, wait, or reduce.",
        "positions",
        "flow_imbalance",
        "Only execution changes your risk.",
        "If exposed and against the flow, reduce with reduce-only limits.",
        "Now choose: do nothing, trim, or take the trade.",
        "Pre-defined response beats improvising under pressure.",
      ),
    ],
  },

  derivdesk: {
    id: "lesson-derivdesk",
    panelId: "derivdesk",
    title: "Funding, crowding & squeezes",
    objective: "Spot crowded trades before they unwind.",
    replayScenarioId: "sc-funding-squeeze",
    steps: [
      step(
        1,
        "Read the funding rate and its sign.",
        "derivdesk",
        "funding_flip",
        "Funding is the cost longs pay shorts (or vice versa).",
        "High positive funding = crowded longs paying to stay in.",
        "Funding tells you which side is crowded and paying up.",
        "Extreme funding is fuel for a reversal, not a direction signal.",
      ),
      step(
        2,
        "Check open interest direction.",
        "derivdesk",
        "vol_expand",
        "Rising OI + extreme funding = more fragile positioning.",
        "Crowded + leveraged = one catalyst can trigger a cascade.",
        "Are more people piling into the crowded side?",
        "OI build into funding extreme = primed for a squeeze.",
      ),
      step(
        3,
        "Watch for the funding flip.",
        "alerts",
        "funding_flip",
        "A flip forces the crowded side to unwind together.",
        "Longs exit at once → fast move against the crowd.",
        "When the cost flips, the crowd rushes for the exit.",
        "The flip is the trigger; map liquidation levels beforehand.",
      ),
    ],
  },
};

type Family = "execution" | "tape" | "volatility" | "portfolio" | "macro" | "platform";

function familyFor(panelId: string): Family {
  if (["hyperbook", "domladder", "ticket", "slippageradar", "liveexec"].includes(panelId)) return "execution";
  if (["intelligence", "alerts", "intelengine", "newswire", "proactive"].includes(panelId)) return "tape";
  if (["surveillance", "chart", "derivdesk", "memorydesk", "alphalab"].includes(panelId)) return "volatility";
  if (["positions", "portfoliodesk"].includes(panelId)) return "portfolio";
  if (["macro", "globaldesk", "globalstrategy", "decision"].includes(panelId)) return "macro";
  return "platform";
}

const FAMILY_LESSON: Record<Family, string> = {
  execution: "hyperbook",
  tape: "alerts",
  volatility: "chart",
  portfolio: "alerts",
  macro: "chart",
  platform: "hyperbook",
};

export class GuidedLessonEngine {
  static forPanel(panelId: string): GuidedLesson {
    const direct = LESSONS[panelId];
    if (direct) return direct;
    const playbook = OperationalPlaybooks.get(panelId);
    const base = LESSONS[FAMILY_LESSON[familyFor(panelId)]];
    return {
      ...base,
      id: `lesson-${panelId}`,
      panelId,
      replayScenarioId: playbook.replayScenarioId,
    };
  }

  static hasDedicated(panelId: string): boolean {
    return Boolean(LESSONS[panelId]);
  }
}
