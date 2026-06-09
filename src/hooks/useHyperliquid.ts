"use client";

import { useCallback, useEffect, useRef } from "react";
import { loadHyperliquidAssets } from "@/lib/assets";
import { normalizeAllMids } from "@/lib/hyperliquid/normalize";
import { hyperliquidActions, useHyperliquidStore } from "@/store/hyperliquidStore";
import type { HlClearinghouseState } from "@/types/account";
import type {
  HlAllMids,
  HlSubscribeMessage,
  HlSubscription,
  HlWsEnvelope,
  WsBook,
  WsTrade,
} from "@/types/hyperliquid";
import { HL_INFO_WS_URL } from "@/types/hyperliquid";

const HEARTBEAT_INTERVAL_MS = 15_000;
const STALE_THRESHOLD_MS = 45_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 500;

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

function isClearinghouseState(data: unknown): data is HlClearinghouseState {
  return (
    !!data &&
    typeof data === "object" &&
    "marginSummary" in data &&
    "assetPositions" in data
  );
}

function bookSubscription(coin: string): HlSubscription {
  return { type: "l2Book", coin };
}

function tradesSubscription(coin: string): HlSubscription {
  return { type: "trades", coin };
}

function clearinghouseSubscription(user: string): HlSubscription {
  return { type: "clearinghouseState", user, dex: "" };
}

function allMidsSubscription(): HlSubscription {
  return { type: "allMids", dex: "" };
}

function subscribePayload(sub: HlSubscription): string {
  return JSON.stringify({
    method: "subscribe",
    subscription: sub,
  } satisfies HlSubscribeMessage);
}

function unsubscribePayload(sub: HlSubscription): string {
  return JSON.stringify({
    method: "unsubscribe",
    subscription: sub,
  } satisfies HlSubscribeMessage);
}

export function useHyperliquid() {
  const selectedCoin = useHyperliquidStore((s) => s.selectedCoin);
  const walletAddress = useHyperliquidStore((s) => s.walletAddress);
  const setAssets = useHyperliquidStore((s) => s.setAssets);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const activeCoinRef = useRef(selectedCoin);
  const activeUserRef = useRef(walletAddress);
  const subscribedCoinRef = useRef<string | null>(null);
  const subscribedUserRef = useRef<string | null>(null);
  const accountSubsActiveRef = useRef(false);
  const intentionalCloseRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (staleCheckRef.current) {
      clearInterval(staleCheckRef.current);
      staleCheckRef.current = null;
    }
  }, []);

  const send = useCallback((payload: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(payload);
  }, []);

  const syncMarketSubscriptions = useCallback(
    (coin: string, prevCoin: string | null) => {
      if (prevCoin && prevCoin !== coin) {
        send(unsubscribePayload(bookSubscription(prevCoin)));
        send(unsubscribePayload(tradesSubscription(prevCoin)));
      }
      send(subscribePayload(bookSubscription(coin)));
      send(subscribePayload(tradesSubscription(coin)));
      subscribedCoinRef.current = coin;
    },
    [send],
  );

  const syncAccountSubscriptions = useCallback(
    (user: string | null, prevUser: string | null) => {
      if (prevUser && prevUser !== user) {
        send(unsubscribePayload(clearinghouseSubscription(prevUser)));
        if (accountSubsActiveRef.current) {
          send(unsubscribePayload(allMidsSubscription()));
          accountSubsActiveRef.current = false;
        }
      }
      if (!user) {
        subscribedUserRef.current = null;
        return;
      }
      send(subscribePayload(clearinghouseSubscription(user)));
      send(subscribePayload(allMidsSubscription()));
      subscribedUserRef.current = user;
      accountSubsActiveRef.current = true;
    },
    [send],
  );

  const handleMessage = useCallback((event: MessageEvent<string>) => {
    try {
      const msg = JSON.parse(event.data) as HlWsEnvelope;
      hyperliquidActions.touchMessage();

      if (msg.channel === "l2Book" && isWsBook(msg.data)) {
        hyperliquidActions.applyBook(msg.data);
        return;
      }

      if (msg.channel === "trades" && isWsTradeArray(msg.data)) {
        hyperliquidActions.pushTrades(msg.data);
        return;
      }

      if (msg.channel === "allMids" && isAllMids(msg.data)) {
        hyperliquidActions.applyMids(normalizeAllMids(msg.data.mids));
        return;
      }

      if (msg.channel === "clearinghouseState" && isClearinghouseState(msg.data)) {
        void hyperliquidActions.applyClearinghouse(msg.data, activeUserRef.current);
        return;
      }

      if (msg.channel === "error") {
        console.error("[Hyperliquid WS]", msg.data);
      }
    } catch (err) {
      console.error("[Hyperliquid WS] parse error", err);
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    clearTimers();
    intentionalCloseRef.current = false;

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    hyperliquidActions.setConnectionStatus(
      reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting",
    );

    const ws = new WebSocket(HL_INFO_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
      hyperliquidActions.setConnectionStatus("connected");
      syncMarketSubscriptions(activeCoinRef.current, null);
      syncAccountSubscriptions(activeUserRef.current, null);

      heartbeatRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const last = useHyperliquidStore.getState().lastMessageAt;
        if (last === null || Date.now() - last > STALE_THRESHOLD_MS) {
          ws.close();
        }
      }, HEARTBEAT_INTERVAL_MS);
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      hyperliquidActions.setConnectionStatus("disconnected");
    };

    ws.onclose = () => {
      clearTimers();
      subscribedCoinRef.current = null;
      subscribedUserRef.current = null;
      accountSubsActiveRef.current = false;
      if (intentionalCloseRef.current) {
        hyperliquidActions.setConnectionStatus("disconnected");
        return;
      }
      hyperliquidActions.setConnectionStatus("reconnecting");
      const delay = Math.min(
        BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttemptRef.current,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
  }, [clearTimers, handleMessage, syncAccountSubscriptions, syncMarketSubscriptions]);

  useEffect(() => {
    activeCoinRef.current = selectedCoin;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const prev = subscribedCoinRef.current;
    if (prev !== selectedCoin) syncMarketSubscriptions(selectedCoin, prev);
  }, [selectedCoin, syncMarketSubscriptions]);

  useEffect(() => {
    activeUserRef.current = walletAddress;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const prev = subscribedUserRef.current;
    if (prev !== walletAddress) syncAccountSubscriptions(walletAddress, prev);
  }, [walletAddress, syncAccountSubscriptions]);

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
      intentionalCloseRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearTimers]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const status = useHyperliquidStore.getState().connectionStatus;
      if (status === "disconnected" || status === "reconnecting") {
        reconnectAttemptRef.current = 0;
        connect();
      }
    };
    const onOnline = () => {
      reconnectAttemptRef.current = 0;
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
