import type { RawAcademyProgress } from "@/lib/education/learningAcademy";

/** Read persisted lesson progress from localStorage (client only). */
export function readAcademyProgress(): RawAcademyProgress {
  const fallback: RawAcademyProgress = {
    marketMechanics: { completed: false, lastStep: 0 },
    orderBook: { completed: false, lastStep: 0, replayWatched: false },
    orderBookBridge: { bridgeCompleted: false, conceptsMastered: [] },
    funding: { completed: false, lastStep: 0 },
    fundingBridge: { bridgeCompleted: false, conceptsMastered: [] },
    tradeTypes: { completed: false, lastStep: 0 },
    tradeTypesBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    liquidations: { completed: false, lastStep: 0 },
    liquidationsBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    riskManagement: { completed: false, lastStep: 0 },
    riskManagementBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    slippage: { completed: false, lastStep: 0 },
    slippageBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    execution: { completed: false, lastStep: 0 },
    executionBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    portfolioRisk: { completed: false, lastStep: 0 },
    portfolioRiskBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    dailyOperations: { completed: false, lastStep: 0 },
    dailyOperationsBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    operatorJournal: { completed: false, lastStep: 0 },
    operatorJournalBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    liveDesk: { completed: false, lastStep: 0 },
    liveDeskBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
  };

  if (typeof window === "undefined") return fallback;

  try {
    const mm = JSON.parse(localStorage.getItem("eq-market-mechanics-progress-v1") ?? "{}");
    const ob = JSON.parse(localStorage.getItem("eq-ob-lesson-progress-v2") ?? "{}");
    const obBridge = JSON.parse(localStorage.getItem("eq-lesson-bridge-memory-v1") ?? "{}");
    const fund = JSON.parse(localStorage.getItem("eq-funding-crowding-progress-v1") ?? "{}");
    const fundBridge = JSON.parse(localStorage.getItem("eq-funding-bridge-memory-v1") ?? "{}");
    const tt = JSON.parse(localStorage.getItem("eq-trade-types-progress-v1") ?? "{}");
    const ttBridge = JSON.parse(localStorage.getItem("eq-trade-types-bridge-memory-v1") ?? "{}");
    const liq = JSON.parse(localStorage.getItem("eq-liquidations-progress-v1") ?? "{}");
    const liqBridge = JSON.parse(localStorage.getItem("eq-liquidations-bridge-memory-v1") ?? "{}");
    const rm = JSON.parse(localStorage.getItem("eq-risk-management-progress-v1") ?? "{}");
    const rmBridge = JSON.parse(localStorage.getItem("eq-risk-management-bridge-memory-v1") ?? "{}");
    const slip = JSON.parse(localStorage.getItem("eq-slippage-progress-v1") ?? "{}");
    const slipBridge = JSON.parse(localStorage.getItem("eq-slippage-bridge-memory-v1") ?? "{}");
    const exec = JSON.parse(localStorage.getItem("eq-execution-progress-v1") ?? "{}");
    const execBridge = JSON.parse(localStorage.getItem("eq-execution-bridge-memory-v1") ?? "{}");
    const pr = JSON.parse(localStorage.getItem("eq-portfolio-risk-progress-v1") ?? "{}");
    const prBridge = JSON.parse(localStorage.getItem("eq-portfolio-risk-bridge-memory-v1") ?? "{}");
    const dailyOps = JSON.parse(localStorage.getItem("eq-daily-operations-progress-v1") ?? "{}");
    const dailyOpsBridge = JSON.parse(localStorage.getItem("eq-daily-operations-bridge-memory-v1") ?? "{}");
    const oj = JSON.parse(localStorage.getItem("eq-operator-journal-progress-v1") ?? "{}");
    const ojBridge = JSON.parse(localStorage.getItem("eq-operator-journal-bridge-memory-v1") ?? "{}");
    const ld = JSON.parse(localStorage.getItem("eq-live-desk-progress-v1") ?? "{}");
    const ldBridge = JSON.parse(localStorage.getItem("eq-live-desk-bridge-memory-v1") ?? "{}");

    return {
      marketMechanics: {
        completed: Boolean(mm.completed),
        lastStep: Number.isFinite(mm.lastStep) ? Number(mm.lastStep) : 0,
      },
      orderBook: {
        completed: Boolean(ob.completed),
        lastStep: Number.isFinite(ob.lastStep) ? Number(ob.lastStep) : 0,
        replayWatched: Boolean(ob.replayWatched),
      },
      orderBookBridge: {
        bridgeCompleted: Boolean(obBridge.bridgeCompleted),
        conceptsMastered: Array.isArray(obBridge.conceptsMastered) ? obBridge.conceptsMastered : [],
      },
      funding: {
        completed: Boolean(fund.completed),
        lastStep: Number.isFinite(fund.lastStep) ? Number(fund.lastStep) : 0,
      },
      fundingBridge: {
        bridgeCompleted: Boolean(fundBridge.bridgeCompleted),
        conceptsMastered: Array.isArray(fundBridge.conceptsMastered) ? fundBridge.conceptsMastered : [],
      },
      tradeTypes: {
        completed: Boolean(tt.completed),
        lastStep: Number.isFinite(tt.lastStep) ? Number(tt.lastStep) : 0,
      },
      tradeTypesBridge: {
        bridgeCompleted: Boolean(ttBridge.bridgeCompleted),
        certified: Boolean(ttBridge.certified),
        conceptsMastered: Array.isArray(ttBridge.conceptsMastered) ? ttBridge.conceptsMastered : [],
      },
      liquidations: {
        completed: Boolean(liq.completed),
        lastStep: Number.isFinite(liq.lastStep) ? Number(liq.lastStep) : 0,
      },
      liquidationsBridge: {
        bridgeCompleted: Boolean(liqBridge.bridgeCompleted),
        certified: Boolean(liqBridge.certified),
        conceptsMastered: Array.isArray(liqBridge.conceptsMastered) ? liqBridge.conceptsMastered : [],
      },
      riskManagement: {
        completed: Boolean(rm.completed),
        lastStep: Number.isFinite(rm.lastStep) ? Number(rm.lastStep) : 0,
      },
      riskManagementBridge: {
        bridgeCompleted: Boolean(rmBridge.bridgeCompleted),
        certified: Boolean(rmBridge.certified),
        conceptsMastered: Array.isArray(rmBridge.conceptsMastered) ? rmBridge.conceptsMastered : [],
      },
      slippage: {
        completed: Boolean(slip.completed),
        lastStep: Number.isFinite(slip.lastStep) ? Number(slip.lastStep) : 0,
      },
      slippageBridge: {
        bridgeCompleted: Boolean(slipBridge.bridgeCompleted),
        certified: Boolean(slipBridge.certified),
        conceptsMastered: Array.isArray(slipBridge.conceptsMastered) ? slipBridge.conceptsMastered : [],
      },
      execution: {
        completed: Boolean(exec.completed),
        lastStep: Number.isFinite(exec.lastStep) ? Number(exec.lastStep) : 0,
      },
      executionBridge: {
        bridgeCompleted: Boolean(execBridge.bridgeCompleted),
        certified: Boolean(execBridge.certified),
        conceptsMastered: Array.isArray(execBridge.conceptsMastered) ? execBridge.conceptsMastered : [],
      },
      portfolioRisk: {
        completed: Boolean(pr.completed),
        lastStep: Number.isFinite(pr.lastStep) ? Number(pr.lastStep) : 0,
      },
      portfolioRiskBridge: {
        bridgeCompleted: Boolean(prBridge.bridgeCompleted),
        certified: Boolean(prBridge.certified),
        conceptsMastered: Array.isArray(prBridge.conceptsMastered) ? prBridge.conceptsMastered : [],
      },
      dailyOperations: {
        completed: Boolean(dailyOps.completed),
        lastStep: Number.isFinite(dailyOps.lastStep) ? Number(dailyOps.lastStep) : 0,
      },
      dailyOperationsBridge: {
        bridgeCompleted: Boolean(dailyOpsBridge.bridgeCompleted),
        certified: Boolean(dailyOpsBridge.certified),
        conceptsMastered: Array.isArray(dailyOpsBridge.conceptsMastered) ? dailyOpsBridge.conceptsMastered : [],
      },
      operatorJournal: {
        completed: Boolean(oj.completed),
        lastStep: Number.isFinite(oj.lastStep) ? Number(oj.lastStep) : 0,
      },
      operatorJournalBridge: {
        bridgeCompleted: Boolean(ojBridge.bridgeCompleted),
        certified: Boolean(ojBridge.certified),
        conceptsMastered: Array.isArray(ojBridge.conceptsMastered) ? ojBridge.conceptsMastered : [],
      },
      liveDesk: {
        completed: Boolean(ld.completed),
        lastStep: Number.isFinite(ld.lastStep) ? Number(ld.lastStep) : 0,
      },
      liveDeskBridge: {
        bridgeCompleted: Boolean(ldBridge.bridgeCompleted),
        certified: Boolean(ldBridge.certified),
        conceptsMastered: Array.isArray(ldBridge.conceptsMastered) ? ldBridge.conceptsMastered : [],
      },
    };
  } catch {
    return fallback;
  }
}
