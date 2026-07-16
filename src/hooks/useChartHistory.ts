"use client";

import { useEffect, useLayoutEffect } from "react";
import { hydrateChartAnalyticsPrefs } from "@/lib/charting/chartPrefs";
import {
  getCachedCandleHistory,
  getCachedCandleHistoryStale,
  isCacheFresh,
  setCachedCandleHistory,
} from "@/lib/charting/candleHistoryCache";
import { ChartDataEngine } from "@/lib/charting/ChartDataEngine";
import {
  CHART_TIMEFRAMES,
  FAST_PREVIEW_BARS,
  FULL_HISTORY_BARS,
} from "@/lib/charting/chartTimeframes";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import {
  chartTimeframeToHlInterval,
  loadChartCandleHistory,
} from "@/lib/hyperliquid/candles";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { terminalIngress, useTerminalStore } from "@/store/terminalStore";
import type { ChartTimeframe } from "@/types/chart-analytics";
import type { NormalizedCandle } from "@/types/terminal-schema";

const prefetchInflight = new Set<string>();
const PRIORITY_PREFETCH_TFS: ChartTimeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

function applySeries(candles: NormalizedCandle[]): void {
  chartReplayEngine.goLive();
  chartReplayEngine.setBuffer(candles);
  useChartAnalyticsStore.getState().setHistoryCandles(chartReplayEngine.visibleCandles());
}

function sealHistoryAndResetLive(hlInterval: string | null): void {
  terminalIngress.resetLiveCandles(hlInterval);
}

function mergeLiveUpdate(): void {
  const store = useChartAnalyticsStore.getState();
  const buffer = chartReplayEngine.getBuffer();
  if (store.historyLoading && buffer.length === 0) return;

  const tf = store.timeframe;
  if (tf === "1s") {
    const trades = useTerminalStore.getState().trades;
    const built = ChartDataEngine.candlesFromTrades(trades, "1s");
    chartReplayEngine.setBuffer(built);
    store.setDisplayCandles(chartReplayEngine.visibleCandles());
    return;
  }

  const expectedInterval = chartTimeframeToHlInterval(tf);
  const liveInterval = useTerminalStore.getState().liveCandleInterval;
  if (expectedInterval && liveInterval && expectedInterval !== liveInterval) return;

  if (buffer.length === 0) return;

  const incoming = useTerminalStore.getState().candles;
  if (incoming.length === 0) return;
  if (!ChartDataEngine.candlesAlignToTimeframe(incoming, tf)) return;

  const merged = ChartDataEngine.mergeLiveTail(buffer, incoming, tf);
  if (merged === buffer) return;

  chartReplayEngine.setBuffer(merged);
  store.setDisplayCandles(chartReplayEngine.visibleCandles());
}

function isActiveLoadKey(loadKey: string): boolean {
  const coin = useTerminalStore.getState().selectedCoin;
  const tf = useChartAnalyticsStore.getState().timeframe;
  return loadKey === `${coin}:${tf}`;
}

function runSoon(task: () => void): void {
  queueMicrotask(task);
}

async function refreshHistoryInBackground(
  coin: string,
  tf: ChartTimeframe,
  loadKey: string,
  hlInterval: string | null,
): Promise<void> {
  try {
    const history = await loadChartCandleHistory(coin, tf, FULL_HISTORY_BARS);
    if (!isActiveLoadKey(loadKey)) return;
    if (history.length === 0) return;
    const viewport = ChartDataEngine.viewport(history);
    setCachedCandleHistory(coin, tf, viewport);
    applySeries(viewport);
    sealHistoryAndResetLive(hlInterval);
  } catch {
    /* background refresh is best-effort */
  }
}

export function prefetchChartHistory(coin: string, tf: ChartTimeframe): void {
  if (chartTimeframeToHlInterval(tf) == null) return;
  const key = `${coin}:${tf}`;
  if (prefetchInflight.has(key) || isCacheFresh(coin, tf)) return;
  prefetchInflight.add(key);
  void loadChartCandleHistory(coin, tf, FAST_PREVIEW_BARS)
    .then((candles) => {
      if (candles.length > 0) {
        setCachedCandleHistory(coin, tf, ChartDataEngine.viewport(candles));
      }
    })
    .finally(() => {
      prefetchInflight.delete(key);
    });
}

function prefetchPriorityTimeframes(coin: string, activeTf: ChartTimeframe): void {
  for (const tf of PRIORITY_PREFETCH_TFS) {
    if (tf !== activeTf) prefetchChartHistory(coin, tf);
  }
}

/** Loads Hyperliquid candle history and merges live WS updates into the chart buffer. */
export function useChartHistory(enabled = true): void {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);

  useLayoutEffect(() => {
    if (!enabled) return;
    hydrateChartAnalyticsPrefs();
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;

    const hlInterval = chartTimeframeToHlInterval(timeframe);
    chartReplayEngine.goLive();
    sealHistoryAndResetLive(hlInterval);

    const fresh = getCachedCandleHistory(selectedCoin, timeframe);
    const stale = getCachedCandleHistoryStale(selectedCoin, timeframe);
    const immediate = fresh ?? stale;

    if (immediate?.length) {
      applySeries(ChartDataEngine.viewport(immediate));
      if (!fresh) {
        useChartAnalyticsStore.getState().setHistoryLoading(true);
      }
      return;
    }

    if (chartReplayEngine.getBuffer().length === 0) {
      useChartAnalyticsStore.getState().setHistoryLoading(true);
    }
  }, [enabled, selectedCoin, timeframe]);

  useEffect(() => {
    if (!enabled) return;
    prefetchPriorityTimeframes(selectedCoin, timeframe);
  }, [enabled, selectedCoin, timeframe]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const loadKey = `${selectedCoin}:${timeframe}`;
    const hlInterval = chartTimeframeToHlInterval(timeframe);
    const cacheHit = isCacheFresh(selectedCoin, timeframe);

    const load = async () => {
      const coin = useTerminalStore.getState().selectedCoin;
      const tf = useChartAnalyticsStore.getState().timeframe;

      if (!isActiveLoadKey(loadKey)) return;

      if (tf === "1s") {
        if (!cancelled && isActiveLoadKey(loadKey)) {
          const trades = useTerminalStore.getState().trades;
          applySeries(ChartDataEngine.candlesFromTrades(trades, "1s"));
        }
        return;
      }

      if (cacheHit) {
        runSoon(() => {
          if (!cancelled) void refreshHistoryInBackground(coin, tf, loadKey, hlInterval);
        });
        return;
      }

      try {
        const preview = await loadChartCandleHistory(coin, tf, FAST_PREVIEW_BARS);
        if (cancelled || !isActiveLoadKey(loadKey)) return;
        if (preview.length > 0) {
          applySeries(ChartDataEngine.viewport(preview));
          sealHistoryAndResetLive(hlInterval);
        } else if (chartReplayEngine.getBuffer().length === 0) {
          useChartAnalyticsStore.getState().setHistoryLoading(false);
        }

        runSoon(() => {
          if (!cancelled) void refreshHistoryInBackground(coin, tf, loadKey, hlInterval);
        });
      } catch (e) {
        if (!cancelled && isActiveLoadKey(loadKey) && chartReplayEngine.getBuffer().length === 0) {
          useChartAnalyticsStore.getState().setHistoryLoading(false);
          console.error("[ChartHistory]", e);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, selectedCoin, timeframe]);

  useEffect(() => {
    if (!enabled) return;

    const unsubCandle = useTerminalStore.subscribe((s) => s.candleVersion, mergeLiveUpdate);
    const unsubTrade = useTerminalStore.subscribe((s) => s.trades.length, () => {
      if (useChartAnalyticsStore.getState().timeframe === "1s") mergeLiveUpdate();
    });

    return () => {
      unsubCandle();
      unsubTrade();
    };
  }, [enabled, timeframe]);
}
