/**
 * LEARNING COMMAND CENTER — institutional training catalog.
 *
 * Single source of truth for paths, lesson order, operator ranks, and
 * recommended-next logic. Lesson launchers live in the UI; this file
 * defines structure and progress interpretation only.
 */

export type LessonStatus = "locked" | "available" | "in_progress" | "completed" | "coming_soon";
export type PathId = "beginner" | "intermediate" | "professional";
export type LessonAction = "start" | "bridge" | "restart" | "review";

export interface LessonProgressDetail {
  /** Full module mastery (simulator + bridge where applicable). */
  completed: boolean;
  /** Main lesson / simulator finished. */
  simulatorCompleted: boolean;
  inProgress: boolean;
  bridgeCompleted: boolean;
  recognitionPassed: boolean;
  replayWatched: boolean;
  mastery: boolean;
}

export interface AcademyLesson {
  id: string;
  path: PathId;
  order: number;
  title: string;
  subtitle: string;
  /** Module is implemented in the terminal today. */
  live: boolean;
  prerequisiteId: string | null;
  /** Path-level gate (e.g. intermediate requires beginner core). */
  requiresPathComplete?: PathId;
}

export interface OperatorRank {
  level: number;
  title: string;
  requirement: string;
}

export const OPERATOR_RANKS: OperatorRank[] = [
  { level: 1, title: "Market Apprentice", requirement: "Complete Market Mechanics" },
  { level: 2, title: "Execution Apprentice", requirement: "Complete Order Book training" },
  { level: 3, title: "Market Operator", requirement: "Complete Funding & Crowding" },
  { level: 4, title: "Advanced Operator", requirement: "Begin Intermediate path" },
  { level: 5, title: "Professional Operator", requirement: "Begin Professional path" },
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  // ---- BEGINNER PATH --------------------------------------------------------
  {
    id: "market-mechanics",
    path: "beginner",
    order: 1,
    title: "Market Mechanics",
    subtitle: "How trades happen, why price moves, what the book is",
    live: true,
    prerequisiteId: null,
  },
  {
    id: "order-book",
    path: "beginner",
    order: 2,
    title: "Order Book",
    subtitle: "Read bids, asks, spread, liquidity — simulator + live bridge",
    live: true,
    prerequisiteId: "market-mechanics",
  },
  {
    id: "funding",
    path: "beginner",
    order: 3,
    title: "Funding & Crowding",
    subtitle: "Who pays whom, crowding, squeeze risk — simulator + live bridge",
    live: true,
    prerequisiteId: "order-book",
  },
  {
    id: "trade-types",
    path: "beginner",
    order: 4,
    title: "Trade Types",
    subtitle: "Market, limit, stop — when to use each",
    live: true,
    prerequisiteId: "funding",
  },
  {
    id: "liquidations",
    path: "beginner",
    order: 5,
    title: "Liquidations",
    subtitle: "How forced exits move price and cascade",
    live: true,
    prerequisiteId: "trade-types",
  },
  {
    id: "risk-management",
    path: "beginner",
    order: 6,
    title: "Risk Management",
    subtitle: "Size, stops, volatility, and when to stand aside",
    live: true,
    prerequisiteId: "liquidations",
  },
  {
    id: "first-trade-checklist",
    path: "beginner",
    order: 8,
    title: "First Trade Checklist",
    subtitle: "Pre-trade checks before your first live entry",
    live: true,
    prerequisiteId: "risk-management",
  },
  // ---- INTERMEDIATE PATH ----------------------------------------------------
  {
    id: "market-structure",
    path: "intermediate",
    order: 9,
    title: "Market Structure",
    subtitle: "Trend, range, breaks, and context",
    live: true,
    prerequisiteId: null,
    requiresPathComplete: "beginner",
  },
  {
    id: "liquidity-deep",
    path: "intermediate",
    order: 10,
    title: "Liquidity",
    subtitle: "Depth, walls, and execution impact",
    live: true,
    prerequisiteId: "market-structure",
    requiresPathComplete: "beginner",
  },
  {
    id: "slippage",
    path: "intermediate",
    order: 11,
    title: "Slippage",
    subtitle: "Expected vs realized fill — simulator + live bridge",
    live: true,
    prerequisiteId: "risk-management",
    requiresPathComplete: "beginner",
  },
  {
    id: "execution",
    path: "intermediate",
    order: 12,
    title: "Execution",
    subtitle: "Timing, patience, and execution quality — simulator + live bridge",
    live: true,
    prerequisiteId: "slippage",
    requiresPathComplete: "beginner",
  },
  // ---- PROFESSIONAL PATH ----------------------------------------------------
  {
    id: "portfolio-risk",
    path: "professional",
    order: 13,
    title: "Portfolio Risk",
    subtitle: "Concentration, correlation, exposure — simulator + live bridge",
    live: true,
    prerequisiteId: "execution",
    requiresPathComplete: "intermediate",
  },
  {
    id: "daily-operations",
    path: "professional",
    order: 14,
    title: "Daily Operations",
    subtitle: "Your daily operating system — brief, state, session, routines",
    live: true,
    prerequisiteId: "portfolio-risk",
    requiresPathComplete: "intermediate",
  },
  {
    id: "operator-journal",
    path: "professional",
    order: 15,
    title: "Operator Journal",
    subtitle: "Your trading memory — session, log, exec, behavior, review, patterns",
    live: true,
    prerequisiteId: "daily-operations",
    requiresPathComplete: "intermediate",
  },
  {
    id: "live-desk",
    path: "professional",
    order: 16,
    title: "Live Desk",
    subtitle: "Platform mission control — session, funding, tone, and market awareness",
    live: true,
    prerequisiteId: "operator-journal",
    requiresPathComplete: "intermediate",
  },
  {
    id: "market-state",
    path: "professional",
    order: 17,
    title: "Market State Layer",
    subtitle: "CALM · ACTIVE · THIN · STRESS — how conditions drive behavior",
    live: true,
    prerequisiteId: "live-desk",
    requiresPathComplete: "intermediate",
  },
  {
    id: "daily-briefing",
    path: "professional",
    order: 18,
    title: "Daily Briefing Engine",
    subtitle: "What should I pay attention to today — before the session starts",
    live: true,
    prerequisiteId: "market-state",
    requiresPathComplete: "intermediate",
  },
  {
    id: "market-memory",
    path: "professional",
    order: 19,
    title: "Market Memory Archive",
    subtitle: "What happened before — and why it matters today",
    live: true,
    prerequisiteId: "daily-briefing",
    requiresPathComplete: "intermediate",
  },
  {
    id: "crypto-financial-os",
    path: "professional",
    order: 20,
    title: "Crypto Financial OS",
    subtitle: "The operating system that powers the terminal",
    live: true,
    prerequisiteId: "market-memory",
    requiresPathComplete: "intermediate",
  },
  {
    id: "cross-market",
    path: "professional",
    order: 21,
    title: "Cross-Market Analysis",
    subtitle: "Venues, basis, and relative value",
    live: true,
    prerequisiteId: "crypto-financial-os",
    requiresPathComplete: "intermediate",
  },
  {
    id: "macro-flows",
    path: "professional",
    order: 22,
    title: "Macro Flows",
    subtitle: "Regime, flows, and positioning context",
    live: true,
    prerequisiteId: "cross-market",
    requiresPathComplete: "intermediate",
  },
  {
    id: "intelligence-desk",
    path: "professional",
    order: 23,
    title: "Intelligence Desk",
    subtitle: "Wire, surveillance, and operator workflow",
    live: true,
    prerequisiteId: "macro-flows",
    requiresPathComplete: "intermediate",
  },
];

export interface RawAcademyProgress {
  marketMechanics: { completed: boolean; lastStep: number };
  marketMechanicsBridge: { bridgeCompleted: boolean; conceptsMastered: string[] };
  orderBook: { completed: boolean; lastStep: number; replayWatched: boolean };
  orderBookBridge: { bridgeCompleted: boolean; conceptsMastered: string[] };
  funding: { completed: boolean; lastStep: number };
  fundingBridge: { bridgeCompleted: boolean; conceptsMastered: string[] };
  tradeTypes: { completed: boolean; lastStep: number };
  tradeTypesBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  liquidations: { completed: boolean; lastStep: number };
  liquidationsBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  riskManagement: { completed: boolean; lastStep: number };
  riskManagementBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  slippage: { completed: boolean; lastStep: number };
  slippageBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  execution: { completed: boolean; lastStep: number };
  executionBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  portfolioRisk: { completed: boolean; lastStep: number };
  portfolioRiskBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  dailyOperations: { completed: boolean; lastStep: number };
  dailyOperationsBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  operatorJournal: { completed: boolean; lastStep: number };
  operatorJournalBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  liveDesk: { completed: boolean; lastStep: number };
  liveDeskBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  marketState: { completed: boolean; lastStep: number };
  marketStateBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  dailyBriefing: { completed: boolean; lastStep: number };
  dailyBriefingBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  marketMemory: { completed: boolean; lastStep: number };
  marketMemoryBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  cryptoFinancialOs: { completed: boolean; lastStep: number };
  cryptoFinancialOsBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  firstTradeChecklist: { completed: boolean; lastStep: number };
  firstTradeChecklistBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  marketStructure: { completed: boolean; lastStep: number };
  marketStructureBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  liquidityDeep: { completed: boolean; lastStep: number };
  liquidityDeepBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  crossMarket: { completed: boolean; lastStep: number };
  crossMarketBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  macroFlows: { completed: boolean; lastStep: number };
  macroFlowsBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
  intelligenceDesk: { completed: boolean; lastStep: number };
  intelligenceDeskBridge: { bridgeCompleted: boolean; certified: boolean; conceptsMastered: string[] };
}

export function lessonProgress(id: string, raw: RawAcademyProgress): LessonProgressDetail {
  switch (id) {
    case "market-mechanics":
      return {
        completed: raw.marketMechanics.completed && raw.marketMechanicsBridge.bridgeCompleted,
        simulatorCompleted: raw.marketMechanics.completed,
        inProgress:
          (raw.marketMechanics.lastStep > 0 && !raw.marketMechanics.completed) ||
          (raw.marketMechanics.completed && !raw.marketMechanicsBridge.bridgeCompleted),
        bridgeCompleted: raw.marketMechanicsBridge.bridgeCompleted,
        recognitionPassed: raw.marketMechanicsBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery: raw.marketMechanics.completed && raw.marketMechanicsBridge.bridgeCompleted,
      };
    case "order-book":
      return {
        completed: raw.orderBook.completed && raw.orderBookBridge.bridgeCompleted,
        simulatorCompleted: raw.orderBook.completed,
        inProgress:
          (raw.orderBook.lastStep > 0 && !raw.orderBook.completed) ||
          (raw.orderBook.completed && !raw.orderBookBridge.bridgeCompleted),
        bridgeCompleted: raw.orderBookBridge.bridgeCompleted,
        recognitionPassed: raw.orderBookBridge.conceptsMastered.length >= 3,
        replayWatched: raw.orderBook.replayWatched,
        mastery: raw.orderBook.completed && raw.orderBookBridge.bridgeCompleted,
      };
    case "funding":
      return {
        completed: raw.funding.completed && raw.fundingBridge.bridgeCompleted,
        simulatorCompleted: raw.funding.completed,
        inProgress:
          (raw.funding.lastStep > 0 && !raw.funding.completed) ||
          (raw.funding.completed && !raw.fundingBridge.bridgeCompleted),
        bridgeCompleted: raw.fundingBridge.bridgeCompleted,
        recognitionPassed: raw.fundingBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery: raw.funding.completed && raw.fundingBridge.bridgeCompleted,
      };
    case "trade-types":
      return {
        completed: raw.tradeTypes.completed && raw.tradeTypesBridge.bridgeCompleted,
        simulatorCompleted: raw.tradeTypes.completed,
        inProgress:
          (raw.tradeTypes.lastStep > 0 && !raw.tradeTypes.completed) ||
          (raw.tradeTypes.completed && !raw.tradeTypesBridge.bridgeCompleted),
        bridgeCompleted: raw.tradeTypesBridge.bridgeCompleted,
        recognitionPassed: raw.tradeTypesBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery: raw.tradeTypes.completed && raw.tradeTypesBridge.bridgeCompleted && raw.tradeTypesBridge.certified,
      };
    case "liquidations":
      return {
        completed: raw.liquidations.completed && raw.liquidationsBridge.bridgeCompleted,
        simulatorCompleted: raw.liquidations.completed,
        inProgress:
          (raw.liquidations.lastStep > 0 && !raw.liquidations.completed) ||
          (raw.liquidations.completed && !raw.liquidationsBridge.bridgeCompleted),
        bridgeCompleted: raw.liquidationsBridge.bridgeCompleted,
        recognitionPassed: raw.liquidationsBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.liquidations.completed && raw.liquidationsBridge.bridgeCompleted && raw.liquidationsBridge.certified,
      };
    case "risk-management":
      return {
        completed: raw.riskManagement.completed && raw.riskManagementBridge.bridgeCompleted,
        simulatorCompleted: raw.riskManagement.completed,
        inProgress:
          (raw.riskManagement.lastStep > 0 && !raw.riskManagement.completed) ||
          (raw.riskManagement.completed && !raw.riskManagementBridge.bridgeCompleted),
        bridgeCompleted: raw.riskManagementBridge.bridgeCompleted,
        recognitionPassed: raw.riskManagementBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.riskManagement.completed &&
          raw.riskManagementBridge.bridgeCompleted &&
          raw.riskManagementBridge.certified,
      };
    case "slippage":
      return {
        completed: raw.slippage.completed && raw.slippageBridge.bridgeCompleted,
        simulatorCompleted: raw.slippage.completed,
        inProgress:
          (raw.slippage.lastStep > 0 && !raw.slippage.completed) ||
          (raw.slippage.completed && !raw.slippageBridge.bridgeCompleted),
        bridgeCompleted: raw.slippageBridge.bridgeCompleted,
        recognitionPassed: raw.slippageBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.slippage.completed && raw.slippageBridge.bridgeCompleted && raw.slippageBridge.certified,
      };
    case "execution":
      return {
        completed: raw.execution.completed && raw.executionBridge.bridgeCompleted,
        simulatorCompleted: raw.execution.completed,
        inProgress:
          (raw.execution.lastStep > 0 && !raw.execution.completed) ||
          (raw.execution.completed && !raw.executionBridge.bridgeCompleted),
        bridgeCompleted: raw.executionBridge.bridgeCompleted,
        recognitionPassed: raw.executionBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.execution.completed && raw.executionBridge.bridgeCompleted && raw.executionBridge.certified,
      };
    case "portfolio-risk":
      return {
        completed: raw.portfolioRisk.completed && raw.portfolioRiskBridge.bridgeCompleted,
        simulatorCompleted: raw.portfolioRisk.completed,
        inProgress:
          (raw.portfolioRisk.lastStep > 0 && !raw.portfolioRisk.completed) ||
          (raw.portfolioRisk.completed && !raw.portfolioRiskBridge.bridgeCompleted),
        bridgeCompleted: raw.portfolioRiskBridge.bridgeCompleted,
        recognitionPassed: raw.portfolioRiskBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.portfolioRisk.completed &&
          raw.portfolioRiskBridge.bridgeCompleted &&
          raw.portfolioRiskBridge.certified,
      };
    case "daily-operations":
      return {
        completed: raw.dailyOperations.completed && raw.dailyOperationsBridge.bridgeCompleted,
        simulatorCompleted: raw.dailyOperations.completed,
        inProgress:
          (raw.dailyOperations.lastStep > 0 && !raw.dailyOperations.completed) ||
          (raw.dailyOperations.completed && !raw.dailyOperationsBridge.bridgeCompleted),
        bridgeCompleted: raw.dailyOperationsBridge.bridgeCompleted,
        recognitionPassed: raw.dailyOperationsBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.dailyOperations.completed &&
          raw.dailyOperationsBridge.bridgeCompleted &&
          raw.dailyOperationsBridge.certified,
      };
    case "operator-journal":
      return {
        completed: raw.operatorJournal.completed && raw.operatorJournalBridge.bridgeCompleted,
        simulatorCompleted: raw.operatorJournal.completed,
        inProgress:
          (raw.operatorJournal.lastStep > 0 && !raw.operatorJournal.completed) ||
          (raw.operatorJournal.completed && !raw.operatorJournalBridge.bridgeCompleted),
        bridgeCompleted: raw.operatorJournalBridge.bridgeCompleted,
        recognitionPassed: raw.operatorJournalBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.operatorJournal.completed &&
          raw.operatorJournalBridge.bridgeCompleted &&
          raw.operatorJournalBridge.certified,
      };
    case "live-desk":
      return {
        completed: raw.liveDesk.completed && raw.liveDeskBridge.bridgeCompleted,
        simulatorCompleted: raw.liveDesk.completed,
        inProgress:
          (raw.liveDesk.lastStep > 0 && !raw.liveDesk.completed) ||
          (raw.liveDesk.completed && !raw.liveDeskBridge.bridgeCompleted),
        bridgeCompleted: raw.liveDeskBridge.bridgeCompleted,
        recognitionPassed: raw.liveDeskBridge.conceptsMastered.length >= 7,
        replayWatched: false,
        mastery:
          raw.liveDesk.completed && raw.liveDeskBridge.bridgeCompleted && raw.liveDeskBridge.certified,
      };
    case "market-state":
      return {
        completed: raw.marketState.completed && raw.marketStateBridge.bridgeCompleted,
        simulatorCompleted: raw.marketState.completed,
        inProgress:
          (raw.marketState.lastStep > 0 && !raw.marketState.completed) ||
          (raw.marketState.completed && !raw.marketStateBridge.bridgeCompleted),
        bridgeCompleted: raw.marketStateBridge.bridgeCompleted,
        recognitionPassed: raw.marketStateBridge.conceptsMastered.length >= 7,
        replayWatched: false,
        mastery:
          raw.marketState.completed && raw.marketStateBridge.bridgeCompleted && raw.marketStateBridge.certified,
      };
    case "daily-briefing":
      return {
        completed: raw.dailyBriefing.completed && raw.dailyBriefingBridge.bridgeCompleted,
        simulatorCompleted: raw.dailyBriefing.completed,
        inProgress:
          (raw.dailyBriefing.lastStep > 0 && !raw.dailyBriefing.completed) ||
          (raw.dailyBriefing.completed && !raw.dailyBriefingBridge.bridgeCompleted),
        bridgeCompleted: raw.dailyBriefingBridge.bridgeCompleted,
        recognitionPassed: raw.dailyBriefingBridge.conceptsMastered.length >= 7,
        replayWatched: false,
        mastery:
          raw.dailyBriefing.completed && raw.dailyBriefingBridge.bridgeCompleted && raw.dailyBriefingBridge.certified,
      };
    case "market-memory":
      return {
        completed: raw.marketMemory.completed && raw.marketMemoryBridge.bridgeCompleted,
        simulatorCompleted: raw.marketMemory.completed,
        inProgress:
          (raw.marketMemory.lastStep > 0 && !raw.marketMemory.completed) ||
          (raw.marketMemory.completed && !raw.marketMemoryBridge.bridgeCompleted),
        bridgeCompleted: raw.marketMemoryBridge.bridgeCompleted,
        recognitionPassed: raw.marketMemoryBridge.conceptsMastered.length >= 6,
        replayWatched: false,
        mastery:
          raw.marketMemory.completed && raw.marketMemoryBridge.bridgeCompleted && raw.marketMemoryBridge.certified,
      };
    case "crypto-financial-os":
      return {
        completed: raw.cryptoFinancialOs.completed && raw.cryptoFinancialOsBridge.bridgeCompleted,
        simulatorCompleted: raw.cryptoFinancialOs.completed,
        inProgress:
          (raw.cryptoFinancialOs.lastStep > 0 && !raw.cryptoFinancialOs.completed) ||
          (raw.cryptoFinancialOs.completed && !raw.cryptoFinancialOsBridge.bridgeCompleted),
        bridgeCompleted: raw.cryptoFinancialOsBridge.bridgeCompleted,
        recognitionPassed: raw.cryptoFinancialOsBridge.conceptsMastered.length >= 5,
        replayWatched: false,
        mastery:
          raw.cryptoFinancialOs.completed &&
          raw.cryptoFinancialOsBridge.bridgeCompleted &&
          raw.cryptoFinancialOsBridge.certified,
      };
    case "first-trade-checklist":
      return {
        completed: raw.firstTradeChecklist.completed && raw.firstTradeChecklistBridge.bridgeCompleted,
        simulatorCompleted: raw.firstTradeChecklist.completed,
        inProgress:
          (raw.firstTradeChecklist.lastStep > 0 && !raw.firstTradeChecklist.completed) ||
          (raw.firstTradeChecklist.completed && !raw.firstTradeChecklistBridge.bridgeCompleted),
        bridgeCompleted: raw.firstTradeChecklistBridge.bridgeCompleted,
        recognitionPassed: raw.firstTradeChecklistBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.firstTradeChecklist.completed &&
          raw.firstTradeChecklistBridge.bridgeCompleted &&
          raw.firstTradeChecklistBridge.certified,
      };
    case "market-structure":
      return {
        completed: raw.marketStructure.completed && raw.marketStructureBridge.bridgeCompleted,
        simulatorCompleted: raw.marketStructure.completed,
        inProgress:
          (raw.marketStructure.lastStep > 0 && !raw.marketStructure.completed) ||
          (raw.marketStructure.completed && !raw.marketStructureBridge.bridgeCompleted),
        bridgeCompleted: raw.marketStructureBridge.bridgeCompleted,
        recognitionPassed: raw.marketStructureBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.marketStructure.completed &&
          raw.marketStructureBridge.bridgeCompleted &&
          raw.marketStructureBridge.certified,
      };
    case "liquidity-deep":
      return {
        completed: raw.liquidityDeep.completed && raw.liquidityDeepBridge.bridgeCompleted,
        simulatorCompleted: raw.liquidityDeep.completed,
        inProgress:
          (raw.liquidityDeep.lastStep > 0 && !raw.liquidityDeep.completed) ||
          (raw.liquidityDeep.completed && !raw.liquidityDeepBridge.bridgeCompleted),
        bridgeCompleted: raw.liquidityDeepBridge.bridgeCompleted,
        recognitionPassed: raw.liquidityDeepBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.liquidityDeep.completed &&
          raw.liquidityDeepBridge.bridgeCompleted &&
          raw.liquidityDeepBridge.certified,
      };
    case "cross-market":
      return {
        completed: raw.crossMarket.completed && raw.crossMarketBridge.bridgeCompleted,
        simulatorCompleted: raw.crossMarket.completed,
        inProgress:
          (raw.crossMarket.lastStep > 0 && !raw.crossMarket.completed) ||
          (raw.crossMarket.completed && !raw.crossMarketBridge.bridgeCompleted),
        bridgeCompleted: raw.crossMarketBridge.bridgeCompleted,
        recognitionPassed: raw.crossMarketBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.crossMarket.completed &&
          raw.crossMarketBridge.bridgeCompleted &&
          raw.crossMarketBridge.certified,
      };
    case "macro-flows":
      return {
        completed: raw.macroFlows.completed && raw.macroFlowsBridge.bridgeCompleted,
        simulatorCompleted: raw.macroFlows.completed,
        inProgress:
          (raw.macroFlows.lastStep > 0 && !raw.macroFlows.completed) ||
          (raw.macroFlows.completed && !raw.macroFlowsBridge.bridgeCompleted),
        bridgeCompleted: raw.macroFlowsBridge.bridgeCompleted,
        recognitionPassed: raw.macroFlowsBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.macroFlows.completed &&
          raw.macroFlowsBridge.bridgeCompleted &&
          raw.macroFlowsBridge.certified,
      };
    case "intelligence-desk":
      return {
        completed: raw.intelligenceDesk.completed && raw.intelligenceDeskBridge.bridgeCompleted,
        simulatorCompleted: raw.intelligenceDesk.completed,
        inProgress:
          (raw.intelligenceDesk.lastStep > 0 && !raw.intelligenceDesk.completed) ||
          (raw.intelligenceDesk.completed && !raw.intelligenceDeskBridge.bridgeCompleted),
        bridgeCompleted: raw.intelligenceDeskBridge.bridgeCompleted,
        recognitionPassed: raw.intelligenceDeskBridge.conceptsMastered.length >= 3,
        replayWatched: false,
        mastery:
          raw.intelligenceDesk.completed &&
          raw.intelligenceDeskBridge.bridgeCompleted &&
          raw.intelligenceDeskBridge.certified,
      };
    default:
      return {
        completed: false,
        simulatorCompleted: false,
        inProgress: false,
        bridgeCompleted: false,
        recognitionPassed: false,
        replayWatched: false,
        mastery: false,
      };
  }
}

function pathCoreComplete(path: PathId, raw: RawAcademyProgress, statuses: Map<string, LessonStatus>): boolean {
  const lessons = ACADEMY_LESSONS.filter((l) => l.path === path);
  const liveLessons = lessons.filter((l) => l.live);
  if (liveLessons.length === 0) return false;
  return liveLessons.every((l) => statuses.get(l.id) === "completed");
}

export function lessonStatus(
  lesson: AcademyLesson,
  raw: RawAcademyProgress,
  statuses: Map<string, LessonStatus>,
): LessonStatus {
  if (!lesson.live) {
    if (lesson.requiresPathComplete && !pathCoreComplete(lesson.requiresPathComplete, raw, statuses)) {
      return "locked";
    }
    if (lesson.prerequisiteId && statuses.get(lesson.prerequisiteId) !== "completed") {
      return "locked";
    }
    return "coming_soon";
  }

  if (lesson.requiresPathComplete) {
    const gate = pathCoreComplete(lesson.requiresPathComplete, raw, statuses);
    if (!gate) return "locked";
  }

  if (lesson.prerequisiteId) {
    const prereq = statuses.get(lesson.prerequisiteId);
    if (prereq !== "completed") return "locked";
  }

  const p = lessonProgress(lesson.id, raw);
  if (p.mastery) return "completed";
  if (p.inProgress || p.completed) return "in_progress";
  return "available";
}

export function buildLessonStatuses(raw: RawAcademyProgress): Map<string, LessonStatus> {
  const statuses = new Map<string, LessonStatus>();
  // Two passes so path gates resolve after prerequisites.
  for (const lesson of ACADEMY_LESSONS) {
    statuses.set(lesson.id, lessonStatus(lesson, raw, statuses));
  }
  for (const lesson of ACADEMY_LESSONS) {
    statuses.set(lesson.id, lessonStatus(lesson, raw, statuses));
  }
  return statuses;
}

export function operatorLevel(raw: RawAcademyProgress, statuses: Map<string, LessonStatus>): OperatorRank {
  const fundingDone = statuses.get("funding") === "completed";
  const obDone = statuses.get("order-book") === "completed";
  const mmDone = statuses.get("market-mechanics") === "completed";
  const interStarted = ACADEMY_LESSONS.filter((l) => l.path === "intermediate").some(
    (l) => statuses.get(l.id) === "completed" || statuses.get(l.id) === "in_progress",
  );
  const proStarted = ACADEMY_LESSONS.filter((l) => l.path === "professional").some(
    (l) => statuses.get(l.id) === "completed" || statuses.get(l.id) === "in_progress",
  );

  if (proStarted) return OPERATOR_RANKS[4]!;
  if (interStarted) return OPERATOR_RANKS[3]!;
  if (fundingDone) return OPERATOR_RANKS[2]!;
  if (obDone) return OPERATOR_RANKS[1]!;
  if (mmDone) return OPERATOR_RANKS[0]!;
  return { level: 0, title: "New Operator", requirement: "Start Market Mechanics" };
}

export function recommendedNext(
  statuses: Map<string, LessonStatus>,
): { lesson: AcademyLesson; reason: string } | null {
  const order = [...ACADEMY_LESSONS].sort((a, b) => a.order - b.order);
  for (const lesson of order) {
    const s = statuses.get(lesson.id);
    if (s === "available" || s === "in_progress") {
      const reason =
        lesson.id === "order-book" && statuses.get("market-mechanics") === "completed"
          ? "You completed Market Mechanics — Order Book is next."
          : lesson.id === "funding" && statuses.get("order-book") === "completed"
            ? "You completed Order Book — Funding & Crowding is next."
            : lesson.id === "trade-types" && statuses.get("funding") === "completed"
              ? "You completed Funding — Trade Types is next."
              : lesson.id === "liquidations" && statuses.get("trade-types") === "completed"
                ? "You completed Trade Types — Liquidations is next."
                : lesson.id === "risk-management" && statuses.get("liquidations") === "completed"
                  ? "You completed Liquidations — Risk Management is next."
                  : lesson.id === "slippage" && statuses.get("risk-management") === "completed"
                    ? "You completed the beginner path core — Slippage is your first intermediate module."
                    : lesson.id === "execution" && statuses.get("slippage") === "completed"
                      ? "You completed Slippage — Execution is next."
                      : lesson.id === "portfolio-risk" && statuses.get("execution") === "completed"
                        ? "You completed Execution — Portfolio Risk is the final core operator lesson."
                        : lesson.id === "daily-operations" && statuses.get("portfolio-risk") === "completed"
                          ? "Core curriculum complete — Daily Operations is your platform operating system."
                          : lesson.id === "operator-journal" && statuses.get("daily-operations") === "completed"
                            ? "Daily Operations complete — Operator Journal is your trading memory."
                            : lesson.id === "live-desk" && statuses.get("operator-journal") === "completed"
                              ? "Operator Journal complete — Live Desk is your real-time awareness layer."
                              : lesson.id === "market-state" && statuses.get("live-desk") === "completed"
                                ? "Live Desk complete — Market State Layer teaches how to adapt to CALM, ACTIVE, THIN, and STRESS."
                                : lesson.id === "daily-briefing" && statuses.get("market-state") === "completed"
                                  ? "Market State complete — Daily Briefing Engine tells you what to pay attention to today."
                                  : lesson.id === "market-memory" && statuses.get("daily-briefing") === "completed"
                                    ? "Daily Briefing complete — Market Memory Archive teaches what happened before and why it matters today."
                                    : lesson.id === "crypto-financial-os" && statuses.get("market-memory") === "completed"
                                      ? "Market Memory complete — Crypto Financial OS teaches the integrated operating system that powers the terminal."
                                      : `Continue the ${lesson.path} path.`;
      return { lesson, reason };
    }
  }
  const nextRoadmap = order.find((l) => statuses.get(l.id) === "coming_soon");
  if (nextRoadmap) {
    return { lesson: nextRoadmap, reason: "Coming soon — more modules are in development." };
  }
  return null;
}

export const PATH_LABELS: Record<PathId, string> = {
  beginner: "Beginner Trader Path",
  intermediate: "Intermediate Path",
  professional: "Professional Path",
};
