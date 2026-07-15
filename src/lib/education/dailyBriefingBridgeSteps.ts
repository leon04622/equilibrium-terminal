import { DailyBriefingCoach } from "@/lib/education/dailyBriefingCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type DBBridgePanel = "dailybriefing";

export type DBBridgeRegion =
  | "panel"
  | "summary"
  | "market-outlook"
  | "risk-outlook"
  | "opportunity-outlook"
  | "guidance"
  | "recommendations"
  | "bullets"
  | null;

export type DBBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface DBRecognitionSpec {
  prompt: string;
  accept: Exclude<DBBridgeRegion, null>[];
  nudge: string;
}

export interface DBBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: DBBridgeMode;
  bridgePanel: DBBridgePanel;
  region: DBBridgeRegion;
  whyCare?: (ctx: ReturnType<typeof DailyBriefingCoach.contextLive>) => string;
  coach: (ctx: ReturnType<typeof DailyBriefingCoach.contextLive>) => string;
  recognize?: DBRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const DAILY_BRIEFING_BRIDGE_PANEL = "dailybriefing";

export const DAILY_BRIEFING_REQUIRED_CONCEPTS = [
  "identify-summary",
  "identify-market-outlook",
  "identify-risk-outlook",
  "identify-opportunity-outlook",
  "identify-guidance",
  "identify-recommendations",
  "daily-briefing-workflow-ready",
  "daily-briefing-certified",
];

const BRIEFED_OPERATOR: CompareSide = {
  id: "briefed",
  title: "BRIEFED OPERATOR",
  good: true,
  traits: ["Reads briefing first", "Knows today's risks", "Matches plan to outlook", "Prepares before tickets"],
};

const IMPULSIVE_TRADER: CompareSide = {
  id: "impulsive",
  title: "IMPULSIVE TRADER",
  good: false,
  traits: ["Opens tickets immediately", "Ignores risk outlook", "Same prep every day", "Reactive to headlines"],
};

export const DAILY_BRIEFING_BRIDGE_STEPS: DBBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Daily Briefing Engine panel",
    bridgePanel: "dailybriefing",
    region: "panel",
    coach: (ctx) => DailyBriefingCoach.todayReadout(ctx),
    whyCare: () => "The briefing creates context before action — separate from hunting for trades.",
  },
  {
    id: "summary",
    mode: "explain",
    chapter: "SUMMARY",
    title: "What matters today",
    bridgePanel: "dailybriefing",
    region: "summary",
    coach: (ctx) => DailyBriefingCoach.summaryAdvice(ctx),
    whyCare: () => "The summary headline frames your entire session before you touch a chart.",
  },
  {
    id: "market-outlook",
    mode: "explain",
    chapter: "MARKET OUTLOOK",
    title: "Calm · active · stressed",
    bridgePanel: "dailybriefing",
    region: "market-outlook",
    coach: (ctx) => DailyBriefingCoach.marketOutlookAdvice(ctx),
    whyCare: () => "Market outlook tells you what kind of tape to expect today.",
  },
  {
    id: "risk-outlook",
    mode: "explain",
    chapter: "RISK OUTLOOK",
    title: "Elevated risks today",
    bridgePanel: "dailybriefing",
    region: "risk-outlook",
    coach: (ctx) => DailyBriefingCoach.riskOutlookAdvice(ctx),
    whyCare: () => "Risk outlook highlights what could hurt you — macro, alerts, regime stress.",
  },
  {
    id: "opportunity-outlook",
    mode: "explain",
    chapter: "OPPORTUNITY OUTLOOK",
    title: "Favorable vs limited",
    bridgePanel: "dailybriefing",
    region: "opportunity-outlook",
    coach: (ctx) => DailyBriefingCoach.opportunityOutlookAdvice(ctx),
    whyCare: () => "Not every day offers the same edge — opportunity outlook prevents forcing trades.",
  },
  {
    id: "guidance",
    mode: "explain",
    chapter: "OPERATIONAL GUIDANCE",
    title: "How to prepare",
    bridgePanel: "dailybriefing",
    region: "guidance",
    coach: (ctx) => DailyBriefingCoach.guidanceAdvice(ctx),
    whyCare: () => "Guidance translates outlook into behavior — what to do with what you learned.",
  },
  {
    id: "recommendations",
    mode: "explain",
    chapter: "RECOMMENDATIONS",
    title: "Session priorities",
    bridgePanel: "dailybriefing",
    region: "recommendations",
    coach: (ctx) => DailyBriefingCoach.recommendationsAdvice(ctx),
    whyCare: () => "Recommendations distill the briefing into actionable session priorities.",
  },
  {
    id: "bullets",
    mode: "explain",
    chapter: "BRIEFING ITEMS",
    title: "Supporting bullets",
    bridgePanel: "dailybriefing",
    region: "bullets",
    coach: (ctx) => {
      const items = ctx.outlook.briefing.bullets.slice(0, 3).map((b) => b.headline).join(" · ");
      return `Live briefing items: ${items || "Building as session data loads."}`;
    },
    whyCare: () => "Bullets carry overnight narrative, macro, liquidity, and alert context.",
  },
  {
    id: "workflow",
    mode: "explain",
    chapter: "WORKFLOW",
    title: "Read briefing before trading",
    bridgePanel: "dailybriefing",
    region: "panel",
    coach: () => "Open terminal → read briefing → review state → build plan → execute.",
  },
  {
    id: "compare-briefed",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Briefed vs impulsive",
    bridgePanel: "dailybriefing",
    region: "panel",
    compare: { good: BRIEFED_OPERATOR, bad: IMPULSIVE_TRADER },
    coach: () => "The Daily Briefing Engine exists so you operate like the briefed operator.",
  },
  {
    id: "decide-elevated-risk",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Risk outlook elevated",
    bridgePanel: "dailybriefing",
    region: "risk-outlook",
    decide: {
      prompt: "Risk outlook reads ELEVATED. Should you open tickets without reading the briefing?",
      options: [
        { id: "prep", label: "Read full briefing and adjust plan first", traits: ["Prepared", "Respects risk"], correct: true },
        { id: "trade", label: "Trade anyway — risk is just noise", traits: ["Unprepared"], correct: false },
        { id: "max", label: "Max size — volatility is opportunity", traits: ["Compounds risk"], correct: false },
      ],
      explanation: "Elevated risk demands preparation — the briefing exists to inform your plan before action.",
    },
    coach: () => "When risk is elevated, preparation is not optional.",
  },
  {
    id: "decide-limited-opp",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Opportunity limited",
    bridgePanel: "dailybriefing",
    region: "opportunity-outlook",
    decide: {
      prompt: "Opportunity outlook reads LIMITED. What should receive attention?",
      options: [
        { id: "patience", label: "Patience and capital preservation", traits: ["Respects outlook", "Professional"], correct: true },
        { id: "force", label: "Force trades — something must work", traits: ["Forcing edge"], correct: false },
        { id: "ignore", label: "Ignore briefing — scan charts harder", traits: ["Reactive"], correct: false },
      ],
      explanation: "Limited opportunity days reward patience — the briefing tells you when not to press.",
    },
    coach: () => "Professional operators wait when the briefing says opportunity is limited.",
  },
  {
    id: "coach-examples",
    mode: "explain",
    chapter: "OPERATOR COACH",
    title: "Briefing alerts",
    bridgePanel: "dailybriefing",
    region: "panel",
    coach: (ctx) => {
      const line = DailyBriefingCoach.alertLine(ctx);
      return `${line} Examples: Today's environment favors patience. Risk conditions elevated. Liquidity healthy. Volatility expected to expand.`;
    },
    whyCare: () => "The briefing interprets conditions so you prepare instead of reacting blind.",
  },
  {
    id: "recognize-summary",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find briefing summary",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-summary",
    recognize: {
      prompt: "Your turn — click the summary section.",
      accept: ["summary"],
      nudge: "Look for the summary headline at the top of the panel.",
    },
    coach: () => "Click the summary section.",
  },
  {
    id: "recognize-market",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find market outlook",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-market-outlook",
    recognize: {
      prompt: "Now click the market outlook — calm, active, or stressed.",
      accept: ["market-outlook"],
      nudge: "That's the block showing calm, active, or stressed.",
    },
    coach: () => "Click the market outlook.",
  },
  {
    id: "recognize-risk",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find risk outlook",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-risk-outlook",
    recognize: {
      prompt: "Find the risk outlook and click it.",
      accept: ["risk-outlook"],
      nudge: "Look for the risk level — low, elevated, or high.",
    },
    coach: () => "Click the risk outlook.",
  },
  {
    id: "recognize-opportunity",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find opportunity outlook",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-opportunity-outlook",
    recognize: {
      prompt: "Click the opportunity outlook.",
      accept: ["opportunity-outlook"],
      nudge: "It's the section showing whether opportunity is open or limited.",
    },
    coach: () => "Click the opportunity outlook.",
  },
  {
    id: "recognize-guidance",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find operational guidance",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-guidance",
    recognize: {
      prompt: "Click the operational guidance.",
      accept: ["guidance"],
      nudge: "Find the amber guidance block in the panel.",
    },
    coach: () => "Click the operational guidance.",
  },
  {
    id: "recognize-recommendations",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find recommendations",
    bridgePanel: "dailybriefing",
    region: null,
    conceptId: "identify-recommendations",
    recognize: {
      prompt: "Last one — click recommendations.",
      accept: ["recommendations"],
      nudge: "Scroll if you need to — it's the session priorities list.",
    },
    coach: () => "Click the recommendations.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Daily Briefing Engine certified",
    bridgePanel: "dailybriefing",
    region: "panel",
    conceptId: "daily-briefing-certified",
    coach: () =>
      "You understand what the Daily Briefing Engine is, why it exists, and how professionals use it to prepare. DAILY BRIEFING ENGINE CERTIFIED.",
  },
];
