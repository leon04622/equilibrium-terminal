import type { PerpFundingAnalytics } from "@/types/derivatives-intelligence";
import { LiveFundingCoach } from "@/lib/education/liveFundingCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

/** FUNDING LEARNING TEMPLATE V1 — cloned from Order Book bridge architecture. */

export type FundingRegion = "panel" | "rate" | "crowding" | "oi" | "liq" | null;
export type FundingBridgeMode = "explain" | "observe" | "compare" | "decide" | "recognize";

export interface FundingRecognitionSpec {
  prompt: string;
  accept: Exclude<FundingRegion, null>[];
  nudge: string;
}

export interface FundingBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: FundingBridgeMode;
  region: FundingRegion;
  whyCare?: (f: PerpFundingAnalytics | null) => string;
  coach: (f: PerpFundingAnalytics | null) => string;
  recognize?: FundingRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const FUNDING_BRIDGE_PANEL = "derivdesk";

export const FUNDING_REQUIRED_CONCEPTS = [
  "check-funding-rate",
  "check-crowding",
  "check-squeeze",
  "funding-pretrade-ready",
];

const MODERATE: CompareSide = {
  id: "moderate",
  title: "MODERATE",
  good: true,
  traits: ["Moderate funding", "Balanced positioning", "Low squeeze score"],
};

const EXTREME: CompareSide = {
  id: "extreme",
  title: "EXTREME",
  good: false,
  traits: ["Extreme positive funding", "Crowded longs", "High liq pressure"],
};

export const FUNDING_BRIDGE_STEPS: FundingBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE FUNDING",
    title: "Using today's funding data",
    region: "panel",
    coach: (f) => LiveFundingCoach.todayReadout(f),
    whyCare: () => "Before any perp trade, glance at funding — it tells you who pays whom and how crowded the market is.",
  },
  {
    id: "live-rate",
    mode: "explain",
    chapter: "FUNDING RATE · NOW",
    title: "Who pays whom right now",
    region: "rate",
    coach: (f) => LiveFundingCoach.fundingRate(f).line,
    whyCare: (f) =>
      f && f.hlFundingBps > 0
        ? "Positive funding — if you're going long, you're paying to hold. Is the crowd worth joining?"
        : f && f.hlFundingBps < 0
          ? "Negative funding — shorts are paying. Are you joining a crowded short?"
          : "Check who's paying before you hold a position overnight.",
  },
  {
    id: "live-crowding",
    mode: "explain",
    chapter: "CROWDING · NOW",
    title: "Is positioning crowded?",
    region: "crowding",
    coach: (f) => LiveFundingCoach.crowding(f).line,
    whyCare: () => "Crowded positioning increases squeeze risk — don't join the crowd blindly.",
  },
  {
    id: "live-squeeze",
    mode: "explain",
    chapter: "SQUEEZE RISK · NOW",
    title: "Liquidation pressure today",
    region: "liq",
    coach: (f) => LiveFundingCoach.squeezeRisk(f).line,
    whyCare: () => "High liquidation pressure means forced exits can accelerate price moves against the crowd.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "GOOD VS BAD",
    title: "Which funding environment is safer?",
    region: "panel",
    compare: { good: MODERATE, bad: EXTREME },
    coach: () => "Traders prefer moderate funding and balanced positioning — extreme funding means crowded, risky conditions.",
  },
  {
    id: "decide",
    mode: "decide",
    chapter: "YOUR CALL",
    title: "Which carries more squeeze risk?",
    region: "panel",
    decide: {
      prompt: "Which environment carries more squeeze risk?",
      options: [
        {
          id: "a",
          label: "Scenario A",
          traits: ["Moderate funding", "Balanced positioning"],
          correct: false,
        },
        {
          id: "b",
          label: "Scenario B",
          traits: ["Extreme funding", "Crowded longs", "High liq pressure"],
          correct: true,
        },
      ],
      explanation:
        "Scenario B — extreme funding with crowded longs means long squeeze risk on any pullback. Scenario A is calmer.",
    },
    coach: () => "Think like a trader: crowded + extreme funding = danger.",
  },
  {
    id: "pretrade",
    mode: "explain",
    chapter: "PRE-TRADE CHECK",
    title: "Funding pre-trade check",
    region: "rate",
    coach: () => "Before entering, ask: Is funding extreme? Is positioning crowded? Is squeeze risk elevated? Am I joining late?",
  },
  {
    id: "recognize-rate",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Where do you check funding rate?",
    region: null,
    conceptId: "check-funding-rate",
    coach: () => "Click where you'd check the funding rate before a trade.",
    recognize: {
      prompt: "Click the HL funding rate row.",
      accept: ["rate"],
      nudge: "The funding rate is on the FUNDING tab — look for HL funding in bps.",
    },
  },
  {
    id: "recognize-crowding",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Where do you check crowding?",
    region: null,
    conceptId: "check-crowding",
    recognize: {
      prompt: "Click the crowding indicator.",
      accept: ["crowding"],
      nudge: "Crowding bias shows whether longs or shorts are stacked.",
    },
    coach: () => "Click the crowding row.",
  },
  {
    id: "recognize-squeeze",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Where do you check squeeze risk?",
    region: null,
    conceptId: "check-squeeze",
    recognize: {
      prompt: "Click liquidation pressure.",
      accept: ["liq"],
      nudge: "Liquidation pressure score estimates squeeze/cascade risk.",
    },
    coach: () => "Click the liq pressure row.",
  },
  {
    id: "done",
    mode: "explain",
    chapter: "VALIDATED",
    title: "You can use funding in your process",
    region: null,
    conceptId: "funding-pretrade-ready",
    coach: () =>
      "You understand funding, crowding, and squeeze risk — and you know where to check them in the live desk before trading.",
  },
];
