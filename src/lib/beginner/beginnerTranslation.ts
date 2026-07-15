import type { OnboardingStepId } from "@/types/commercial-product";
import type { MorningTaskId, ReviewTaskId, TradingTaskId } from "@/lib/operator-mode/OperatorModeEngine";

export type BeginnerConceptId =
  | "wallet"
  | "hyperliquid"
  | "agent-1ct"
  | "order-book"
  | "execution-plan"
  | "operator-mode"
  | "daily-briefing"
  | "market-state"
  | "daily-operations"
  | "live-desk"
  | "liquidity"
  | "volatility"
  | "execution"
  | "operator-journal"
  | "trade-ticket"
  | "platform";

export interface WhatIsThisEntry {
  term: string;
  body: string;
}

export const WHAT_IS_THIS: Record<BeginnerConceptId, WhatIsThisEntry> = {
  platform: {
    term: "Equilibrium Terminal",
    body: "A professional trading workspace for crypto. It helps you read the market, plan trades, and stay organized — you stay in control.",
  },
  wallet: {
    term: "Wallet",
    body: "A wallet is your crypto account. It lets you hold assets and connect to trading platforms.",
  },
  hyperliquid: {
    term: "Hyperliquid",
    body: "Hyperliquid is the exchange powering this platform. Prices and trades run through it.",
  },
  "agent-1ct": {
    term: "Agent / 1CT",
    body: "A one-time permission allowing the platform to place trades you approve — so you do not sign every single click.",
  },
  "order-book": {
    term: "Order Book",
    body: "A live list of buyers and sellers. It shows who wants to buy, who wants to sell, and at what price.",
  },
  "execution-plan": {
    term: "Execution Plan",
    body: "A short written plan before placing a trade — what you might buy or sell, how much, and when you will stand aside.",
  },
  "operator-mode": {
    term: "Operator Mode",
    body: "Your daily checklist. It walks you through what to review each morning before you trade.",
  },
  "daily-briefing": {
    term: "Daily Briefing",
    body: "A summary of what deserves your attention today — market mood, risks, and session context.",
  },
  "market-state": {
    term: "Market State",
    body: "Current market conditions — calm, active, thin, or stressed. Match your speed and size to conditions.",
  },
  "daily-operations": {
    term: "Daily Operations",
    body: "Your morning routine panel — session timing, risk reminders, and operational context in one place.",
  },
  "live-desk": {
    term: "Live Desk",
    body: "A quick glance at timers and desk tone — funding countdown, session clock, and how the day feels.",
  },
  liquidity: {
    term: "Liquidity",
    body: "How easy it is to buy or sell without moving the price much. Thin liquidity means harder, costlier trades.",
  },
  volatility: {
    term: "Volatility",
    body: "How fast prices are moving. Higher volatility means bigger swings — usually use smaller size.",
  },
  execution: {
    term: "Execution",
    body: "How you enter or exit a trade — market, limit, size, and timing.",
  },
  "operator-journal": {
    term: "Operator Journal",
    body: "Where you write what you did and why — so you can learn from each session.",
  },
  "trade-ticket": {
    term: "Trade Ticket",
    body: "The form where you place buy or sell orders. Only submits real trades when your wallet is connected and approved.",
  },
};

export const WHY_AM_I_DOING_THIS: Partial<Record<OnboardingStepId, string>> = {
  welcome: "So you know what this tool is before anything else.",
  workspace_template: "So you start on a clean desk instead of dozens of panels at once.",
  exchange_connect: "So the platform can show your account and eventually place trades you approve.",
  start_operator_mode: "So you have a simple daily checklist — what to review before trading.",
  start_learning: "Optional — lessons explain terms in depth and unlock advanced checklists.",
  execution_desk: "So your screen shows the panels you need for planning and trading.",
  complete: "You are set up. Follow Operator Mode each morning.",
};

export const ONBOARDING_WHAT_IS: Partial<Record<OnboardingStepId, BeginnerConceptId>> = {
  exchange_connect: "wallet",
  start_operator_mode: "operator-mode",
  execution_desk: "trade-ticket",
};

export const PANEL_BEGINNER_TITLES: Record<string, { title: string; subtitle?: string; concept?: BeginnerConceptId }> = {
  hyperbook: { title: "Order Book", subtitle: "Live buyers & sellers", concept: "order-book" },
  operatormode: { title: "Daily Checklist", subtitle: "Operator Mode", concept: "operator-mode" },
  dailybriefing: { title: "Daily Briefing", subtitle: "What matters today", concept: "daily-briefing" },
  marketstate: { title: "Market Conditions", subtitle: "Calm · Active · Thin · Stress", concept: "market-state" },
  dailyops: { title: "Morning Routine", subtitle: "Daily Operations", concept: "daily-operations" },
  ticket: { title: "Trade Ticket", subtitle: "Place buy/sell orders", concept: "trade-ticket" },
  positions: { title: "Your Positions", subtitle: "Open trades & profit/loss" },
  operatorjournal: { title: "Session Notes", subtitle: "Operator Journal", concept: "operator-journal" },
  chart: { title: "Price Chart", subtitle: "How price is moving" },
  domladder: { title: "Order Ladder", subtitle: "Depth at each price" },
};

export const MORNING_TASK_BEGINNER: Record<
  MorningTaskId,
  { label: string; detail: string; why: string; concept?: BeginnerConceptId }
> = {
  "daily-briefing": {
    label: "Read today's briefing",
    detail: "See what deserves attention — outlook, volatility, and session context.",
    why: "To understand today's market conditions before trading.",
    concept: "daily-briefing",
  },
  "market-state": {
    label: "Check market conditions",
    detail: "Calm, active, thin, or stressed — match your behavior to the day.",
    why: "So you do not trade too aggressively on a dangerous day.",
    concept: "market-state",
  },
  "daily-operations": {
    label: "Review your morning routine",
    detail: "Session timing, risk reminders, and operational context.",
    why: "So you start the session with full situational awareness.",
    concept: "daily-operations",
  },
  "live-desk": {
    label: "Glance at Live Desk",
    detail: "Funding timer, session clock, and desk tone.",
    why: "So you know time-sensitive context before you click anything.",
    concept: "live-desk",
  },
  "execution-plan": {
    label: "Write your trade plan",
    detail: "Entries, size, and rules for when you will not trade.",
    why: "So you trade from a plan — not impulse.",
    concept: "execution-plan",
  },
};

export const TRADING_TASK_BEGINNER: Record<
  TradingTaskId,
  { label: string; detail: string; why: string; concept?: BeginnerConceptId }
> = {
  liquidity: {
    label: "Liquidity checked",
    detail: "How easy is it to buy or sell right now?",
    why: "Thin liquidity makes trades harder and more expensive.",
    concept: "liquidity",
  },
  spread: {
    label: "Spread checked",
    detail: "Is the gap between buy and sell price acceptable?",
    why: "A wide spread is an hidden cost on your trade.",
    concept: "order-book",
  },
  volatility: {
    label: "Volatility checked",
    detail: "How fast are prices moving?",
    why: "Fast markets need smaller size and more caution.",
    concept: "volatility",
  },
  "position-size": {
    label: "Size checked",
    detail: "Is your trade size appropriate for your plan?",
    why: "Oversizing is the fastest way to lose control.",
  },
  "market-state": {
    label: "Conditions re-checked",
    detail: "Does the market still support your trade?",
    why: "Conditions change — confirm before you click.",
    concept: "market-state",
  },
};

export const REVIEW_TASK_BEGINNER: Record<
  ReviewTaskId,
  { label: string; detail: string; why: string; concept?: BeginnerConceptId }
> = {
  "journal-updated": {
    label: "Notes updated",
    detail: "Log what you did while it is fresh.",
    why: "So you can learn from today tomorrow.",
    concept: "operator-journal",
  },
  "session-reviewed": {
    label: "Session reviewed",
    detail: "What kind of day was this?",
    why: "Patterns emerge when you review consistently.",
  },
  "mistakes-reviewed": {
    label: "Mistakes reviewed",
    detail: "What would you do differently?",
    why: "Improvement comes from honest review — not self-criticism.",
  },
  "lessons-recorded": {
    label: "Takeaway recorded",
    detail: "One lesson for tomorrow.",
    why: "So the next session starts smarter.",
  },
};

export const BEGINNER_GUIDANCE: Record<string, string> = {
  "daily-briefing": "Read today's briefing — understand conditions before trading.",
  "market-state": "Check market conditions — calm, active, thin, or stressed.",
  "daily-operations": "Review your morning routine panel.",
  "live-desk": "Glance at Live Desk timers in the header.",
  "execution-plan": "Write a short trade plan before placing orders.",
  liquidity: "Check how easy it is to buy or sell on the Order Book.",
  spread: "Check the spread — the hidden cost between buy and sell.",
  volatility: "Check how fast prices are moving.",
  "position-size": "Confirm your trade size matches your plan.",
  "market-state-trading": "Re-check market conditions before you trade.",
  "journal-updated": "Update your session notes.",
  "session-reviewed": "Review how the session went.",
  "mistakes-reviewed": "Note what you would do differently.",
  "lessons-recorded": "Write one takeaway for tomorrow.",
};

export const FIRST_FIFTEEN_MINUTES = {
  title: "Your first 15 minutes",
  sections: [
    {
      q: "What is this?",
      a: "A professional crypto trading workspace. Read the market, plan trades, and stay organized. You make every decision.",
    },
    {
      q: "What should I do first?",
      a: "Follow the Daily Checklist (Operator Mode) at the top. Complete the morning steps before using the Trade Ticket.",
    },
    {
      q: "What should I ignore?",
      a: "Desk chips (EX, MA, VO…), EXPAND, and LEARNING until you finish the morning checklist. Ignore anything you do not understand yet.",
    },
    {
      q: "Is this real money?",
      a: "Not until you connect a wallet AND approve the agent. Until then you are in read-only mode. The header shows CONNECTED or NOT CONNECTED and LIVE or READ ONLY.",
    },
    {
      q: "How do I learn safely?",
      a: "Use Operator Mode daily. Open LEARNING when you want deeper lessons. Start with small size when you go live.",
    },
  ],
} as const;

export type MoneyConnectionLabel = "CONNECTED" | "NOT CONNECTED";
export type MoneyTradingLabel = "READ ONLY" | "PAPER" | "LIVE";

export function resolveMoneySafety(opts: {
  isConnected: boolean;
  isAuthorized: boolean;
  deskMode?: "paper" | "live";
  hasDeskSession?: boolean;
}): { connection: MoneyConnectionLabel; trading: MoneyTradingLabel; hint: string } {
  const mode = opts.deskMode ?? "paper";
  if (!opts.isConnected) {
    return {
      connection: "NOT CONNECTED",
      trading: "READ ONLY",
      hint: "No wallet linked — you cannot place trades.",
    };
  }
  if (mode === "paper") {
    return {
      connection: "CONNECTED",
      trading: "PAPER",
      hint: "Simulated fills at live prices — no real funds at risk.",
    };
  }
  if (!opts.hasDeskSession) {
    return {
      connection: "CONNECTED",
      trading: "READ ONLY",
      hint: "Sign desk session in the header before live trading.",
    };
  }
  if (!opts.isAuthorized) {
    return {
      connection: "CONNECTED",
      trading: "READ ONLY",
      hint: "Wallet linked — approve the agent to enable live Hyperliquid orders.",
    };
  }
  return {
    connection: "CONNECTED",
    trading: "LIVE",
    hint: "Live mainnet execution — orders use real funds. Trade small until confident.",
  };
}

export function beginnerPanelTitle(panelId: string, institutionalTitle: string): string {
  return PANEL_BEGINNER_TITLES[panelId]?.title ?? institutionalTitle;
}

export function beginnerPanelSubtitle(panelId: string): string | undefined {
  return PANEL_BEGINNER_TITLES[panelId]?.subtitle;
}

export function beginnerGuidanceForTask(taskId: string): string | null {
  return BEGINNER_GUIDANCE[taskId] ?? null;
}
