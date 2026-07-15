import { CryptoFinancialOsCoach } from "@/lib/education/cryptoFinancialOsCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";

export type CFOBridgePanel = "ecosystem";

export type CFOBridgeRegion =
  | "panel"
  | "layers"
  | "portfolio"
  | "risk"
  | "execution"
  | "research"
  | "automation"
  | "compliance"
  | "developer"
  | "memory"
  | null;

export type CFOBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface CFORecognitionSpec {
  prompt: string;
  accept: Exclude<CFOBridgeRegion, null>[];
  nudge: string;
}

export interface CFOBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: CFOBridgeMode;
  bridgePanel: CFOBridgePanel;
  region: CFOBridgeRegion;
  layerFocus?: "terminal" | "intelligence" | "execution" | "organizational" | "infrastructure" | "api";
  whyCare?: (ctx: ReturnType<typeof CryptoFinancialOsCoach.contextLive>) => string;
  coach: (ctx: ReturnType<typeof CryptoFinancialOsCoach.contextLive>) => string;
  recognize?: CFORecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const CRYPTO_FINANCIAL_OS_BRIDGE_PANEL = "ecosystem";

export const CRYPTO_FINANCIAL_OS_REQUIRED_CONCEPTS = [
  "identify-layers",
  "identify-risk",
  "identify-execution",
  "identify-research",
  "identify-memory",
  "crypto-financial-os-workflow-ready",
  "crypto-financial-os-certified",
];

const INTEGRATED_OPERATOR: CompareSide = {
  id: "operator",
  title: "INTEGRATED OPERATOR",
  good: true,
  traits: ["One connected OS", "Layers inform decisions", "Context before execution", "Review in workflow systems"],
};

const DISCONNECTED_TRADER: CompareSide = {
  id: "trader",
  title: "DISCONNECTED TRADER",
  good: false,
  traits: ["Many separate tools", "Jumps between panels", "No information flow", "Overwhelmed by noise"],
};

export const CRYPTO_FINANCIAL_OS_BRIDGE_STEPS: CFOBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "Crypto Financial OS panel",
    bridgePanel: "ecosystem",
    region: "panel",
    coach: (ctx) => CryptoFinancialOsCoach.todayReadout(ctx),
    whyCare: () => "This is the operating system that powers the terminal — not a pile of disconnected tools.",
  },
  {
    id: "layers",
    mode: "explain",
    chapter: "LAYERS",
    title: "Platform layer map",
    bridgePanel: "ecosystem",
    region: "layers",
    coach: (ctx) => CryptoFinancialOsCoach.layersAdvice(ctx),
    whyCare: () => "Layers organize information so you understand market, risk, execution, intelligence, and operations without overwhelm.",
  },
  {
    id: "info-flow",
    mode: "explain",
    chapter: "INFORMATION FLOW",
    title: "Data to review",
    bridgePanel: "ecosystem",
    region: "layers",
    coach: () =>
      "Market data feeds intelligence. Intelligence informs decisions. Decisions become execution. Execution feeds review. You move through context, insight, action, and reflection.",
    whyCare: () => "Information flows in one direction — you do not jump randomly between panels.",
  },
  {
    id: "terminal-layer",
    mode: "explain",
    chapter: "TERMINAL LAYER",
    title: "What you touch directly",
    bridgePanel: "ecosystem",
    region: "layers",
    layerFocus: "terminal",
    coach: (ctx) => CryptoFinancialOsCoach.terminalLayerAdvice(ctx),
    whyCare: () => "The terminal layer sits at the top — workspace, charts, order book, trade ticket, positions.",
  },
  {
    id: "intelligence-layer",
    mode: "explain",
    chapter: "INTELLIGENCE LAYER",
    title: "Signals and context",
    bridgePanel: "ecosystem",
    region: "research",
    layerFocus: "intelligence",
    coach: (ctx) => CryptoFinancialOsCoach.researchAdvice(ctx),
    whyCare: () => "Intelligence turns raw data into awareness before you size a trade or write a plan.",
  },
  {
    id: "execution-layer",
    mode: "explain",
    chapter: "EXECUTION LAYER",
    title: "Decisions become actions",
    bridgePanel: "ecosystem",
    region: "execution",
    layerFocus: "execution",
    coach: (ctx) => CryptoFinancialOsCoach.executionLayerAdvice(ctx),
    whyCare: () => "Order book, trade ticket, and execution systems connect here — how cleanly you get filled.",
  },
  {
    id: "organizational-layer",
    mode: "explain",
    chapter: "ORGANIZATIONAL LAYER",
    title: "Operations and workflow",
    bridgePanel: "ecosystem",
    region: "automation",
    layerFocus: "organizational",
    coach: (ctx) => CryptoFinancialOsCoach.organizationalLayerAdvice(ctx),
    whyCare: () => "Daily operations, operator journal, and workflow systems — professional trading is repeatable.",
  },
  {
    id: "infrastructure-layer",
    mode: "explain",
    chapter: "INFRASTRUCTURE LAYER",
    title: "Behind the scenes",
    bridgePanel: "ecosystem",
    region: "developer",
    layerFocus: "infrastructure",
    coach: (ctx) => CryptoFinancialOsCoach.infrastructureLayerAdvice(ctx),
    whyCare: () => "Reliability, ingestion, and diagnostics run here — you rarely stare at it, but every layer depends on it.",
  },
  {
    id: "risk",
    mode: "explain",
    chapter: "RISK SYSTEMS",
    title: "Risk surveillance",
    bridgePanel: "ecosystem",
    region: "risk",
    coach: (ctx) => CryptoFinancialOsCoach.riskAdvice(ctx),
    whyCare: () => "Risk systems engaged — alerts surface before exposure compounds.",
  },
  {
    id: "memory",
    mode: "explain",
    chapter: "MARKET MEMORY",
    title: "OS connects to history",
    bridgePanel: "ecosystem",
    region: "memory",
    coach: (ctx) => CryptoFinancialOsCoach.memoryAdvice(ctx),
    whyCare: () => "Market memory links the OS to historical context — what happened before informs today.",
  },
  {
    id: "workflow",
    mode: "explain",
    chapter: "OPERATOR WORKFLOW",
    title: "Context to review",
    bridgePanel: "ecosystem",
    region: "panel",
    coach: () => "Professional workflow: read layers, check intelligence, review risk, execute with discipline, review in ops systems.",
  },
  {
    id: "compare-integrated",
    mode: "compare",
    chapter: "SCENARIO 1",
    title: "Tools vs operating system",
    bridgePanel: "ecosystem",
    region: "panel",
    compare: { good: INTEGRATED_OPERATOR, bad: DISCONNECTED_TRADER },
    coach: () => "Crypto Financial OS exists so you operate like the integrated operator — one framework, not many tools.",
  },
  {
    id: "decide-framework",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Framework over tools",
    bridgePanel: "ecosystem",
    region: "layers",
    decide: {
      prompt: "A trader sees many panels in the terminal. What is Crypto Financial OS designed to provide?",
      options: [
        {
          id: "framework",
          label: "A framework that organizes information into connected layers",
          traits: ["Correct mental model"],
          correct: true,
        },
        { id: "more-tools", label: "More individual tools to click through", traits: ["Misses the point"], correct: false },
        { id: "predict", label: "A system that predicts price moves", traits: ["Wrong purpose"], correct: false },
      ],
      explanation: "Crypto Financial OS provides a framework — layers that connect market, risk, execution, intelligence, and operations.",
    },
    coach: () => "Most platforms provide tools. Crypto Financial OS provides a framework.",
  },
  {
    id: "coach-examples",
    mode: "explain",
    chapter: "OPERATOR COACH",
    title: "Layer status alerts",
    bridgePanel: "ecosystem",
    region: "panel",
    coach: (ctx) => {
      const line = CryptoFinancialOsCoach.alertLine(ctx);
      return `${line} Examples: Execution layer active. Intelligence layer producing signals. Operational systems healthy. Risk systems engaged.`;
    },
    whyCare: () => "Coach lines translate layer health into actionable awareness.",
  },
  {
    id: "recognize-layers",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find the layers tab",
    bridgePanel: "ecosystem",
    region: null,
    conceptId: "identify-layers",
    recognize: {
      prompt: "Your turn — click the layers section.",
      accept: ["layers"],
      nudge: "Click the LAYERS tab, then the layer list below it.",
    },
    coach: () => "Click the layers section.",
  },
  {
    id: "recognize-risk",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find risk surveillance",
    bridgePanel: "ecosystem",
    region: null,
    conceptId: "identify-risk",
    recognize: {
      prompt: "Now click the risk section.",
      accept: ["risk"],
      nudge: "Click the RISK tab — risk alerts and surveillance.",
    },
    coach: () => "Click the risk section.",
  },
  {
    id: "recognize-execution",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find execution analytics",
    bridgePanel: "ecosystem",
    region: null,
    conceptId: "identify-execution",
    recognize: {
      prompt: "Find execution and click it.",
      accept: ["execution"],
      nudge: "Click the EXEC tab — venue slippage and fill rates.",
    },
    coach: () => "Click the execution section.",
  },
  {
    id: "recognize-research",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find intelligence / research",
    bridgePanel: "ecosystem",
    region: null,
    conceptId: "identify-research",
    recognize: {
      prompt: "Click the research section.",
      accept: ["research"],
      nudge: "Click the RESEARCH tab — intelligence layer signals.",
    },
    coach: () => "Click the research section.",
  },
  {
    id: "recognize-memory",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find market memory link",
    bridgePanel: "ecosystem",
    region: null,
    conceptId: "identify-memory",
    recognize: {
      prompt: "Last one — click the memory section.",
      accept: ["memory"],
      nudge: "Click the MEMORY tab — OS connection to market history.",
    },
    coach: () => "Click the memory section.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Crypto Financial OS certified",
    bridgePanel: "ecosystem",
    region: "panel",
    conceptId: "crypto-financial-os-certified",
    coach: () =>
      "You understand what Crypto Financial OS is, why it exists, how the layers connect, and how professional operators move through context, intelligence, execution, and review. CRYPTO FINANCIAL OS CERTIFIED.",
  },
];
