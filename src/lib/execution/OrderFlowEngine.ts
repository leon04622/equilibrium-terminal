import type { NormalizedOrderBook, NormalizedTrade } from "@/types/terminal-schema";
import type { OrderFlowMatrixPacket } from "@/types/execution-intelligence";
import type {
  WorkerBookSnapshot,
  WorkerInboundMessage,
  WorkerOutboundMessage,
  WorkerTradeTick,
} from "@/lib/execution/orderflow.worker";

export type OrderFlowPacketHandler = (packet: OrderFlowMatrixPacket) => void;

function inferTickSize(book: NormalizedOrderBook): number {
  const samples: number[] = [];
  for (let i = 1; i < Math.min(book.bids.length, 6); i++) {
    const a = book.bids[i - 1]?.price;
    const b = book.bids[i]?.price;
    if (a !== undefined && b !== undefined) {
      const d = Math.abs(a - b);
      if (d > 0) samples.push(d);
    }
  }
  if (samples.length === 0) {
    const px = book.mid ?? book.bestBid ?? 100;
    if (px > 10_000) return 1;
    if (px > 100) return 0.1;
    return 0.01;
  }
  return Math.min(...samples);
}

function bookToWorker(book: NormalizedOrderBook): WorkerBookSnapshot {
  return {
    coin: book.coin,
    timeMs: book.time,
    bids: book.bids.map((l) => ({ price: l.price, size: l.size, orders: l.orders })),
    asks: book.asks.map((l) => ({ price: l.price, size: l.size, orders: l.orders })),
    bestBid: book.bestBid,
    bestAsk: book.bestAsk,
    mid: book.mid,
    spreadBps: book.spreadBps,
  };
}

function tradesToWorker(trades: NormalizedTrade[]): WorkerTradeTick[] {
  return trades.map((t) => ({
    price: t.price,
    size: t.size,
    side: t.side,
    timeMs: t.time,
    tid: t.tid,
  }));
}

export class OrderFlowEngine {
  private worker: Worker | null = null;
  private handler: OrderFlowPacketHandler | null = null;
  private coin = "BTC";
  private tickSize = 1;
  private started = false;
  private lastBook: NormalizedOrderBook | null = null;
  private pendingTrades: NormalizedTrade[] = [];

  start(onPacket: OrderFlowPacketHandler): void {
    if (this.started) return;
    this.handler = onPacket;
    if (typeof Worker === "undefined") {
      throw new Error("Web Workers are not available in this environment");
    }
    try {
      this.worker = new Worker(new URL("./orderflow.worker.ts", import.meta.url));
    } catch (err) {
      console.error("[OrderFlowEngine] failed to construct worker", err);
      throw err;
    }
    this.worker.onmessage = (ev: MessageEvent<WorkerOutboundMessage>) => {
      const msg = ev.data;
      if (msg.type === "packet" && this.handler) {
        this.handler(msg.packet);
      }
    };
    this.worker.onerror = (err) => {
      console.error("[OrderFlowEngine]", err);
    };
    this.post({ type: "configure", coin: this.coin, tickSize: this.tickSize });
    this.started = true;
  }

  stop(): void {
    this.worker?.terminate();
    this.worker = null;
    this.handler = null;
    this.started = false;
    this.pendingTrades = [];
    this.lastBook = null;
  }

  setCoin(coin: string): void {
    if (this.coin === coin) return;
    this.coin = coin;
    this.pendingTrades = [];
    this.lastBook = null;
    if (this.started) {
      this.post({ type: "configure", coin: this.coin, tickSize: this.tickSize });
    }
  }

  ingestBook(book: NormalizedOrderBook | null): void {
    if (!book || book.coin.toUpperCase() !== this.coin.toUpperCase()) return;
    this.lastBook = book;
    this.tickSize = inferTickSize(book);
    if (this.started) {
      this.post({ type: "configure", coin: this.coin, tickSize: this.tickSize });
      this.post({ type: "book", book: bookToWorker(book) });
      if (this.pendingTrades.length > 0) {
        this.post({ type: "trades", trades: tradesToWorker(this.pendingTrades) });
        this.pendingTrades = [];
      }
    }
  }

  ingestTrades(trades: NormalizedTrade[]): void {
    if (trades.length === 0) return;
    const filtered = trades.filter((t) => t.coin.toUpperCase() === this.coin.toUpperCase());
    if (filtered.length === 0) return;
    if (!this.started) {
      this.pendingTrades.push(...filtered);
      return;
    }
    this.post({ type: "trades", trades: tradesToWorker(filtered) });
    if (this.lastBook) {
      this.post({ type: "book", book: bookToWorker(this.lastBook) });
    }
  }

  flush(): void {
    if (this.started) this.post({ type: "flush" });
  }

  private post(message: WorkerInboundMessage): void {
    this.worker?.postMessage(message);
  }
}

export const orderFlowEngine = new OrderFlowEngine();
