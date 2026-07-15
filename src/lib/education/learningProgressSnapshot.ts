import type { RawAcademyProgress } from "@/lib/education/learningAcademy";

/** Read persisted lesson progress from localStorage (client only). */
export function readAcademyProgress(): RawAcademyProgress {
  const fallback: RawAcademyProgress = {
    marketMechanics: { completed: false, lastStep: 0 },
    marketMechanicsBridge: { bridgeCompleted: false, conceptsMastered: [] },
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
    marketState: { completed: false, lastStep: 0 },
    marketStateBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    dailyBriefing: { completed: false, lastStep: 0 },
    dailyBriefingBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    marketMemory: { completed: false, lastStep: 0 },
    marketMemoryBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    cryptoFinancialOs: { completed: false, lastStep: 0 },
    cryptoFinancialOsBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    firstTradeChecklist: { completed: false, lastStep: 0 },
    firstTradeChecklistBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    marketStructure: { completed: false, lastStep: 0 },
    marketStructureBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    liquidityDeep: { completed: false, lastStep: 0 },
    liquidityDeepBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    crossMarket: { completed: false, lastStep: 0 },
    crossMarketBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    macroFlows: { completed: false, lastStep: 0 },
    macroFlowsBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
    intelligenceDesk: { completed: false, lastStep: 0 },
    intelligenceDeskBridge: { bridgeCompleted: false, certified: false, conceptsMastered: [] },
  };

  if (typeof window === "undefined") return fallback;

  try {
    const mm = JSON.parse(localStorage.getItem("eq-market-mechanics-progress-v1") ?? "{}");
    const mmBridge = JSON.parse(localStorage.getItem("eq-market-mechanics-bridge-memory-v1") ?? "{}");
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
    const ms = JSON.parse(localStorage.getItem("eq-market-state-progress-v1") ?? "{}");
    const msBridge = JSON.parse(localStorage.getItem("eq-market-state-bridge-memory-v1") ?? "{}");
    const db = JSON.parse(localStorage.getItem("eq-daily-briefing-progress-v1") ?? "{}");
    const dbBridge = JSON.parse(localStorage.getItem("eq-daily-briefing-bridge-memory-v1") ?? "{}");
    const mem = JSON.parse(localStorage.getItem("eq-market-memory-progress-v1") ?? "{}");
    const memBridge = JSON.parse(localStorage.getItem("eq-market-memory-bridge-memory-v1") ?? "{}");
    const cfo = JSON.parse(localStorage.getItem("eq-crypto-financial-os-progress-v1") ?? "{}");
    const cfoBridge = JSON.parse(localStorage.getItem("eq-crypto-financial-os-bridge-memory-v1") ?? "{}");
    const ft = JSON.parse(localStorage.getItem("eq-first-trade-progress-v1") ?? "{}");
    const ftBridge = JSON.parse(localStorage.getItem("eq-first-trade-bridge-memory-v1") ?? "{}");
    const mstruct = JSON.parse(localStorage.getItem("eq-market-structure-progress-v1") ?? "{}");
    const mstructBridge = JSON.parse(localStorage.getItem("eq-market-structure-bridge-memory-v1") ?? "{}");
    const liqDeep = JSON.parse(localStorage.getItem("eq-liquidity-deep-progress-v1") ?? "{}");
    const liqDeepBridge = JSON.parse(localStorage.getItem("eq-liquidity-deep-bridge-memory-v1") ?? "{}");
    const crossMarket = JSON.parse(localStorage.getItem("eq-cross-market-progress-v1") ?? "{}");
    const crossMarketBridge = JSON.parse(localStorage.getItem("eq-cross-market-bridge-memory-v1") ?? "{}");
    const macroFlows = JSON.parse(localStorage.getItem("eq-macro-flows-progress-v1") ?? "{}");
    const macroFlowsBridge = JSON.parse(localStorage.getItem("eq-macro-flows-bridge-memory-v1") ?? "{}");
    const intelligenceDesk = JSON.parse(localStorage.getItem("eq-intelligence-desk-progress-v1") ?? "{}");
    const intelligenceDeskBridge = JSON.parse(localStorage.getItem("eq-intelligence-desk-bridge-memory-v1") ?? "{}");

    return {
      marketMechanics: {
        completed: Boolean(mm.completed),
        lastStep: Number.isFinite(mm.lastStep) ? Number(mm.lastStep) : 0,
      },
      marketMechanicsBridge: {
        bridgeCompleted: Boolean(mmBridge.bridgeCompleted),
        conceptsMastered: Array.isArray(mmBridge.conceptsMastered) ? mmBridge.conceptsMastered : [],
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
      marketState: {
        completed: Boolean(ms.completed),
        lastStep: Number.isFinite(ms.lastStep) ? Number(ms.lastStep) : 0,
      },
      marketStateBridge: {
        bridgeCompleted: Boolean(msBridge.bridgeCompleted),
        certified: Boolean(msBridge.certified),
        conceptsMastered: Array.isArray(msBridge.conceptsMastered) ? msBridge.conceptsMastered : [],
      },
      dailyBriefing: {
        completed: Boolean(db.completed),
        lastStep: Number.isFinite(db.lastStep) ? Number(db.lastStep) : 0,
      },
      dailyBriefingBridge: {
        bridgeCompleted: Boolean(dbBridge.bridgeCompleted),
        certified: Boolean(dbBridge.certified),
        conceptsMastered: Array.isArray(dbBridge.conceptsMastered) ? dbBridge.conceptsMastered : [],
      },
      marketMemory: {
        completed: Boolean(mem.completed),
        lastStep: Number.isFinite(mem.lastStep) ? Number(mem.lastStep) : 0,
      },
      marketMemoryBridge: {
        bridgeCompleted: Boolean(memBridge.bridgeCompleted),
        certified: Boolean(memBridge.certified),
        conceptsMastered: Array.isArray(memBridge.conceptsMastered) ? memBridge.conceptsMastered : [],
      },
      cryptoFinancialOs: {
        completed: Boolean(cfo.completed),
        lastStep: Number.isFinite(cfo.lastStep) ? Number(cfo.lastStep) : 0,
      },
      cryptoFinancialOsBridge: {
        bridgeCompleted: Boolean(cfoBridge.bridgeCompleted),
        certified: Boolean(cfoBridge.certified),
        conceptsMastered: Array.isArray(cfoBridge.conceptsMastered) ? cfoBridge.conceptsMastered : [],
      },
      firstTradeChecklist: {
        completed: Boolean(ft.completed),
        lastStep: Number.isFinite(ft.lastStep) ? Number(ft.lastStep) : 0,
      },
      firstTradeChecklistBridge: {
        bridgeCompleted: Boolean(ftBridge.bridgeCompleted),
        certified: Boolean(ftBridge.certified),
        conceptsMastered: Array.isArray(ftBridge.conceptsMastered) ? ftBridge.conceptsMastered : [],
      },
      marketStructure: {
        completed: Boolean(mstruct.completed),
        lastStep: Number.isFinite(mstruct.lastStep) ? Number(mstruct.lastStep) : 0,
      },
      marketStructureBridge: {
        bridgeCompleted: Boolean(mstructBridge.bridgeCompleted),
        certified: Boolean(mstructBridge.certified),
        conceptsMastered: Array.isArray(mstructBridge.conceptsMastered) ? mstructBridge.conceptsMastered : [],
      },
      liquidityDeep: {
        completed: Boolean(liqDeep.completed),
        lastStep: Number.isFinite(liqDeep.lastStep) ? Number(liqDeep.lastStep) : 0,
      },
      liquidityDeepBridge: {
        bridgeCompleted: Boolean(liqDeepBridge.bridgeCompleted),
        certified: Boolean(liqDeepBridge.certified),
        conceptsMastered: Array.isArray(liqDeepBridge.conceptsMastered) ? liqDeepBridge.conceptsMastered : [],
      },
      crossMarket: {
        completed: Boolean(crossMarket.completed),
        lastStep: Number.isFinite(crossMarket.lastStep) ? Number(crossMarket.lastStep) : 0,
      },
      crossMarketBridge: {
        bridgeCompleted: Boolean(crossMarketBridge.bridgeCompleted),
        certified: Boolean(crossMarketBridge.certified),
        conceptsMastered: Array.isArray(crossMarketBridge.conceptsMastered)
          ? crossMarketBridge.conceptsMastered
          : [],
      },
      macroFlows: {
        completed: Boolean(macroFlows.completed),
        lastStep: Number.isFinite(macroFlows.lastStep) ? Number(macroFlows.lastStep) : 0,
      },
      macroFlowsBridge: {
        bridgeCompleted: Boolean(macroFlowsBridge.bridgeCompleted),
        certified: Boolean(macroFlowsBridge.certified),
        conceptsMastered: Array.isArray(macroFlowsBridge.conceptsMastered)
          ? macroFlowsBridge.conceptsMastered
          : [],
      },
      intelligenceDesk: {
        completed: Boolean(intelligenceDesk.completed),
        lastStep: Number.isFinite(intelligenceDesk.lastStep) ? Number(intelligenceDesk.lastStep) : 0,
      },
      intelligenceDeskBridge: {
        bridgeCompleted: Boolean(intelligenceDeskBridge.bridgeCompleted),
        certified: Boolean(intelligenceDeskBridge.certified),
        conceptsMastered: Array.isArray(intelligenceDeskBridge.conceptsMastered)
          ? intelligenceDeskBridge.conceptsMastered
          : [],
      },
    };
  } catch {
    return fallback;
  }
}
