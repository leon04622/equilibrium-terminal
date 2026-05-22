import {
  FEATURE_SLOT_COUNT,
  FlatFeatureBuffer,
  nowNs,
} from "@/lib/quant/FlatFeatureBuffer";
import { regimeClassifier } from "@/lib/quant/RegimeClassifier";
import type {
  FlatFeatureSnapshot,
  MarketFeature,
  MarketRegime,
} from "@/types/quant-research";
import type {
  NormalizedOrderBook,
  NormalizedTrade,
} from "@/types/terminal-schema";

export interface FeaturePipelineInput {
  coin: string;
  book: NormalizedOrderBook | null;
  recentTrades: NormalizedTrade[];
  fundingRate: number;
  prevFundingRate: number;
}

export type FeatureFlushHandler = (payload: {
  coin: string;
  features: MarketFeature[];
  snapshot: FlatFeatureSnapshot;
  cycleMs: number;
}) => void;

interface CoinAccumulator {
  fundingRate: number;
  prevFundingRate: number;
  sellNotionalWindow: number;
  buyNotionalWindow: number;
  oiProxy: number;
  prevOiProxy: number;
  lastMid: number | null;
  midReturns: number[];
}

/**
 * Real-time feature extraction — flat buffers, microtask scheduling, optional worker offload.
 */
export class FeaturePipeline {
  private static instance: FeaturePipeline | null = null;

  private readonly buffer = new FlatFeatureBuffer(64);
  private readonly accumulators = new Map<string, CoinAccumulator>();
  private readonly pending: FeaturePipelineInput[] = [];
  private flushScheduled = false;
  private flushHandler: FeatureFlushHandler | null = null;
  private worker: Worker | null = null;
  private workerReady = false;
  private lastCycleMs = 0;
  private active = false;

  static getInstance(): FeaturePipeline {
    if (!FeaturePipeline.instance) {
      FeaturePipeline.instance = new FeaturePipeline();
    }
    return FeaturePipeline.instance;
  }

  start(handler: FeatureFlushHandler): void {
    this.flushHandler = handler;
    this.active = true;
    this.initWorker();
  }

  stop(): void {
    this.active = false;
    this.flushHandler = null;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerReady = false;
    }
  }

  getLastCycleMs(): number {
    return this.lastCycleMs;
  }

  getBuffer(): FlatFeatureBuffer {
    return this.buffer;
  }

  enqueue(input: FeaturePipelineInput): void {
    if (!this.active) return;
    this.pending.push(input);
    this.scheduleFlush();
  }

  extractDeterministic(input: FeaturePipelineInput): FlatFeatureSnapshot {
    const acc = this.getAccumulator(input.coin);
    if (input.book) {
      acc.lastMid = input.book.mid;
    }
    acc.fundingRate = input.fundingRate;
    acc.prevFundingRate = input.prevFundingRate;

    for (const t of input.recentTrades) {
      if (t.coin !== input.coin) continue;
      if (t.side === "buy") {
        acc.buyNotionalWindow += t.notionalUsd;
      } else {
        acc.sellNotionalWindow += t.notionalUsd;
      }
      if (t.side === "sell" && t.notionalUsd >= 35_000) {
        acc.sellNotionalWindow += t.notionalUsd * 0.15;
      }
    }

    const values = this.mapToFlatVector(input, acc);
    const computedAtNs = nowNs();
    const regime = regimeClassifier.classify({
      realizedVol: values[6],
      bookImbalance: values[0],
      liquidationVelocity: values[2],
      fundingDelta: values[1],
      spreadBps: values[4],
    });

    this.buffer.writeRow(input.coin, values, computedAtNs, regime);

    return {
      coin: input.coin,
      computedAtNs,
      regime,
      values,
    };
  }

  private initWorker(): void {
    if (typeof window === "undefined" || typeof Worker === "undefined") return;
    try {
      const worker = new Worker(
        new URL("./feature.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.onmessage = (ev: MessageEvent<{ ok: boolean; values?: number[] }>) => {
        if (!ev.data.ok || !ev.data.values) return;
        this.workerReady = true;
      };
      worker.onerror = () => {
        this.worker = null;
        this.workerReady = false;
      };
      this.worker = worker;
    } catch {
      this.worker = null;
      this.workerReady = false;
    }
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;

    const run = () => {
      this.flushScheduled = false;
      if (!this.active || !this.flushHandler) return;
      const t0 = performance.now();
      const batch = this.pending.splice(0, this.pending.length);
      for (const input of batch) {
        const snapshot = this.extractDeterministic(input);
        const features = this.buffer.toMarketFeatures(
          input.coin,
          snapshot.computedAtNs,
          snapshot.regime,
        );
        this.flushHandler({
          coin: input.coin,
          features,
          snapshot,
          cycleMs: performance.now() - t0,
        });
      }
      this.lastCycleMs = performance.now() - t0;
      if (this.pending.length > 0) this.scheduleFlush();
    };

    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => {
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(() => run(), { timeout: 24 });
        } else {
          run();
        }
      });
    } else if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => run(), { timeout: 24 });
    } else {
      setTimeout(run, 0);
    }
  }

  private getAccumulator(coin: string): CoinAccumulator {
    let acc = this.accumulators.get(coin);
    if (!acc) {
      acc = {
        fundingRate: 0.0001,
        prevFundingRate: 0.0001,
        sellNotionalWindow: 0,
        buyNotionalWindow: 0,
        oiProxy: 1_000_000,
        prevOiProxy: 1_000_000,
        lastMid: null,
        midReturns: [],
      };
      this.accumulators.set(coin, acc);
    }
    return acc;
  }

  private mapToFlatVector(
    input: FeaturePipelineInput,
    acc: CoinAccumulator,
  ): Float64Array {
    const values = new Float64Array(FEATURE_SLOT_COUNT);
    const book = input.book;

    let bidDepth = 0;
    let askDepth = 0;
    if (book) {
      for (let i = 0; i < book.bids.length; i += 1) {
        bidDepth += book.bids[i].size;
      }
      for (let i = 0; i < book.asks.length; i += 1) {
        askDepth += book.asks[i].size;
      }
    }
    const totalDepth = bidDepth + askDepth;
    values[0] = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;

    values[1] = acc.fundingRate - acc.prevFundingRate;
    acc.prevFundingRate = acc.fundingRate;

    const liqDenom = acc.buyNotionalWindow + acc.sellNotionalWindow + 1;
    values[2] = Math.min(1, acc.sellNotionalWindow / liqDenom);

    values[3] =
      liqDenom > 0
        ? (acc.buyNotionalWindow - acc.sellNotionalWindow) / liqDenom
        : 0;

    values[4] = book?.spreadBps ?? 0;

    const prevOi = acc.oiProxy;
    acc.oiProxy = acc.oiProxy * 0.985 + (acc.buyNotionalWindow + acc.sellNotionalWindow) * 0.015;
    values[5] = prevOi > 0 ? (acc.oiProxy - prevOi) / prevOi : 0;
    acc.prevOiProxy = acc.oiProxy;

    if (book?.mid != null && acc.lastMid != null && acc.lastMid > 0) {
      const ret = (book.mid - acc.lastMid) / acc.lastMid;
      acc.midReturns.push(ret);
      if (acc.midReturns.length > 48) {
        acc.midReturns = acc.midReturns.slice(-48);
      }
    }
    values[6] = realizedVolatility(acc.midReturns);

    acc.buyNotionalWindow *= 0.92;
    acc.sellNotionalWindow *= 0.92;

    return values;
  }
}

function realizedVolatility(returns: number[]): number {
  if (returns.length < 2) return 0.01;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  let varSum = 0;
  for (let i = 0; i < returns.length; i += 1) {
    const d = returns[i] - mean;
    varSum += d * d;
  }
  return Math.sqrt(varSum / returns.length);
}

export const featurePipeline = FeaturePipeline.getInstance();
