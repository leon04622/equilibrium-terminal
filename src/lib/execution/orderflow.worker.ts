/**
 * Isolated order-flow computation thread — CVD, imbalances, DOM matrix, microstructure flags.
 * Main thread receives throttled layout-ready packets only.
 */

import type {
  DomLadderLevel,
  DomMatrixPacket,
  ExecutionCopilotFlag,
  FootprintBar,
  FootprintCell,
  MarketParticipantKind,
  MarketParticipantProfile,
  OrderFlowMatrixPacket,
  SlippageMetric,
  VolumeImbalance,
} from "@/types/execution-intelligence";

export interface WorkerBookLevel {
  price: number;
  size: number;
  orders: number;
}

export interface WorkerBookSnapshot {
  coin: string;
  timeMs: number;
  bids: WorkerBookLevel[];
  asks: WorkerBookLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  mid: number | null;
  spreadBps: number | null;
}

export interface WorkerTradeTick {
  price: number;
  size: number;
  side: "buy" | "sell";
  timeMs: number;
  tid: number;
}

export type WorkerInboundMessage =
  | { type: "configure"; coin: string; tickSize: number }
  | { type: "book"; book: WorkerBookSnapshot }
  | { type: "trades"; trades: WorkerTradeTick[] }
  | { type: "flush" };

export type WorkerOutboundMessage =
  | { type: "packet"; packet: OrderFlowMatrixPacket }
  | { type: "error"; message: string };

const THROTTLE_MS = 16;
const DOM_DEPTH = 28;
const FOOTPRINT_BAR_MS = 60_000;
const SWEEP_NOTIONAL = 25_000;
const PASSIVE_BLOCK_SIZE = 8;

let coin = "BTC";
let tickSize = 1;
let packetSeq = 0;
let sessionBuyVol = 0;
let sessionSellVol = 0;
let lastEmitMs = 0;
let pendingEmit = false;

const tradeRing: WorkerTradeTick[] = [];
const RING_MAX = 512;

let lastBook: WorkerBookSnapshot | null = null;
const levelDeltaMap = new Map<number, number>();

function toNs(ms: number): number {
  return Math.floor(ms * 1_000_000);
}

function priceToTick(price: number): number {
  if (tickSize <= 0) return Math.round(price);
  return Math.round(price / tickSize);
}

function tickToPrice(tick: number): number {
  return tick * tickSize;
}

function pushTrades(trades: WorkerTradeTick[]): void {
  for (const t of trades) {
    tradeRing.push(t);
    const tick = priceToTick(t.price);
    const signed = t.side === "buy" ? t.size : -t.size;
    levelDeltaMap.set(tick, (levelDeltaMap.get(tick) ?? 0) + signed);
    if (t.side === "buy") sessionBuyVol += t.size;
    else sessionSellVol += t.size;
  }
  while (tradeRing.length > RING_MAX) {
    const removed = tradeRing.shift();
    if (!removed) break;
    const tick = priceToTick(removed.price);
    const signed = removed.side === "buy" ? removed.size : -removed.size;
    const next = (levelDeltaMap.get(tick) ?? 0) - signed;
    if (Math.abs(next) < 1e-12) levelDeltaMap.delete(tick);
    else levelDeltaMap.set(tick, next);
    if (removed.side === "buy") sessionBuyVol -= removed.size;
    else sessionSellVol -= removed.size;
  }
}

function sumLevels(levels: WorkerBookLevel[], depth: number): number {
  let total = 0;
  const n = Math.min(depth, levels.length);
  for (let i = 0; i < n; i++) {
    total += levels[i]?.size ?? 0;
  }
  return total;
}

function buildImbalance(book: WorkerBookSnapshot): VolumeImbalance {
  const bidResting = sumLevels(book.bids, 10);
  const askResting = sumLevels(book.asks, 10);
  const ratio = askResting > 0 ? bidResting / askResting : bidResting > 0 ? 99 : 1;
  let skew: VolumeImbalance["skew"] = "neutral";
  if (ratio > 1.15) skew = "bid";
  else if (ratio < 0.87) skew = "ask";
  return {
    bidResting,
    askResting,
    ratio,
    topLevels: 10,
    skew,
    updatedAtNs: toNs(book.timeMs),
  };
}

function detectSweeps(nowMs: number): MarketParticipantProfile[] {
  const windowMs = 800;
  const out: MarketParticipantProfile[] = [];
  let buyCluster = 0;
  let sellCluster = 0;
  let buyNotional = 0;
  let sellNotional = 0;

  for (let i = tradeRing.length - 1; i >= 0; i--) {
    const t = tradeRing[i];
    if (!t || nowMs - t.timeMs > windowMs) break;
    const notional = t.price * t.size;
    if (t.side === "buy") {
      buyCluster += 1;
      buyNotional += notional;
    } else {
      sellCluster += 1;
      sellNotional += notional;
    }
  }

  if (buyCluster >= 3 && buyNotional >= SWEEP_NOTIONAL) {
    out.push({
      id: `sweep-buy-${nowMs}`,
      kind: "hft_sweep",
      confidence: Math.min(98, 60 + buyCluster * 6),
      priceTick: priceToTick(tradeRing[tradeRing.length - 1]?.price ?? 0),
      sizeEstimate: buyNotional,
      detectedAtNs: toNs(nowMs),
      label: "AGGR BUY SWEEP",
    });
  }
  if (sellCluster >= 3 && sellNotional >= SWEEP_NOTIONAL) {
    out.push({
      id: `sweep-sell-${nowMs}`,
      kind: "hft_sweep",
      confidence: Math.min(98, 60 + sellCluster * 6),
      priceTick: priceToTick(tradeRing[tradeRing.length - 1]?.price ?? 0),
      sizeEstimate: sellNotional,
      detectedAtNs: toNs(nowMs),
      label: "AGGR SELL SWEEP",
    });
  }
  return out;
}

function detectPassiveBlocks(book: WorkerBookSnapshot): MarketParticipantProfile[] {
  const out: MarketParticipantProfile[] = [];
  const scan = (levels: WorkerBookLevel[], side: "bid" | "ask") => {
    for (const level of levels.slice(0, 12)) {
      if (level.size >= PASSIVE_BLOCK_SIZE && level.orders <= 3) {
        out.push({
          id: `passive-${side}-${priceToTick(level.price)}`,
          kind: "passive_absorption",
          confidence: Math.min(92, 45 + level.size * 4),
          priceTick: priceToTick(level.price),
          sizeEstimate: level.size,
          detectedAtNs: toNs(book.timeMs),
          label: side === "bid" ? "PASSIVE BID BLOCK" : "PASSIVE ASK BLOCK",
        });
      }
    }
  };
  scan(book.bids, "bid");
  scan(book.asks, "ask");
  return out.slice(0, 6);
}

function buildFootprintBars(nowMs: number): FootprintBar[] {
  const barStart = nowMs - FOOTPRINT_BAR_MS;
  const cells = new Map<number, FootprintCell>();
  for (const t of tradeRing) {
    if (t.timeMs < barStart) continue;
    const tick = priceToTick(t.price);
    const cell = cells.get(tick) ?? {
      priceTick: tick,
      bidVolume: 0,
      askVolume: 0,
      delta: 0,
      tradeCount: 0,
    };
    if (t.side === "buy") cell.bidVolume += t.size;
    else cell.askVolume += t.size;
    cell.delta = cell.bidVolume - cell.askVolume;
    cell.tradeCount += 1;
    cells.set(tick, cell);
  }
  const sorted = Array.from(cells.values()).sort((a, b) => b.priceTick - a.priceTick);
  if (sorted.length === 0) return [];
  const ticks = sorted.map((c) => c.priceTick);
  const bar: FootprintBar = {
    barId: `fp-${nowMs}`,
    openTime: barStart,
    closeTime: nowMs,
    openTick: ticks[ticks.length - 1] ?? 0,
    highTick: Math.max(...ticks),
    lowTick: Math.min(...ticks),
    closeTick: ticks[0] ?? 0,
    cells: sorted.slice(0, 48),
    barDelta: sorted.reduce((acc, c) => acc + c.delta, 0),
    totalVolume: sorted.reduce((acc, c) => acc + c.bidVolume + c.askVolume, 0),
  };
  return [bar];
}

function buildDomMatrix(book: WorkerBookSnapshot): DomMatrixPacket {
  const midPx =
    book.mid ?? (((book.bestBid ?? 0) + (book.bestAsk ?? 0)) / 2 || 0);
  const midTick = priceToTick(midPx);
  const bidMap = new Map<number, WorkerBookLevel>();
  const askMap = new Map<number, WorkerBookLevel>();
  for (const b of book.bids) bidMap.set(priceToTick(b.price), b);
  for (const a of book.asks) askMap.set(priceToTick(a.price), a);

  const maxBid = book.bids.reduce((m, l) => Math.max(m, l.size), 0);
  const maxAsk = book.asks.reduce((m, l) => Math.max(m, l.size), 0);
  const maxSize = Math.max(maxBid, maxAsk, 1e-9);

  const levels: DomLadderLevel[] = [];
  for (let offset = DOM_DEPTH; offset >= 1; offset--) {
    const tick = midTick + offset;
    const ask = askMap.get(tick);
    levels.push({
      priceTick: tick,
      price: tickToPrice(tick),
      bidSize: 0,
      askSize: ask?.size ?? 0,
      bidOrders: 0,
      askOrders: ask?.orders ?? 0,
      deltaAtLevel: levelDeltaMap.get(tick) ?? 0,
      heatIntensity: (ask?.size ?? 0) / maxSize,
      passiveBlock: (ask?.size ?? 0) >= PASSIVE_BLOCK_SIZE,
      voidScore: (ask?.size ?? 0) < 0.25 ? 0.85 : 0,
    });
  }

  levels.push({
    priceTick: midTick,
    price: tickToPrice(midTick),
    bidSize: bidMap.get(midTick)?.size ?? 0,
    askSize: askMap.get(midTick)?.size ?? 0,
    bidOrders: bidMap.get(midTick)?.orders ?? 0,
    askOrders: askMap.get(midTick)?.orders ?? 0,
    deltaAtLevel: levelDeltaMap.get(midTick) ?? 0,
    heatIntensity: 1,
    passiveBlock: false,
    voidScore: 0,
  });

  for (let offset = 1; offset <= DOM_DEPTH; offset++) {
    const tick = midTick - offset;
    const bid = bidMap.get(tick);
    levels.push({
      priceTick: tick,
      price: tickToPrice(tick),
      bidSize: bid?.size ?? 0,
      askSize: 0,
      bidOrders: bid?.orders ?? 0,
      askOrders: 0,
      deltaAtLevel: levelDeltaMap.get(tick) ?? 0,
      heatIntensity: (bid?.size ?? 0) / maxSize,
      passiveBlock: (bid?.size ?? 0) >= PASSIVE_BLOCK_SIZE,
      voidScore: (bid?.size ?? 0) < 0.25 ? 0.85 : 0,
    });
  }

  return {
    coin: book.coin,
    midTick,
    tickSize,
    levels,
    bestBid: book.bestBid,
    bestAsk: book.bestAsk,
    spreadBps: book.spreadBps,
    packetSeq: packetSeq + 1,
    computedAtNs: toNs(book.timeMs),
  };
}

function buildSlippage(book: WorkerBookSnapshot, spreadBps: number | null): SlippageMetric {
  const mid = book.mid ?? (((book.bestBid ?? 0) + (book.bestAsk ?? 0)) / 2 || 0);
  const spread = spreadBps ?? 0;
  let velocity = 0;
  if (tradeRing.length >= 2) {
    const a = tradeRing[tradeRing.length - 1];
    const b = tradeRing[tradeRing.length - 2];
    if (a && b) {
      const dt = Math.max(1, a.timeMs - b.timeMs) / 1000;
      velocity = Math.abs(priceToTick(a.price) - priceToTick(b.price)) / dt;
    }
  }
  const slippageBps = spread * 0.35 + velocity * 1.2;
  let riskTier: SlippageMetric["riskTier"] = "low";
  if (slippageBps > 12) riskTier = "critical";
  else if (slippageBps > 7) riskTier = "high";
  else if (slippageBps > 3.5) riskTier = "elevated";

  return {
    id: `slip-${book.timeMs}`,
    expectedPx: mid,
    simulatedPx: mid * (1 + slippageBps / 10_000),
    slippageBps,
    spreadBps: spread,
    velocityTicksPerSec: velocity,
    riskTier,
    updatedAtNs: toNs(book.timeMs),
  };
}

function buildCopilotFlags(
  book: WorkerBookSnapshot,
  slippage: SlippageMetric,
  dom: DomMatrixPacket,
): ExecutionCopilotFlag[] {
  const flags: ExecutionCopilotFlag[] = [];
  const nowNs = toNs(book.timeMs);

  if (slippage.riskTier === "high" || slippage.riskTier === "critical") {
    flags.push({
      id: `copilot-slip-${book.timeMs}`,
      severity: slippage.riskTier === "critical" ? "critical" : "watch",
      code: "HIGH_SLIPPAGE_RISK",
      message: "HIGH SLIPPAGE RISK DETECTED",
      priceTick: dom.midTick,
      atNs: nowNs,
    });
  }

  const voidAbove = dom.levels.find((l) => l.priceTick > dom.midTick && l.voidScore > 0.7);
  if (voidAbove) {
    flags.push({
      id: `copilot-void-above-${book.timeMs}`,
      severity: "watch",
      code: "LIQUIDITY_VOID_ABOVE",
      message: "LIQUIDITY VOID ABOVE CURRENT TICK",
      priceTick: voidAbove.priceTick,
      atNs: nowNs,
    });
  }

  const voidBelow = dom.levels.find((l) => l.priceTick < dom.midTick && l.voidScore > 0.7);
  if (voidBelow) {
    flags.push({
      id: `copilot-void-below-${book.timeMs}`,
      severity: "watch",
      code: "LIQUIDITY_VOID_BELOW",
      message: "LIQUIDITY VOID BELOW CURRENT TICK",
      priceTick: voidBelow.priceTick,
      atNs: nowNs,
    });
  }

  if ((book.spreadBps ?? 0) > 5) {
    flags.push({
      id: `copilot-spread-${book.timeMs}`,
      severity: "info",
      code: "SPREAD_EXPANSION",
      message: "BID-ASK SPREAD EXPANSION",
      priceTick: dom.midTick,
      atNs: nowNs,
    });
  }

  return flags.slice(0, 8);
}

function computePacket(): OrderFlowMatrixPacket | null {
  if (!lastBook) return null;
  const book = lastBook;
  const nowMs = book.timeMs;
  packetSeq += 1;

  const imbalance = buildImbalance(book);
  const dom = buildDomMatrix(book);
  const slippage = buildSlippage(book, book.spreadBps);
  const footprintBars = buildFootprintBars(nowMs);
  const participants: MarketParticipantProfile[] = [
    ...detectSweeps(nowMs),
    ...detectPassiveBlocks(book),
  ];

  let toxicScore = 0;
  for (const p of participants) {
    if (p.kind === "hft_sweep") toxicScore += 0.2;
    if (p.kind === "toxic_flow") toxicScore += 0.35;
  }
  const delta = sessionBuyVol - sessionSellVol;
  const executionConfidence = Math.max(
    5,
    Math.min(99, 72 - slippage.slippageBps * 3 + imbalance.ratio * 4 - toxicScore * 40),
  );

  const spoofingProbability = Math.min(
    95,
    participants.filter((p) => p.kind === "passive_absorption").length * 14,
  );
  const icebergProbability = Math.min(
    92,
    book.bids.concat(book.asks).filter((l) => l.orders === 1 && l.size >= PASSIVE_BLOCK_SIZE).length *
      18,
  );

  return {
    coin: book.coin,
    packetSeq,
    computedAtNs: toNs(nowMs),
    cvd: {
      coin: book.coin,
      buyVolume: sessionBuyVol,
      sellVolume: sessionSellVol,
      delta,
      sessionCvd: delta,
      windowMs: FOOTPRINT_BAR_MS,
      updatedAtNs: toNs(nowMs),
    },
    imbalance,
    footprintBars,
    participants,
    slippage,
    dom,
    copilotFlags: buildCopilotFlags(book, slippage, dom),
    executionConfidence,
    icebergProbability,
    spoofingProbability,
  };
}

function scheduleEmit(): void {
  if (pendingEmit) return;
  pendingEmit = true;
  const now = Date.now();
  const delay = Math.max(0, THROTTLE_MS - (now - lastEmitMs));
  setTimeout(() => {
    pendingEmit = false;
    lastEmitMs = Date.now();
    const packet = computePacket();
    if (packet) {
      const msg: WorkerOutboundMessage = { type: "packet", packet };
      self.postMessage(msg);
    }
  }, delay);
}

self.onmessage = (ev: MessageEvent<WorkerInboundMessage>) => {
  const msg = ev.data;
  try {
    if (msg.type === "configure") {
      coin = msg.coin;
      tickSize = msg.tickSize;
      sessionBuyVol = 0;
      sessionSellVol = 0;
      tradeRing.length = 0;
      levelDeltaMap.clear();
      return;
    }
    if (msg.type === "book") {
      lastBook = msg.book;
      scheduleEmit();
      return;
    }
    if (msg.type === "trades") {
      if (msg.trades.length > 0) pushTrades(msg.trades);
      scheduleEmit();
      return;
    }
    if (msg.type === "flush") {
      const packet = computePacket();
      if (packet) self.postMessage({ type: "packet", packet } satisfies WorkerOutboundMessage);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "worker_error";
    self.postMessage({ type: "error", message } satisfies WorkerOutboundMessage);
  }
};

export type { MarketParticipantKind };
