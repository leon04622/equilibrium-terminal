import { HL_WS_URL, HEARTBEAT_MS, STALE_MS } from "@/lib/hyperliquid/constants";

export type GatewayMessageHandler = (raw: string, receivedAt: number) => void;

export type GatewayStatus = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";

export interface GatewaySubscription {
  id: string;
  channel: string;
  subscribeFrame: string;
  unsubscribeFrame: string;
}

export interface WebSocketGatewayMetrics {
  status: GatewayStatus;
  upstreamConnections: number;
  fanoutClients: number;
  lastMessageAt: number | null;
  latencyMs: number;
  reconnectCount: number;
  messagesPerSecond: number;
}

/**
 * Stateless connection multiplexer — one upstream Hyperliquid socket,
 * many downstream terminal subscribers (invariant: no per-tab upstream feeds).
 */
export class WebSocketGateway {
  private ws: WebSocket | null = null;
  private status: GatewayStatus = "idle";
  private handlers = new Set<GatewayMessageHandler>();
  private subscriptions = new Map<string, GatewaySubscription>();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private staleTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private lastMessageAt: number | null = null;
  private messageTimestamps: number[] = [];
  private readonly maxReconnectMs = 30_000;
  private readonly baseReconnectMs = 500;

  getMetrics(): WebSocketGatewayMetrics {
    const now = Date.now();
    const cutoff = now - 1000;
    while (this.messageTimestamps.length > 0 && (this.messageTimestamps[0] ?? 0) < cutoff) {
      this.messageTimestamps.shift();
    }
    const latencyMs =
      this.lastMessageAt === null ? 0 : Math.max(0, now - this.lastMessageAt);
    return {
      status: this.status,
      upstreamConnections: this.ws && this.status === "connected" ? 1 : 0,
      fanoutClients: this.handlers.size,
      lastMessageAt: this.lastMessageAt,
      latencyMs,
      reconnectCount: this.reconnectAttempt,
      messagesPerSecond: this.messageTimestamps.length,
    };
  }

  subscribe(handler: GatewayMessageHandler): () => void {
    this.handlers.add(handler);
    if (this.handlers.size === 1) {
      this.connect();
    }
    return () => {
      this.handlers.delete(handler);
      if (this.handlers.size === 0) {
        this.teardown();
      }
    };
  }

  registerChannel(sub: GatewaySubscription): void {
    this.subscriptions.set(sub.id, sub);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(sub.subscribeFrame);
    }
  }

  unregisterChannel(id: string): void {
    const sub = this.subscriptions.get(id);
    if (sub && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(sub.unsubscribeFrame);
    }
    this.subscriptions.delete(id);
  }

  sendUpstream(frame: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(frame);
    }
  }

  private connect(): void {
    if (typeof WebSocket === "undefined") return;
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.status = "connecting";
    const socket = new WebSocket(HL_WS_URL);
    this.ws = socket;

    socket.onopen = () => {
      this.status = "connected";
      this.reconnectAttempt = 0;
      for (const sub of Array.from(this.subscriptions.values())) {
        socket.send(sub.subscribeFrame);
      }
      this.startHeartbeat();
    };

    socket.onmessage = (event) => {
      const receivedAt = Date.now();
      this.lastMessageAt = receivedAt;
      this.messageTimestamps.push(receivedAt);
      const raw = typeof event.data === "string" ? event.data : "";
      for (const handler of Array.from(this.handlers)) {
        handler(raw, receivedAt);
      }
    };

    socket.onclose = () => {
      this.status = "reconnecting";
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.handlers.size === 0) return;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(
      this.maxReconnectMs,
      this.baseReconnectMs * 2 ** this.reconnectAttempt,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ws = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: "ping" }));
      }
    }, HEARTBEAT_MS);

    this.staleTimer = setInterval(() => {
      if (!this.lastMessageAt) return;
      if (Date.now() - this.lastMessageAt > STALE_MS) {
        this.ws?.close();
      }
    }, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.staleTimer) {
      clearInterval(this.staleTimer);
      this.staleTimer = null;
    }
  }

  private teardown(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.subscriptions.clear();
    this.ws?.close();
    this.ws = null;
    this.status = "disconnected";
    this.lastMessageAt = null;
    this.messageTimestamps = [];
  }
}

export const platformWebSocketGateway = new WebSocketGateway();
