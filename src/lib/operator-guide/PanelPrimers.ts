import type { ComponentGuideEntry } from "@/types/operator-guide";

/**
 * PANEL PRIMERS — the plain-English foundation shown FIRST in every panel's
 * Explain drawer, before any pro-level interpretation.
 *
 * The structure answers, in order, the four questions a new user actually has:
 *   1. WHAT IS THIS?      a one-line, jargon-free definition
 *   2. WHAT IS IT FOR?    why the panel exists / the problem it solves
 *   3. HOW DOES IT WORK?  the mechanics, explained simply
 *   4. HOW DO I USE IT?   concrete, do-this-now steps
 *
 * Bespoke primers are authored for the panels people actually open. Anything
 * without one falls back to a primer generated from the registry entry, so no
 * panel is ever left jumping straight into the deep end.
 */
export interface PanelPrimer {
  whatItIs: string;
  whatItsFor: string;
  howItWorks: string;
  howToUse: string[];
}

const PRIMERS: Record<string, PanelPrimer> = {
  hyperbook: {
    whatItIs:
      "The order book — a live list of everyone waiting to buy (green) and sell (red) this asset right now, sorted by price.",
    whatItsFor:
      "It shows you where the buyers and sellers are, so you can judge whether it's a good moment to trade and roughly what it will cost.",
    howItWorks:
      "Buyers wait below the current price hoping to buy cheaper; sellers wait above hoping to sell higher. The length of each bar is how much size is waiting at that price. The small gap in the middle is the spread — the instant cost of trading.",
    howToUse: [
      "Look at the spread first — a small gap means it's cheap to trade right now.",
      "Find the thick bars (walls); price often slows down when it reaches them.",
      "Watch the bars near the price: if they shrink, liquidity is thinning and price can move faster.",
      "New to this? Press “Teach me this” for the full guided walkthrough.",
    ],
  },
  chart: {
    whatItIs:
      "The price chart — a picture of how the asset's price has moved over time, with context like the current market regime and stress level.",
    whatItsFor:
      "To see the bigger picture — the trend, the key price levels, and whether conditions are calm or volatile — before you commit to a trade.",
    howItWorks:
      "Each candle shows the open, high, low and close for a slice of time. The ribbon and gauges on top tell you whether the market is trending or just chopping sideways, and how stressed liquidity is.",
    howToUse: [
      "Pick a timeframe that matches how long you plan to hold (short = 1–5m, longer = 1h+).",
      "Find the overall direction: higher highs = uptrend, lower lows = downtrend.",
      "Note nearby levels where price reacted before — they often matter again.",
      "Glance at the regime and stress readout before sizing up.",
    ],
  },
  intelligence: {
    whatItIs:
      "A live feed of the most important things happening right now — big trades, funding changes, and liquidation risk — ranked by importance.",
    whatItsFor: "To catch unusual activity fast, so a big move doesn't blindside you.",
    howItWorks:
      "It scans the market constantly and posts short alerts. The critical ones are worth reacting to; the lower ones are just background context.",
    howToUse: [
      "Scan the top items — they're ranked most-important first.",
      "Tap an item to jump to the chart and confirm what it's pointing at.",
      "Treat a critical alert as a reason to slow down and check the order book.",
      "Never act on a single alert alone — confirm it first.",
    ],
  },
  ticket: {
    whatItIs: "The order form — where you actually place a buy or sell order.",
    whatItsFor:
      "This is the one panel that changes your money. Everything else is information; this is where you act on it.",
    howItWorks:
      "You choose a side (buy or sell), a size, and a price type. A market order trades immediately at whatever price is available; a limit order waits for the exact price you set.",
    howToUse: [
      "Decide buy or sell, and how much.",
      "Check the slippage radar first so you know the likely cost.",
      "Use a limit order when you can — it controls the price you pay.",
      "Turn on “reduce only” when you're closing a position, not adding to one.",
    ],
  },
  positions: {
    whatItIs:
      "Your open trades — what you currently hold, the price you got in at, and whether you're up or down.",
    whatItsFor:
      "To know your real risk right now, straight from the exchange — not just what you intended to do.",
    howItWorks:
      "Each row is a live position. It updates as the price moves, showing your unrealized profit or loss and how much margin it's using.",
    howToUse: [
      "After every trade, check it shows up here as you expected.",
      "Watch the unrealized PnL to see how a position is doing.",
      "Keep an eye on margin usage so you don't over-extend.",
      "Connect your wallet to see your live positions.",
    ],
  },
  domladder: {
    whatItIs: "A zoomed-in, tick-by-tick view of the order book, lined up by price level.",
    whatItsFor:
      "For precise entries and exits at exact price levels, and for spotting fake or disappearing orders.",
    howItWorks:
      "Each price level shows the size resting there and which side is trading into it. Levels that keep refilling — or suddenly vanish — reveal real versus fake interest.",
    howToUse: [
      "Use it when you want to get in or out at a specific price.",
      "Watch a big level: if it keeps pulling away as price approaches, the support is fake.",
      "Notice which side is doing the aggressive trading.",
      "Check the slippage radar before sending market orders here.",
    ],
  },
  slippageradar: {
    whatItIs: "A pre-trade cost estimate — it tells you how much price you might lose by trading right now.",
    whatItsFor:
      "To avoid nasty surprises. It warns you before an order could fill far from the price you expected.",
    howItWorks:
      "It looks at the current spread and how much size is waiting, then estimates the slippage — the extra cost — for your order size.",
    howToUse: [
      "Check it before every market order.",
      "High impact reading? Use a limit order or trade a smaller size.",
      "A stable, low reading means it's reasonable to trade now.",
      "Re-check it during fast, volatile moments.",
    ],
  },
  alerts: {
    whatItIs:
      "An automatic watchdog that flags specific events for you — big trades, funding flips, or clusters of liquidations.",
    whatItsFor:
      "You can't watch every number at once. This watches for you and pings when something worth noticing happens.",
    howItWorks:
      "Rules describe what to watch for. When the market meets a rule, an alert fires with a plain-English note on what it means.",
    howToUse: [
      "Read the alert's “why it matters” line first.",
      "Click it to focus the chart and confirm in the order book.",
      "Treat a cluster of large sells as an early cascade warning.",
      "Mute noisy rules so only the important ones reach you.",
    ],
  },
  surveillance: {
    whatItIs: "A read on the market's current mood — is it trending, chopping sideways, calm, or stressed?",
    whatItsFor: "Different conditions need different tactics. This tells you which playbook fits right now.",
    howItWorks:
      "It works out the current “regime” from how price is behaving and measures how stressed liquidity is, then summarizes both.",
    howToUse: [
      "Glance here before increasing your size.",
      "Trend + low stress = momentum tactics may work.",
      "High stress = reduce size and stay defensive.",
      "Re-check whenever conditions feel like they've shifted.",
    ],
  },
  livementor: {
    whatItIs: "A calm built-in coach that explains live market events in plain English as they happen.",
    whatItsFor: "So you can understand what's going on in real time without needing outside help.",
    howItWorks:
      "When something notable happens, it writes what happened, why it matters, what to check next, and what mistake to avoid.",
    howToUse: [
      "Read the four-part explanation for any event.",
      "Pin important moments to revisit them later.",
      "Switch between beginner and pro depth.",
      "Use it to confirm meaning, then act on your own read.",
    ],
  },
  operatorjournal: {
    whatItIs: "A trading journal built into the terminal — it tracks your sessions, decisions, and execution quality.",
    whatItsFor: "Traders improve by reviewing what they did, not just by trading more.",
    howItWorks:
      "You log your reasoning, mood, and confidence on decisions. It grades your execution and flags risky behaviour like revenge-trading.",
    howToUse: [
      "Log a short note when you make a decision.",
      "Run the end-of-session review.",
      "Read the behavioural flags honestly.",
      "Replay a decision to see the market context around it.",
    ],
  },
  derivdesk: {
    whatItIs: "The derivatives view — funding rates, open interest, and volatility for perpetual contracts.",
    whatItsFor: "To see how crowded and stretched positioning is, which drives squeezes and sharp reversals.",
    howItWorks:
      "Funding shows who's paying whom to hold positions; open interest shows how many contracts are open. Together they reveal crowding.",
    howToUse: [
      "Check funding extremes for crowded trades.",
      "Rising open interest + extreme funding = unwind risk.",
      "Review it before holding through a funding payment.",
      "Pair it with surveillance for the full risk picture.",
    ],
  },
  macro: {
    whatItIs: "A snapshot of the broader markets — interest rates, the dollar, and stock indices.",
    whatItsFor: "Crypto reacts to the wider financial world. This sets the mood before you trade.",
    howItWorks: "It tracks the key cross-asset numbers that tend to push risk appetite up or down.",
    howToUse: [
      "Glance at the dollar and yields before the session.",
      "A strong dollar or rising yields often pressures crypto.",
      "Avoid big size right before major economic announcements.",
      "Use it as context, not as a trade trigger.",
    ],
  },
  execintel: {
    whatItIs: "Order-flow analytics — a deeper look at who's buying and selling aggressively, and how good your fills were.",
    whatItsFor: "To judge your execution quality and spot hidden buyers or sellers.",
    howItWorks:
      "It measures aggression, sweeps, and imbalance in the stream of trades, both before and after you execute.",
    howToUse: [
      "Review it after a large fill to grade your execution.",
      "Watch aggressor imbalance to see who has initiative.",
      "Suspect hidden size when levels keep refilling.",
      "Pair it with the DOM ladder.",
    ],
  },
  portfoliodesk: {
    whatItIs: "A portfolio-wide view of everything you hold across assets.",
    whatItsFor: "Focusing on one coin hides your total risk. This shows net exposure and correlation.",
    howItWorks: "It adds your positions up into total exposure, leverage, and risk measures.",
    howToUse: [
      "Check your total exposure, not just one coin.",
      "Watch for concentration in assets that move together.",
      "Reduce or hedge when systemic stress is high.",
      "Use it for treasury-style allocation decisions.",
    ],
  },
  newswire: {
    whatItIs: "An operational news and incident feed — ranked updates, outages, and briefings.",
    whatItsFor: "To stay aware of events that affect trading, without the noise of social media.",
    howItWorks: "It ranks incoming items by importance and can deliver the critical ones straight to you.",
    howToUse: [
      "Skim the ranked items for anything market-moving.",
      "Treat an exchange outage as a reason to cut size.",
      "Enable delivery for critical incidents only.",
      "Cross-check big news against the live tape.",
    ],
  },
  memorydesk: {
    whatItIs: "A library of past market conditions you can replay and compare to now.",
    whatItsFor: "Markets rhyme. Comparing today to a similar past moment sharpens your judgment.",
    howItWorks: "It finds historical situations that match current conditions and lets you replay them.",
    howToUse: [
      "Search for a past regime similar to now.",
      "Replay it to see how it played out.",
      "Default to caution if the closest match was a crash.",
      "Use it before sizing into unfamiliar volatility.",
    ],
  },
};

/** Turn dense registry copy into a readable fallback primer. */
function generatedPrimer(entry: ComponentGuideEntry): PanelPrimer {
  const howToUse =
    entry.useCases.length > 0
      ? entry.useCases.slice(0, 4)
      : ["Open it when this part of the workflow matters.", "Read the outputs in the context of the current asset and conditions."];
  return {
    whatItIs: entry.operationalExplanation,
    whatItsFor: entry.whyItMatters,
    howItWorks: entry.professionalUsage,
    howToUse,
  };
}

export class PanelPrimers {
  static for(entry: ComponentGuideEntry): PanelPrimer {
    return PRIMERS[entry.id] ?? generatedPrimer(entry);
  }

  static has(id: string): boolean {
    return Boolean(PRIMERS[id]);
  }
}
