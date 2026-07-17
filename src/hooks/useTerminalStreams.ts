"use client";

import { useCallback, useEffect, useRef } from "react";
import { loadHyperliquidAssets, FALLBACK_ASSETS } from "@/lib/assets";
import {
  HEARTBEAT_MS,
  HL_WS_URL,
  STALE_MS,
} from "@/lib/hyperliquid/constants";
import { chartTimeframeToHlInterval, resolveHlCoin } from "@/lib/hyperliquid/candles";
import {
  normalizeAllMids,
  normalizeCandlesBatch,
} from "@/lib/hyperliquid/normalize";
import { streamProcessingEngine } from "@/lib/performance/StreamProcessingEngine";
import { webSocketSecurityGate } from "@/lib/security/WebSocketSecurityGate";
import { terminalIngress, useTerminalStore } from "@/store/terminalStore";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { HlClearinghouseState, HlSpotClearinghouseState } from "@/types/account";
import type {
  HlAllMids,
  HlSubscribeMessage,
  HlSubscription,
  HlWsEnvelope,
  WsBook,
  WsTrade,
} from "@/types/hyperliquid";

const MAX_RECONNECT_MS = 30_000;
const BASE_RECONNECT_MS = 500;

function isWsBook(data: unknown): data is WsBook {
  if (!data || typeof data !== "object") return false;
  const d = data as WsBook;
  return (
    typeof d.coin === "string" &&
    typeof d.time === "number" &&
    Array.isArray(d.levels) &&
    d.levels.length === 2
  );
}

function isWsTradeArray(data: unknown): data is WsTrade[] {
  return Array.isArray(data) && data.every((t) => t && typeof t.coin === "string");
}

function isAllMids(data: unknown): data is HlAllMids {
  return !!data && typeof data === "object" && "mids" in data;
}

function isClearinghouse(data: unknown): data is HlClearinghouseState {
  return !!data && typeof data === "object" && "marginSummary" in data;
}

function isSpotClearinghouse(data: unknown): data is HlSpotClearinghouseState {
  return !!data && typeof data === "object" && "balances" in data && !("marginSummary" in data);
}

function isCandleArray(
  data: unknown,
): data is Array<{ t: number; o: number | string; h: number | string; l: number | string; c: number | string; v: number | string }> {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0]?.t === "number" &&
    (typeof data[0]?.c === "number" || typeof data[0]?.c === "string")
  );
}

function sub(payload: HlSubscription): string {
  return JSON.stringify({
    method: "subscribe",
    subscription: payload,
  } satisfies HlSubscribeMessage);
}

function unsub(payload: HlSubscription): string {
  return JSON.stringify({
    method: "unsubscribe",
    subscription: payload,
  } satisfies HlSubscribeMessage);
}

export function useTerminalStreams() {
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const chartTimeframe = useChartAnalyticsStore((s) => s.timeframe);
  const walletAddress = useTerminalStore((s) => s.walletAddress);
  const setAssets = useTerminalStore((s) => s.setAssets);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);
  const coinRef = useRef(selectedCoin);
  const userRef = useRef(walletAddress);
  const subsRef = useRef({
    coin: null as string | null,
    candleInterval: null as string | null,
    user: null as string | null,
    spotUser: null as string | null,
  });
  const intentionalRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    reconnectRef.current = null;
    heartbeatRef.current = null;
  }, []);

  const send = useCallback((msg: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(msg);
  }, []);

  const syncSubs = useCallback(() => {
    const coin = coinRef.current ? resolveHlCoin(coinRef.current) : null;
    const user = userRef.current;
    const prevCoin = subsRef.current.coin;
    const prevCandleInterval = subsRef.current.candleInterval;
    const prevUser = subsRef.current.user;
    const claims = useProductionConfigStore.getState().claims;
    const chartTf = useChartAnalyticsStore.getState().timeframe;
    const candleInterval = chartTimeframeToHlInterval(chartTf) ?? "1m";

    if (coin) {
      const gate = webSocketSecurityGate.validateReconnect(
        coin,
        claims?.sid ?? null,
        claims?.wallet ?? user,
      );
      if (!gate.allowed) {
        console.warn("[WS Security]", gate.reason);
      } else {
        webSocketSecurityGate.bindSubscription(coin, claims?.sid ?? null, claims?.wallet ?? user);
      }
    }

    const coinChanged = prevCoin != null && prevCoin !== coin;
    const intervalChanged =
      coin != null &&
      prevCoin === coin &&
      prevCandleInterval != null &&
      prevCandleInterval !== candleInterval;

    if (coinChanged) {
      send(unsub({ type: "l2Book", coin: prevCoin }));
      send(unsub({ type: "trades", coin: prevCoin }));
      send(unsub({
        type: "candle",
        coin: prevCoin,
        interval: prevCandleInterval ?? "1m",
      }));
    } else if (intervalChanged) {
      send(unsub({ type: "candle", coin, interval: prevCandleInterval! }));
    }

    if (coin) {
      if (coinChanged || subsRef.current.coin == null) {
        send(sub({ type: "l2Book", coin }));
        send(sub({ type: "trades", coin }));
      }
      if (subsRef.current.coin !== coin || subsRef.current.candleInterval !== candleInterval) {
        send(sub({ type: "candle", coin, interval: candleInterval }));
        terminalIngress.resetLiveCandles(candleInterval);
      }
      subsRef.current.coin = coin;
      subsRef.current.candleInterval = candleInterval;
    }

    if (prevUser && prevUser !== user) {
      send(unsub({ type: "clearinghouseState", user: prevUser, dex: "" }));
      send(unsub({ type: "spotClearinghouseState", user: prevUser }));
    }
    if (user) {
      send(sub({ type: "clearinghouseState", user, dex: "" }));
      send(sub({ type: "spotClearinghouseState", user }));
      subsRef.current.user = user;
      subsRef.current.spotUser = user;
    }

    if (!subsRef.current.coin) {
      send(sub({ type: "allMids", dex: "" }));
    }
  }, [send]);

  const onMessage = useCallback((event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as HlWsEnvelope;
      terminalIngress.touchMessage();

      if (msg.channel === "l2Book" && isWsBook(msg.data)) {
        streamProcessingEngine.enqueueBook(msg.data);
        return;
      }
      if (msg.channel === "trades" && isWsTradeArray(msg.data)) {
        streamProcessingEngine.enqueueTrades(msg.data);
        return;
      }
      if (msg.channel === "candle" && isCandleArray(msg.data)) {
        streamProcessingEngine.enqueueCandles(normalizeCandlesBatch(msg.data));
        return;
      }
      if (msg.channel === "allMids" && isAllMids(msg.data)) {
        streamProcessingEngine.enqueueMids(normalizeAllMids(msg.data.mids));
        return;
      }
      if (msg.channel === "clearinghouseState" && isClearinghouse(msg.data)) {
        void terminalIngress.applyClearinghouse(msg.data, userRef.current);
        return;
      }
      if (msg.channel === "spotClearinghouseState" && isSpotClearinghouse(msg.data)) {
        terminalIngress.applySpotClearinghouse(msg.data);
        return;
      }
      if (msg.channel === "error") {
        console.error("[TerminalStreams]", msg.data);
      }
    } catch (e) {
      console.error("[TerminalStreams] parse", e);
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;
    clearTimers();
    intentionalRef.current = false;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    terminalIngress.setConnectionStatus(
      attemptRef.current > 0 ? "reconnecting" : "connecting",
    );

    const ws = new WebSocket(HL_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptRef.current = 0;
      terminalIngress.setConnectionStatus("connected");
      subsRef.current = { coin: null, candleInterval: null, user: null, spotUser: null };
      syncSubs();

      heartbeatRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const last = useTerminalStore.getState().lastMessageAt;
        if (last === null || Date.now() - last > STALE_MS) ws.close();
      }, HEARTBEAT_MS);
    };

    ws.onmessage = onMessage;
    ws.onerror = () => terminalIngress.setConnectionStatus("disconnected");
    ws.onclose = () => {
      clearTimers();
      subsRef.current = { coin: null, candleInterval: null, user: null, spotUser: null };
      if (intentionalRef.current) {
        terminalIngress.setConnectionStatus("disconnected");
        return;
      }
      terminalIngress.setConnectionStatus("reconnecting");
      const delay = Math.min(BASE_RECONNECT_MS * 2 ** attemptRef.current, MAX_RECONNECT_MS);
      attemptRef.current += 1;
      reconnectRef.current = setTimeout(connect, delay);
    };
  }, [clearTimers, onMessage, syncSubs]);

  useEffect(() => {
    coinRef.current = selectedCoin;
    if (wsRef.current?.readyState === WebSocket.OPEN) syncSubs();
  }, [selectedCoin, syncSubs]);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) syncSubs();
  }, [chartTimeframe, syncSubs]);

  useEffect(() => {
    userRef.current = walletAddress;
    if (wsRef.current?.readyState === WebSocket.OPEN) syncSubs();
  }, [walletAddress, syncSubs]);

  useEffect(() => {
    let cancelled = false;
    loadHyperliquidAssets()
      .then((assets) => {
        if (!cancelled) setAssets(assets);
      })
      .catch(() => {
        if (!cancelled) setAssets(FALLBACK_ASSETS);
      });
    return () => {
      cancelled = true;
    };
  }, [setAssets]);

  useEffect(() => {
    connect();
    return () => {
      intentionalRef.current = true;
      clearTimers();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, clearTimers]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const status = useTerminalStore.getState().connectionStatus;
      const last = useTerminalStore.getState().lastMessageAt;
      if (status === "disconnected" || status === "reconnecting") {
        attemptRef.current = 0;
        connect();
        return;
      }
      if (
        status === "connected" &&
        last !== null &&
        Date.now() - last > STALE_MS
      ) {
        wsRef.current?.close();
      }
    };
    const onOnline = () => {
      attemptRef.current = 0;
      connect();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [connect]);

  return { reconnect: connect };
}
