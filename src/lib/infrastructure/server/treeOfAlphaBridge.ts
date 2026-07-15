import type { InstitutionalNewsHeadline } from "@/types/institutional-news";
import { guessCoin } from "@/lib/infrastructure/server/rssParser";

const WS_URL = "wss://news.treeofalpha.com/ws";
const BUFFER_CAP = 240;
const RECONNECT_MS = 4_000;

interface TreeNewsMessage {
  _id?: string;
  title?: string;
  body?: string;
  source?: string;
  link?: string;
  time?: number;
  rt?: number;
  coin?: string;
  suggestions?: Array<{ coin?: string }>;
}

function treeApiKey(): string | null {
  return process.env.EQUILIBRIUM_TREE_NEWS_API_KEY?.trim() || null;
}

function toHeadline(msg: TreeNewsMessage): InstitutionalNewsHeadline | null {
  const headline = (msg.title ?? "").trim();
  const body = (msg.body ?? "").trim();
  if (!headline && !body) return null;
  const detail = body || headline;
  const displayHeadline = headline || body.slice(0, 120);
  const coin =
    msg.coin ??
    msg.suggestions?.[0]?.coin ??
    guessCoin(`${displayHeadline} ${detail}`);
  const timestamp = msg.time ?? msg.rt ?? Date.now();
  const sourceLabel = msg.source ? `TREE · ${msg.source}` : "TREE OF ALPHA";
  const id = `TREE-${msg._id ?? `${timestamp}-${displayHeadline.slice(0, 16).replace(/\W/g, "_")}`}`;

  return {
    id,
    headline: displayHeadline.slice(0, 160),
    detail: detail.slice(0, 320),
    source: sourceLabel,
    tier: msg.source?.toLowerCase().includes("binance") ||
      msg.source?.toLowerCase().includes("upbit")
      ? "exchange"
      : "squawk",
    timestamp,
    coin,
    url: msg.link ?? null,
    verified: true,
    priority: msg.source?.toLowerCase().includes("binance") ? 96 : 98,
  };
}

class TreeOfAlphaBridge {
  private buffer: InstitutionalNewsHeadline[] = [];
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connected = false;
  private authenticated = false;
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.connect();
  }

  isConnected(): boolean {
    return this.connected;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  bufferSize(): number {
    return this.buffer.length;
  }

  headlines(limit = 48): InstitutionalNewsHeadline[] {
    return this.buffer.slice(0, limit);
  }

  private connect(): void {
    if (typeof WebSocket === "undefined") return;
    try {
      this.ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
      const key = treeApiKey();
      if (key) {
        this.ws?.send(`login ${key}`);
        this.authenticated = true;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as TreeNewsMessage | TreeNewsMessage[];
        const rows = Array.isArray(parsed) ? parsed : [parsed];
        for (const row of rows) {
          const headline = toHeadline(row);
          if (!headline) continue;
          this.buffer.unshift(headline);
        }
        if (this.buffer.length > BUFFER_CAP) {
          this.buffer.length = BUFFER_CAP;
        }
      } catch {
        /* non-json heartbeat */
      }
    };

    this.ws.onerror = () => {
      this.connected = false;
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.authenticated = false;
      this.ws = null;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_MS);
  }
}

const globalTree = globalThis as unknown as { __eqTreeBridge?: TreeOfAlphaBridge };

export function getTreeOfAlphaBridge(): TreeOfAlphaBridge {
  if (!globalTree.__eqTreeBridge) {
    globalTree.__eqTreeBridge = new TreeOfAlphaBridge();
    globalTree.__eqTreeBridge.start();
  }
  return globalTree.__eqTreeBridge;
}

export function getTreeOfAlphaHeadlines(limit = 40): InstitutionalNewsHeadline[] {
  return getTreeOfAlphaBridge().headlines(limit);
}

export function getTreeOfAlphaStatus(): {
  connected: boolean;
  authenticated: boolean;
  buffered: number;
} {
  const bridge = getTreeOfAlphaBridge();
  return {
    connected: bridge.isConnected(),
    authenticated: bridge.isAuthenticated(),
    buffered: bridge.bufferSize(),
  };
}
