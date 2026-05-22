import { regimeClassifier } from "@/lib/quant/RegimeClassifier";
import type {
  BacktestConfig,
  BacktestResult,
  BacktestTradeLog,
  HistoricalMarketEvent,
  MarketRegime,
  RegimePerformance,
} from "@/types/quant-research";

export interface SignalRule {
  id: string;
  /** Long when book imbalance exceeds threshold in squeeze regime, etc. */
  entryImbalanceThreshold: number;
  exitImbalanceThreshold: number;
  favoredRegimes: MarketRegime[];
}

const DEFAULT_CONFIG: BacktestConfig = {
  slippageBps: 4.5,
  latencyMs: 28,
  positionSizePct: 2.5,
  maxPositionUsd: 250_000,
  validationSharpeFloor: 0.8,
  validationWinRateFloor: 0.48,
};

/**
 * Regime-aware event backtest engine — replays structural partitions with execution constraints.
 */
export class BacktestEngine {
  private static instance: BacktestEngine | null = null;
  private config: BacktestConfig = DEFAULT_CONFIG;

  static getInstance(): BacktestEngine {
    if (!BacktestEngine.instance) {
      BacktestEngine.instance = new BacktestEngine();
    }
    return BacktestEngine.instance;
  }

  setConfig(patch: Partial<BacktestConfig>): void {
    this.config = { ...this.config, ...patch };
  }

  getConfig(): BacktestConfig {
    return { ...this.config };
  }

  run(
    events: HistoricalMarketEvent[],
    rule: SignalRule,
    signalId: string,
    configOverride?: Partial<BacktestConfig>,
  ): BacktestResult {
    const cfg = { ...this.config, ...configOverride };
    const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const partitioned = regimeClassifier.partitionEventsByRegime(sorted);

    const allTrades: BacktestTradeLog[] = [];
    const regimePartitions: RegimePerformance[] = [];

    partitioned.forEach((regimeEvents, regime) => {
      const trades = this.simulateRegime(regimeEvents, rule, regime, cfg);
      allTrades.push(...trades);
      regimePartitions.push(this.summarizeRegime(regime, trades));
    });

    const aggregate = this.aggregatePerformance(allTrades);
    const environmentBoundaries = this.computeEnvironmentBoundaries(regimePartitions);

    return {
      runId: `bt-${signalId}-${Date.now()}`,
      signalId,
      regimePartitions,
      aggregate,
      trades: allTrades,
      environmentBoundaries,
    };
  }

  generateSyntheticHistory(
    coin: string,
    count: number,
    seedMid = 100,
  ): HistoricalMarketEvent[] {
    const events: HistoricalMarketEvent[] = [];
    let mid = seedMid;
    let funding = 0.0001;
    let t = Date.now() - count * 60_000;

    for (let i = 0; i < count; i += 1) {
      const shock = (Math.sin(i * 0.17) + Math.cos(i * 0.09)) * 0.004;
      mid = Math.max(1, mid * (1 + shock));
      const prevFunding = funding;
      funding = Math.max(-0.01, Math.min(0.01, funding + shock * 0.02));
      const bookImbalance = Math.sin(i * 0.11) * 0.35;
      const liquidationVelocity = Math.max(0, Math.sin(i * 0.23) * 0.5 + 0.1);
      const tradeFlowImbalance = Math.cos(i * 0.13) * 0.4;
      const volatility = 0.008 + Math.abs(shock) * 3;

      const regime = regimeClassifier.classify({
        realizedVol: volatility,
        bookImbalance,
        liquidationVelocity,
        fundingDelta: funding - prevFunding,
        spreadBps: 2 + Math.abs(shock) * 400,
      });

      events.push({
        id: `syn-${coin}-${i}`,
        timestamp: t,
        coin,
        regime,
        midPx: mid,
        bookImbalance,
        fundingRate: funding,
        fundingDelta: funding - prevFunding,
        liquidationVelocity,
        tradeFlowImbalance,
        volatility,
        signalTrigger: Math.abs(bookImbalance) > 0.22,
      });

      t += 60_000;
    }

    return events;
  }

  private simulateRegime(
    events: HistoricalMarketEvent[],
    rule: SignalRule,
    regime: MarketRegime,
    cfg: BacktestConfig,
  ): BacktestTradeLog[] {
    const trades: BacktestTradeLog[] = [];
    if (!rule.favoredRegimes.includes(regime) && regime !== "UNKNOWN") {
      return trades;
    }

    let open: {
      side: "long" | "short";
      entryPx: number;
      timestamp: number;
      sizeUsd: number;
    } | null = null;

    for (let i = 0; i < events.length; i += 1) {
      const ev = events[i];
      const latencyShift = Math.min(events.length - 1, i + Math.ceil(cfg.latencyMs / 60_000));
      const execEv = events[latencyShift] ?? ev;

      if (!open) {
        const goLong =
          ev.bookImbalance >= rule.entryImbalanceThreshold && ev.signalTrigger;
        const goShort =
          ev.bookImbalance <= -rule.entryImbalanceThreshold && ev.signalTrigger;

        if (goLong || goShort) {
          const side = goLong ? "long" : "short";
          const slip = (cfg.slippageBps / 10_000) * execEv.midPx;
          const entryPx = side === "long" ? execEv.midPx + slip : execEv.midPx - slip;
          const accountSlice = cfg.maxPositionUsd * (cfg.positionSizePct / 100);
          open = {
            side,
            entryPx,
            timestamp: execEv.timestamp,
            sizeUsd: Math.min(accountSlice, cfg.maxPositionUsd),
          };
        }
        continue;
      }

      const exitSignal =
        open.side === "long"
          ? ev.bookImbalance <= rule.exitImbalanceThreshold
          : ev.bookImbalance >= -rule.exitImbalanceThreshold;

      if (!exitSignal && i < events.length - 1) continue;

      const slip = (cfg.slippageBps / 10_000) * execEv.midPx;
      const exitPx =
        open.side === "long" ? execEv.midPx - slip : execEv.midPx + slip;
      const direction = open.side === "long" ? 1 : -1;
      const pnlPct = (direction * (exitPx - open.entryPx)) / open.entryPx;
      const pnlUsd = open.sizeUsd * pnlPct;

      trades.push({
        id: `t-${regime}-${trades.length}-${ev.timestamp}`,
        timestamp: execEv.timestamp,
        regime,
        side: open.side,
        entryPx: open.entryPx,
        exitPx,
        sizeUsd: open.sizeUsd,
        pnlUsd,
        slippageBps: cfg.slippageBps,
        latencyMs: cfg.latencyMs,
      });

      open = null;
    }

    return trades;
  }

  private summarizeRegime(
    regime: MarketRegime,
    trades: BacktestTradeLog[],
  ): RegimePerformance {
    if (trades.length === 0) {
      return {
        regime,
        tradeCount: 0,
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        expectancy: 0,
        sampleSize: 0,
      };
    }

    let wins = 0;
    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;
    const returns: number[] = [];

    for (let i = 0; i < trades.length; i += 1) {
      const t = trades[i];
      if (t.pnlUsd > 0) wins += 1;
      equity += t.pnlUsd;
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? (peak - equity) / peak : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
      returns.push(t.sizeUsd > 0 ? t.pnlUsd / t.sizeUsd : 0);
    }

    const winRate = wins / trades.length;
    const expectancy = equity / trades.length;
    const sharpeRatio = sharpeFromReturns(returns);

    return {
      regime,
      tradeCount: trades.length,
      winRate,
      sharpeRatio,
      maxDrawdown,
      expectancy,
      sampleSize: trades.length,
    };
  }

  private aggregatePerformance(trades: BacktestTradeLog[]): BacktestResult["aggregate"] {
    if (trades.length === 0) {
      return {
        sharpeRatio: 0,
        winRate: 0,
        maxDrawdown: 0,
        expectancy: 0,
        tradeCount: 0,
      };
    }

    const summary = this.summarizeRegime("UNKNOWN", trades);
    return {
      sharpeRatio: summary.sharpeRatio,
      winRate: summary.winRate,
      maxDrawdown: summary.maxDrawdown,
      expectancy: summary.expectancy,
      tradeCount: summary.tradeCount,
    };
  }

  private computeEnvironmentBoundaries(
    partitions: RegimePerformance[],
  ): BacktestResult["environmentBoundaries"] {
    const globalSharpe =
      partitions.reduce((a, p) => a + p.sharpeRatio, 0) /
      Math.max(1, partitions.length);

    return partitions.map((p) => ({
      regime: p.regime,
      edgeDegrades: p.sharpeRatio < globalSharpe * 0.55 && p.sampleSize >= 3,
      sharpeDelta: p.sharpeRatio - globalSharpe,
    }));
  }
}

function sharpeFromReturns(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  let varSum = 0;
  for (let i = 0; i < returns.length; i += 1) {
    const d = returns[i] - mean;
    varSum += d * d;
  }
  const std = Math.sqrt(varSum / returns.length);
  if (std === 0) return 0;
  return (mean / std) * Math.sqrt(252);
}

export const backtestEngine = BacktestEngine.getInstance();
