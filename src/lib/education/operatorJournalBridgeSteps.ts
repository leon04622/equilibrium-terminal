import { LiveOperatorJournalCoach } from "@/lib/education/liveOperatorJournalCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type OJBridgePanel = "operatorjournal";

export type OJBridgeTab = "session" | "log" | "exec" | "behavior" | "review" | "patterns";

export type OJBridgeRegion =
  | "panel"
  | "session"
  | "scorecard"
  | "log"
  | "decision-form"
  | "exec"
  | "behavior"
  | "review"
  | "patterns"
  | null;

export type OJBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface OJRecognitionSpec {
  prompt: string;
  accept: Exclude<OJBridgeRegion, null>[];
  nudge: string;
}

export interface OJBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: OJBridgeMode;
  bridgePanel: OJBridgePanel;
  region: OJBridgeRegion;
  journalTab?: OJBridgeTab;
  whyCare?: (ctx: ReturnType<typeof LiveOperatorJournalCoach.contextFromStore>) => string;
  coach: (ctx: ReturnType<typeof LiveOperatorJournalCoach.contextFromStore>) => string;
  recognize?: OJRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const OPERATOR_JOURNAL_BRIDGE_PANEL = "operatorjournal";

export const OPERATOR_JOURNAL_REQUIRED_CONCEPTS = [
  "identify-session",
  "identify-log",
  "identify-exec",
  "identify-behavior",
  "identify-review",
  "identify-patterns",
  "journal-workflow-ready",
  "operator-journal-certified",
];

const MEMORY_TRADER: CompareSide = {
  id: "memory",
  title: "MEMORY TRADER",
  good: true,
  traits: ["Logs every decision", "Reviews sessions", "Tracks patterns", "Improves over time"],
};

const FORGETFUL_TRADER: CompareSide = {
  id: "forgetful",
  title: "FORGETFUL TRADER",
  good: false,
  traits: ["Trades without notes", "Repeats mistakes", "Judges by PnL only", "No review habit"],
};

export const OPERATOR_JOURNAL_BRIDGE_STEPS: OJBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Your Operator Journal",
    bridgePanel: "operatorjournal",
    region: "panel",
    journalTab: "session",
    coach: (ctx) => LiveOperatorJournalCoach.todayReadout(ctx),
    whyCare: () => "This is Equilibrium Terminal's trading memory — not a generic trading course.",
  },
  {
    id: "session",
    mode: "explain",
    chapter: "SESSION TAB",
    title: "Live session scorecard",
    bridgePanel: "operatorjournal",
    region: "scorecard",
    journalTab: "session",
    coach: (ctx) => LiveOperatorJournalCoach.sessionAdvice(ctx),
    whyCare: () => "Sessions frame every decision with regime, volatility, and liquidity context.",
  },
  {
    id: "log",
    mode: "explain",
    chapter: "LOG TAB",
    title: "Decision logging",
    bridgePanel: "operatorjournal",
    region: "decision-form",
    journalTab: "log",
    coach: (ctx) => LiveOperatorJournalCoach.logAdvice(ctx),
    whyCare: () => "Professionals remember decisions — thesis, emotion, and risk note included.",
  },
  {
    id: "exec",
    mode: "explain",
    chapter: "EXEC TAB",
    title: "Execution review",
    bridgePanel: "operatorjournal",
    region: "exec",
    journalTab: "exec",
    coach: (ctx) => LiveOperatorJournalCoach.execAdvice(ctx),
    whyCare: () => "Chase rate and overtrading pressure reveal execution quality objectively.",
  },
  {
    id: "behavior",
    mode: "explain",
    chapter: "BEHAVIOR TAB",
    title: "Behavioral flags",
    bridgePanel: "operatorjournal",
    region: "behavior",
    journalTab: "behavior",
    coach: (ctx) => LiveOperatorJournalCoach.behaviorAdvice(ctx),
    whyCare: () => "Revenge trading and overtrading show up here before they compound.",
  },
  {
    id: "review",
    mode: "explain",
    chapter: "REVIEW TAB",
    title: "Session debrief",
    bridgePanel: "operatorjournal",
    region: "review",
    journalTab: "review",
    coach: (ctx) => LiveOperatorJournalCoach.reviewAdvice(ctx),
    whyCare: () => "Best and worst decisions — not just wins and losses.",
  },
  {
    id: "patterns",
    mode: "explain",
    chapter: "PATTERNS TAB",
    title: "Long-term patterns",
    bridgePanel: "operatorjournal",
    region: "patterns",
    journalTab: "patterns",
    coach: (ctx) => LiveOperatorJournalCoach.patternsAdvice(ctx),
    whyCare: () => "Repeated strengths and weaknesses drive long-term improvement.",
  },
  {
    id: "workflow-before",
    mode: "explain",
    chapter: "WORKFLOW · BEFORE",
    title: "Open journal first",
    bridgePanel: "operatorjournal",
    region: "session",
    journalTab: "session",
    coach: () => "Before trading: open Operator Journal, check session scorecard, set your intent for the desk.",
  },
  {
    id: "workflow-during",
    mode: "explain",
    chapter: "WORKFLOW · DURING",
    title: "Log every decision",
    bridgePanel: "operatorjournal",
    region: "log",
    journalTab: "log",
    coach: () => "During trading: log entries, exits, adjustments, observations, and skipped trades — capture the why.",
  },
  {
    id: "workflow-after",
    mode: "explain",
    chapter: "WORKFLOW · AFTER",
    title: "Review and archive",
    bridgePanel: "operatorjournal",
    region: "review",
    journalTab: "review",
    coach: () => "After trading: review best and worst decisions, read behavioral flags, check patterns — then end session.",
  },
  {
    id: "compare-memory",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Memory vs forgetful",
    bridgePanel: "operatorjournal",
    region: "panel",
    journalTab: "session",
    compare: { good: MEMORY_TRADER, bad: FORGETFUL_TRADER },
    coach: () => "The Operator Journal exists so you operate like the memory trader — not the forgetful one.",
  },
  {
    id: "decide-skip",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Skipped trade — log it?",
    bridgePanel: "operatorjournal",
    region: "log",
    journalTab: "log",
    decide: {
      prompt: "You skipped a trade with a clear reason — standing aside in poor liquidity. Best action?",
      options: [
        { id: "log", label: "Log it as SKIP with thesis", traits: ["Builds memory", "Tracks discipline"], correct: true },
        { id: "ignore", label: "Ignore — no trade means no record", traits: ["Loses context"], correct: false },
        { id: "chase", label: "Enter anyway — opportunity missed", traits: ["Reactive"], correct: false },
      ],
      explanation: "Skipped trades with clear reasoning are often your best decisions — log them.",
    },
    coach: () => "Standing aside is a decision worth remembering.",
  },
  {
    id: "decide-revenge",
    mode: "decide",
    chapter: "SCENARIO 3",
    title: "Revenge trading flagged",
    bridgePanel: "operatorjournal",
    region: "behavior",
    journalTab: "behavior",
    decide: {
      prompt: "Behavior tab flags revenge trading after a loss. What changes?",
      options: [
        { id: "pause", label: "Pause · review Behavior tab · reduce size", traits: ["Respects flag", "Protects capital"], correct: true },
        { id: "double", label: "Double size to recover", traits: ["Compounds mistake"], correct: false },
        { id: "ignore", label: "Ignore flag — keep trading", traits: ["Repeats pattern"], correct: false },
      ],
      explanation: "Behavioral flags exist to interrupt destructive patterns before they compound.",
    },
    coach: () => "The journal detected a discipline leak — act on it.",
  },
  {
    id: "recognize-session",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find session scorecard",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "session",
    conceptId: "identify-session",
    recognize: {
      prompt: "Click the session scorecard area.",
      accept: ["scorecard", "session"],
      nudge: "SESSION tab → EXECUTION / DISCIPLINE score bars.",
    },
    coach: () => "Click the session scorecard.",
  },
  {
    id: "recognize-log",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find decision log form",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "log",
    conceptId: "identify-log",
    recognize: {
      prompt: "Click the LOG DECISION button or thesis field.",
      accept: ["decision-form", "log"],
      nudge: "LOG tab → thesis field or LOG DECISION button.",
    },
    coach: () => "Click the decision log form.",
  },
  {
    id: "recognize-exec",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find execution quality",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "exec",
    conceptId: "identify-exec",
    recognize: {
      prompt: "Click the EXECUTION QUALITY bar.",
      accept: ["exec"],
      nudge: "EXEC tab → EXECUTION QUALITY score bar.",
    },
    coach: () => "Click execution quality on Exec tab.",
  },
  {
    id: "recognize-behavior",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find behavior flags",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "behavior",
    conceptId: "identify-behavior",
    recognize: {
      prompt: "Click the Behavior tab content area.",
      accept: ["behavior"],
      nudge: "BEHAVIOR tab → flags list or disciplined message.",
    },
    coach: () => "Click the behavior section.",
  },
  {
    id: "recognize-review",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find session review",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "review",
    conceptId: "identify-review",
    recognize: {
      prompt: "Click the session review scores.",
      accept: ["review"],
      nudge: "REVIEW tab → QUALITY / EXEC / DISCIPLINE scores.",
    },
    coach: () => "Click session review scores.",
  },
  {
    id: "recognize-patterns",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find performance patterns",
    bridgePanel: "operatorjournal",
    region: null,
    journalTab: "patterns",
    conceptId: "identify-patterns",
    recognize: {
      prompt: "Click a pattern card.",
      accept: ["patterns"],
      nudge: "PATTERNS tab → any strength or weakness card.",
    },
    coach: () => "Click a performance pattern.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Operator Journal certified",
    bridgePanel: "operatorjournal",
    region: "panel",
    journalTab: "session",
    conceptId: "operator-journal-certified",
    coach: () =>
      "You know what the Operator Journal is, why it exists, how professionals use it, and how it improves decision quality over time. OPERATOR JOURNAL CERTIFIED.",
  },
];
