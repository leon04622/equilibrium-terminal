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
  historyBarsForTimeframe,
} from "@/lib/charting/chartTimeframes";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import {
  chartTimeframeToHlInterval,
  loadChartCandleHistory,
} from "@/lib/hyperliquid/candles";
import { normalizeHlCoin } from "@/lib/hyperliquid/coin";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import { terminalIngress, useTerminalStore } from "@/store/terminalStore";
import type { ChartTimeframe } from "@/types/chart-analytics";
import type { NormalizedCandle } from "@/types/terminal-schema";

const prefetchInflight = new Set<string>();
let activeHistoryKey = "";

function historyKey(coin: string, tf: ChartTimeframe): string {
  return `${normalizeHlCoin(coin)}:${tf}`;
}

function chartLoadKey(coin: string, tf: ChartTimeframe): string {
  return historyKey(coin, tf);
}

function applySeries(candles: NormalizedCandle[], coin: string, tf: ChartTimeframe): void {
  activeHistoryKey = historyKey(coin, tf);
  chartReplayEngine.goLive();
  chartReplayEngine.setBuffer(candles);
  useChartAnalyticsStore.getState().setHistoryCandles(chartReplayEngine.visibleCandles());
}

function clearSeries(): void {
  activeHistoryKey = "";
  chartReplayEngine.setBuffer([]);
  useChartAnalyticsStore.getState().setDisplayCandles([]);
}

function sealHistoryAndResetLive(hlInterval: string | null): void {
  terminalIngress.resetLiveCandles(hlInterval);
}

function mergeLiveUpdate(): void {
  const store = useChartAnalyticsStore.getState();
  const buffer = chartReplayEngine.getBuffer();
  if (store.historyLoading && buffer.length === 0) return;

  const coin = useTerminalStore.getState().selectedCoin;
  const tf = store.timeframe;
  if (activeHistoryKey && activeHistoryKey !== historyKey(coin, tf)) return;

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

function isActiveLoadKey(expectedKey: string): boolean {
  const coin = useTerminalStore.getState().selectedCoin;
  const tf = useChartAnalyticsStore.getState().timeframe;
  return expectedKey === chartLoadKey(coin, tf);
}

function runSoon(task: () => void): void {
  queueMicrotask(task);
}

async function fetchCandlesForTimeframe(
  coin: string,
  tf: ChartTimeframe,
): Promise<NormalizedCandle[]> {
  const previewBars = historyBarsForTimeframe(tf, true);
  const preview = await loadChartCandleHistory(coin, tf, previewBars);
  if (preview.length > 0) return preview;

  const fullBars = historyBarsForTimeframe(tf, false);
  if (fullBars === previewBars) return preview;
  return loadChartCandleHistory(coin, tf, fullBars);
}

async function refreshHistoryInBackground(
  coin: string,
  tf: ChartTimeframe,
  expectedKey: string,
  hlInterval: string | null,
): Promise<void> {
  try {
    const history = await loadChartCandleHistory(coin, tf, historyBarsForTimeframe(tf, false));
    if (!isActiveLoadKey(expectedKey)) return;
    if (history.length === 0) return;
    const viewport = ChartDataEngine.viewport(history);
    setCachedCandleHistory(coin, tf, viewport);
    applySeries(viewport, coin, tf);
    sealHistoryAndResetLive(hlInterval);
  } catch {
    /* background refresh is best-effort */
  }
}

export function prefetchChartHistory(coin: string, tf: ChartTimeframe): void {
  if (chartTimeframeToHlInterval(tf) == null) return;
  const key = historyKey(coin, tf);
  if (prefetchInflight.has(key) || isCacheFresh(coin, tf)) return;
  prefetchInflight.add(key);
  void loadChartCandleHistory(coin, tf, historyBarsForTimeframe(tf, true))
    .then((candles) => {
      if (candles.length > 0) {
        setCachedCandleHistory(coin, tf, ChartDataEngine.viewport(candles));
      }
    })
    .finally(() => {
      prefetchInflight.delete(key);
    });
}

function prefetchAllTimeframes(coin: string, activeTf: ChartTimeframe): void {
  for (const tf of CHART_TIMEFRAMES) {
    if (tf !== activeTf) prefetchChartHistory(coin, tf);
  }
}

/** Loads Hyperliquid candle history and merges live WS updates into the chart buffer. */
export function useChartHistory(enabled = true): void {
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const assetSelectEpoch = useTerminalStore((s) => s.assetSelectEpoch);

  useLayoutEffect(() => {
    if (!enabled) return;
    hydrateChartAnalyticsPrefs();
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;

    const hlInterval = chartTimeframeToHlInterval(timeframe);
    sealHistoryAndResetLive(hlInterval);

    const fresh = getCachedCandleHistory(selectedCoin, timeframe);
    const stale = getCachedCandleHistoryStale(selectedCoin, timeframe);
    const immediate = fresh ?? stale;

    if (immediate?.length) {
      applySeries(ChartDataEngine.viewport(immediate), selectedCoin, timeframe);
      if (!fresh) {
        useChartAnalyticsStore.getState().setHistoryLoading(true);
      }
      return;
    }

    clearSeries();
    useChartAnalyticsStore.getState().setHistoryLoading(true);
  }, [enabled, selectedCoin, timeframe, assetSelectEpoch]);

  useEffect(() => {
    if (!enabled) return;
    prefetchAllTimeframes(selectedCoin, timeframe);
  }, [enabled, selectedCoin, timeframe, assetSelectEpoch]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const expectedKey = chartLoadKey(selectedCoin, timeframe);
    const hlInterval = chartTimeframeToHlInterval(timeframe);

    const load = async () => {
      const coin = useTerminalStore.getState().selectedCoin;
      const tf = useChartAnalyticsStore.getState().timeframe;

      if (!isActiveLoadKey(expectedKey)) return;

      if (tf === "1s") {
        if (!cancelled && isActiveLoadKey(expectedKey)) {
          const trades = useTerminalStore.getState().trades;
          applySeries(ChartDataEngine.candlesFromTrades(trades, "1s"), coin, tf);
        }
        return;
      }

      const cached = getCachedCandleHistoryStale(coin, tf);
      if (isCacheFresh(coin, tf) && cached?.length) {
        if (activeHistoryKey !== historyKey(coin, tf)) {
          applySeries(ChartDataEngine.viewport(cached), coin, tf);
        }
        runSoon(() => {
          if (!cancelled) void refreshHistoryInBackground(coin, tf, expectedKey, hlInterval);
        });
        return;
      }

      try {
        const candles = await fetchCandlesForTimeframe(coin, tf);
        if (cancelled || !isActiveLoadKey(expectedKey)) return;
        if (candles.length > 0) {
          const viewport = ChartDataEngine.viewport(candles);
          setCachedCandleHistory(coin, tf, viewport);
          applySeries(viewport, coin, tf);
          sealHistoryAndResetLive(hlInterval);
        } else if (chartReplayEngine.getBuffer().length === 0) {
          useChartAnalyticsStore.getState().setHistoryLoading(false);
          console.warn(`[ChartHistory] No candles for ${coin} ${tf}`);
        }

        runSoon(() => {
          if (!cancelled) void refreshHistoryInBackground(coin, tf, expectedKey, hlInterval);
        });
      } catch (e) {
        if (!cancelled && isActiveLoadKey(expectedKey) && chartReplayEngine.getBuffer().length === 0) {
          useChartAnalyticsStore.getState().setHistoryLoading(false);
          console.error("[ChartHistory]", e);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, selectedCoin, timeframe, assetSelectEpoch]);

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
