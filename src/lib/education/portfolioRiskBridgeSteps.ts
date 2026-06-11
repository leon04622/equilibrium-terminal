import { LivePortfolioRiskCoach } from "@/lib/education/livePortfolioRiskCoach";
import type { CompareSide, DecisionOption } from "@/components/terminal/explain/OperatorDecisionPanels";
import type { PortfolioDeskSnapshot } from "@/types/portfolio-risk-treasury";
import type { PortfolioDeskTab } from "@/store/usePortfolioDeskStore";

/** PORTFOLIO RISK LEARNING TEMPLATE V1 — portfolio desk + positions bridge. */

export type PRBridgePanel = "portfoliodesk" | "positions";

export type PRBridgeRegion =
  | "panel"
  | "position-count"
  | "concentration"
  | "correlation-stress"
  | "directional-bias"
  | "exposure-heat"
  | "max-drawdown"
  | "position-count-desk"
  | "net-pnl"
  | null;

export type PRBridgeMode = "explain" | "compare" | "decide" | "recognize";

export interface PRRecognitionSpec {
  prompt: string;
  accept: Exclude<PRBridgeRegion, null>[];
  nudge: string;
}

export interface PRBridgeStep {
  id: string;
  chapter: string;
  title: string;
  mode: PRBridgeMode;
  bridgePanel: PRBridgePanel;
  region: PRBridgeRegion;
  portfolioTab?: PortfolioDeskTab;
  whyCare?: (s: PortfolioDeskSnapshot | null) => string;
  coach: (s: PortfolioDeskSnapshot | null) => string;
  recognize?: PRRecognitionSpec;
  conceptId?: string;
  compare?: { good: CompareSide; bad: CompareSide };
  decide?: { prompt: string; options: DecisionOption[]; explanation: string };
}

export const PORTFOLIO_RISK_BRIDGE_PANEL = "portfoliodesk";

export const PORTFOLIO_RISK_REQUIRED_CONCEPTS = [
  "identify-concentration",
  "identify-correlation",
  "identify-exposure",
  "identify-positions",
  "portfolio-risk-pretrade-ready",
  "portfolio-risk-certified",
];

const BALANCED: CompareSide = {
  id: "balanced",
  title: "PORTFOLIO B",
  good: true,
  traits: ["Spread exposure", "Lower concentration", "Monitors correlation", "Survives stress"],
};

const CONCENTRATED: CompareSide = {
  id: "concentrated",
  title: "PORTFOLIO A",
  good: false,
  traits: ["100% one theme", "High correlation", "Hidden diversification", "Drawdowns stack"],
};

export const PORTFOLIO_RISK_BRIDGE_STEPS: PRBridgeStep[] = [
  {
    id: "intro",
    mode: "explain",
    chapter: "LIVE TERMINAL",
    title: "One portfolio, not random trades",
    bridgePanel: "portfoliodesk",
    region: "panel",
    portfolioTab: "portfolio",
    coach: (s) => LivePortfolioRiskCoach.todayReadout(s),
    whyCare: () => "Your account is one portfolio. Every new trade changes total exposure, correlation, and survival odds.",
  },
  {
    id: "positions",
    mode: "explain",
    chapter: "POSITIONS",
    title: "What you hold right now",
    bridgePanel: "positions",
    region: "panel",
    coach: (s) =>
      s
        ? `${s.portfolio.positionCount} open positions across ${s.portfolio.venueCount} venues — read the book before adding.`
        : "Positions table shows every live holding. Count them before you stack more exposure.",
    whyCare: () => "Operators read positions first — not just the next trade idea.",
  },
  {
    id: "concentration",
    mode: "explain",
    chapter: "CONCENTRATION",
    title: "How tilted is the book?",
    bridgePanel: "portfoliodesk",
    region: "concentration",
    portfolioTab: "risk",
    coach: (s) => LivePortfolioRiskCoach.concentrationAdvice(s),
    whyCare: () => "Concentration turns one market move into portfolio damage.",
  },
  {
    id: "correlation",
    mode: "explain",
    chapter: "CORRELATION",
    title: "Do positions move together?",
    bridgePanel: "portfoliodesk",
    region: "correlation-stress",
    portfolioTab: "risk",
    coach: (s) => LivePortfolioRiskCoach.correlationAdvice(s),
    whyCare: () => "Owning several assets does not reduce risk if they all move the same way.",
  },
  {
    id: "direction",
    mode: "explain",
    chapter: "DIRECTIONAL EXPOSURE",
    title: "Long, short, or neutral bias",
    bridgePanel: "portfoliodesk",
    region: "directional-bias",
    portfolioTab: "risk",
    coach: (s) =>
      s
        ? `Directional bias ${s.risk.directionalBias.toUpperCase()} — adding another long in a selloff stacks risk.`
        : "Check directional bias before adding exposure in the same direction.",
    whyCare: () => "Directional exposure is how desks get caught in macro moves.",
  },
  {
    id: "exposure-heat",
    mode: "explain",
    chapter: "EXPOSURE HEAT",
    title: "How stretched is the book?",
    bridgePanel: "portfoliodesk",
    region: "exposure-heat",
    portfolioTab: "analytics",
    coach: (s) => LivePortfolioRiskCoach.exposureAdvice(s),
    whyCare: () => "Exposure heat shows whether the portfolio can absorb another position.",
  },
  {
    id: "drawdown",
    mode: "explain",
    chapter: "DRAWDOWN",
    title: "Portfolio-level losses",
    bridgePanel: "portfoliodesk",
    region: "max-drawdown",
    portfolioTab: "analytics",
    coach: (s) =>
      s
        ? `Max drawdown ${s.analytics.maxDrawdownPct}% — several correlated losses deepen this fast.`
        : "Portfolio drawdowns matter more than any single trade PnL.",
    whyCare: () => "Several losing positions at once is a portfolio event — not a trade event.",
  },
  {
    id: "compare",
    mode: "compare",
    chapter: "OPERATOR DECISION",
    title: "Which portfolio survives stress?",
    bridgePanel: "portfoliodesk",
    region: "panel",
    portfolioTab: "risk",
    compare: { good: BALANCED, bad: CONCENTRATED },
    coach: () => "Portfolio B survives stress better — concentration and correlation kill diversification.",
  },
  {
    id: "decide-stress",
    mode: "decide",
    chapter: "SCENARIO 1",
    title: "Market stress incoming",
    bridgePanel: "portfoliodesk",
    region: "panel",
    portfolioTab: "risk",
    decide: {
      prompt: "Portfolio A: 90% BTC long, 3 alt longs. Portfolio B: balanced sizes, mixed exposure. Which survives a -15% crypto dump?",
      options: [
        { id: "b", label: "Portfolio B", traits: ["Lower concentration", "Less correlated stacking"], correct: true },
        { id: "a", label: "Portfolio A", traits: ["All crypto beta", "Drawdowns compound"], correct: false },
        { id: "tie", label: "About the same", traits: ["Ignores correlation"], correct: false },
      ],
      explanation: "Portfolio B — concentrated, correlated books bleed together in stress.",
    },
    coach: () => "Stress exposes hidden correlation and concentration.",
  },
  {
    id: "decide-add",
    mode: "decide",
    chapter: "SCENARIO 2",
    title: "Should you add this trade?",
    bridgePanel: "portfoliodesk",
    region: "panel",
    portfolioTab: "risk",
    decide: {
      prompt: "Concentration score 78. Correlation stress 72. You want to add another large ETH long. Best action?",
      options: [
        { id: "wait", label: "Wait / reduce existing", traits: ["Rebalance first", "Lower concentration"], correct: true },
        { id: "add", label: "Add full size now", traits: ["Stacks correlated risk", "Portfolio imbalance"], correct: false },
        { id: "hedge", label: "Add and hedge later", traits: ["Risk already elevated", "Too late"], correct: false },
      ],
      explanation: "Wait or reduce — concentration and correlation are already elevated.",
    },
    coach: () => "Do not add size into an already concentrated, correlated book.",
  },
  {
    id: "pre-portfolio",
    mode: "explain",
    chapter: "PORTFOLIO HEALTH CHECK",
    title: "Five checks before adding",
    bridgePanel: "portfoliodesk",
    region: "panel",
    portfolioTab: "risk",
    coach: () => "Check: total exposure · correlation · position size · drawdown risk · capital allocation. Then submit.",
  },
  {
    id: "recognize-concentration",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find concentration score",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "risk",
    conceptId: "identify-concentration",
    recognize: {
      prompt: "Click concentration on the portfolio desk.",
      accept: ["concentration"],
      nudge: "Portfolio desk → RISK tab → Concentration row.",
    },
    coach: () => "Click concentration on the desk.",
  },
  {
    id: "recognize-correlation",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find correlation stress",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "risk",
    conceptId: "identify-correlation",
    recognize: {
      prompt: "Click correlation stress on the portfolio desk.",
      accept: ["correlation-stress"],
      nudge: "Portfolio desk → RISK tab → Correlation stress row.",
    },
    coach: () => "Click correlation stress.",
  },
  {
    id: "recognize-exposure",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find exposure heat",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "analytics",
    conceptId: "identify-exposure",
    recognize: {
      prompt: "Click exposure heat on the portfolio desk.",
      accept: ["exposure-heat"],
      nudge: "Portfolio desk → PNL tab → Exposure heat row.",
    },
    coach: () => "Click exposure heat.",
  },
  {
    id: "recognize-positions",
    mode: "recognize",
    chapter: "YOUR TURN",
    title: "Find position count",
    bridgePanel: "positions",
    region: null,
    conceptId: "identify-positions",
    recognize: {
      prompt: "Click the positions count on the positions panel.",
      accept: ["position-count"],
      nudge: "Positions panel → header row showing open position count.",
    },
    coach: () => "Click the positions count.",
  },
  {
    id: "certified",
    mode: "explain",
    chapter: "CERTIFIED",
    title: "Portfolio risk understood",
    bridgePanel: "portfoliodesk",
    region: null,
    portfolioTab: "risk",
    conceptId: "portfolio-risk-certified",
    coach: () =>
      "You understand portfolio risk, concentration, correlation, exposure, and capital allocation. Think portfolio-by-portfolio — not trade-by-trade.",
  },
];
