/** Typed terminal event bus for cross-panel linking (2026 Crypto OS). */

export type TerminalEventMap = {
  "asset:select": {
    coin: string;
    source: string;
    symbol?: string;
  };
  "widget:focus": {
    widgetId: string;
  };
  "platform:sign-in": Record<string, never>;
  "ai:prompt": {
    prompt: string;
    source: "omnibar" | "copilot" | "operatordesk";
  };
  "intelligence:signal": {
    id: string;
    coin: string;
    kind: "whale" | "liquidation" | "funding" | "social";
  };
  "layout:refresh": Record<string, never>;
  "stream:status": {
    status: "idle" | "connecting" | "connected" | "reconnecting" | "disconnected";
  };
  "alert:triggered": {
    id: string;
    coin: string;
    severity: "info" | "watch" | "critical";
  };
  "agentic:fused": {
    id: string;
    coin: string;
    score: number;
  };
  "agentic:workspace-load": {
    opportunityId: string;
    coin: string;
  };
  "network:crdt": {
    op: import("@/types/network").CrdtOperation;
  };
  "network:layout": {
    deskId: string;
    layout: import("react-grid-layout").Layout[];
  };
  "network:signal-trace": {
    signalId: string;
    coin: string;
  };
  "network:graph-query": {
    queryId: string;
    query: string;
  };
  "workflow:open-asset": {
    coin: string;
    mode: string;
    panels: string[];
  };
  "distribution:event": {
    id: string;
    category: string;
    severity: "info" | "watch" | "critical";
    headline: string;
    coin: string | null;
  };
  "distribution:incident": {
    id: string;
    kind: string;
    severity: "info" | "watch" | "critical";
    headline: string;
  };
  "briefing:published": {
    id: string;
    headline: string;
    kind: string;
  };
  "intelligence:engine": {
    id: string;
    category: string;
    severity: "info" | "watch" | "critical";
    summary: string;
    coin: string;
    compositeScore: number;
  };
  "collaboration:presence": {
    memberId: string;
    status: "offline" | "idle" | "active" | "focused";
    activeCoin: string | null;
  };
  "collaboration:annotation": {
    id: string;
    coin: string;
    kind: string;
  };
  "collaboration:briefing": {
    id: string;
    headline: string;
    deskId: string;
  };
  "enterprise:notice": {
    id: string;
    kind: string;
    headline: string;
    severity: "info" | "watch" | "critical";
  };
  "integrations:public": {
    id: string;
    headline: string;
    category: string;
  };
  "proprietary:metric": {
    id: string;
    kind: string;
    label: string;
    value: number;
    band: string;
  };
  "ecosystem:risk": {
    id: string;
    headline: string;
    severity: "info" | "watch" | "critical";
  };
  "strategy:readiness": {
    score: number;
    trustScore: number;
    severity: "watch" | "critical";
  };
  "chart:sync": {
    linked: boolean;
    timeframe: string;
    cursorTime: number | null;
    sourceChartId: string | null;
  };
  "chart:cursor": {
    time: number;
    sourceChartId: string;
  };
  "chart:replay": {
    mode: string;
    playheadTime: number | null;
    progressPct: number;
  };
  "guide:select": {
    targetId: string;
  };
  "guide:replay-start": {
    scenarioId: string;
    title: string;
    asset: string;
  };
  "guide:replay-stop": Record<string, never>;
  "guide:explain-toggle": {
    active: boolean;
  };
  "workspace:snapshot-restore": {
    layout: import("react-grid-layout").Layout[];
    selectedCoin?: string | null;
    savedAt?: number;
  };
  "workspace:layout-commit": Record<string, never>;
};

type Handler<T> = (payload: T) => void;

class TerminalEventBus {
  private listeners = new Map<keyof TerminalEventMap, Set<Handler<unknown>>>();

  on<K extends keyof TerminalEventMap>(
    event: K,
    handler: Handler<TerminalEventMap[K]>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(handler as Handler<unknown>);
    return () => set.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof TerminalEventMap>(
    event: K,
    payload: TerminalEventMap[K],
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((handler) => {
      handler(payload);
    });
  }

  once<K extends keyof TerminalEventMap>(
    event: K,
    handler: Handler<TerminalEventMap[K]>,
  ): () => void {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }
}

export const terminalBus = new TerminalEventBus();
