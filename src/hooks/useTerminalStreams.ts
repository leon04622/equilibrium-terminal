"use client";

import { useCallback, useEffect, useRef } from "react";
import { loadHyperliquidAssets } from "@/lib/assets";
import {
  HEARTBEAT_MS,
  HL_WS_URL,
  STALE_MS,
} from "@/lib/hyperliquid/constants";
import {
  normalizeAllMids,
  normalizeCandlesBatch,
} from "@/lib/hyperliquid/normalize";
import { terminalIngress, useTerminalStore } from "@/store/terminalStore";
import type { HlClearinghouseState } from "@/types/account";
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

function isCandleArray(
  data: unknown,
): data is Array<{ t: number; o: number; h: number; l: number; c: number; v: number }> {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0]?.t === "number" &&
    typeof data[0]?.c === "number"
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
  const walletAddress = useTerminalStore((s) => s.walletAddress);
  const setAssets = useTerminalStore((s) => s.setAssets);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptRef = useRef(0);
  const coinRef = useRef(selectedCoin);
  const userRef = useRef(walletAddress);
  const subsRef = useRef({ coin: null as string | null, user: null as string | null });
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
    const coin = coinRef.current;
    const user = userRef.current;
    const prevCoin = subsRef.current.coin;
    const prevUser = subsRef.current.user;

    if (prevCoin && prevCoin !== coin) {
      send(unsub({ type: "l2Book", coin: prevCoin }));
      send(unsub({ type: "trades", coin: prevCoin }));
      send(unsub({ type: "candle", coin: prevCoin, interval: "1m" }));
    }
    if (coin) {
      send(sub({ type: "l2Book", coin }));
      send(sub({ type: "trades", coin }));
      send(sub({ type: "candle", coin, interval: "1m" }));
      subsRef.current.coin = coin;
    }

    if (prevUser && prevUser !== user) {
      send(unsub({ type: "clearinghouseState", user: prevUser, dex: "" }));
    }
    if (user) {
      send(sub({ type: "clearinghouseState", user, dex: "" }));
      subsRef.current.user = user;
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
        terminalIngress.applyBook(msg.data);
        return;
      }
      if (msg.channel === "trades" && isWsTradeArray(msg.data)) {
        terminalIngress.pushTrades(msg.data);
        return;
      }
      if (msg.channel === "candle" && isCandleArray(msg.data)) {
        terminalIngress.applyCandles(normalizeCandlesBatch(msg.data));
        return;
      }
      if (msg.channel === "allMids" && isAllMids(msg.data)) {
        terminalIngress.applyMids(normalizeAllMids(msg.data.mids));
        return;
      }
      if (msg.channel === "clearinghouseState" && isClearinghouse(msg.data)) {
        void terminalIngress.applyClearinghouse(msg.data, userRef.current);
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
      subsRef.current = { coin: null, user: null };
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
      subsRef.current = { coin: null, user: null };
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
    userRef.current = walletAddress;
    if (wsRef.current?.readyState === WebSocket.OPEN) syncSubs();
  }, [walletAddress, syncSubs]);

  useEffect(() => {
    let cancelled = false;
    loadHyperliquidAssets().then((assets) => {
      if (!cancelled) setAssets(assets);
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

  return { reconnect: connect };
}
