import { HL_INFO_HTTP_URL } from "@/lib/hyperliquid/constants";
import { finalizeHlCandles, normalizeCandlesBatch } from "@/lib/hyperliquid/normalize";
import type { ChartTimeframe } from "@/types/chart-analytics";
import type { NormalizedCandle } from "@/types/terminal-schema";

export type HlCandleInterval =
  | "1m"
  | "3m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "2h"
  | "4h"
  | "8h"
  | "12h"
  | "1d"
  | "3d"
  | "1w"
  | "1M";

const INTERVAL_MS: Record<HlCandleInterval, number> = {
  "1m": 60_000,
  "3m": 180_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  "4h": 14_400_000,
  "8h": 28_800_000,
  "12h": 43_200_000,
  "1d": 86_400_000,
  "3d": 259_200_000,
  "1w": 604_800_000,
  "1M": 2_592_000_000,
};

const TF_TO_HL: Record<ChartTimeframe, HlCandleInterval | null> = {
  "1s": null,
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "8h": "8h",
  "12h": "12h",
  "1d": "1d",
  "3d": "3d",
  "1w": "1w",
  "1M": "1M",
};

export const DEFAULT_CANDLE_HISTORY_BARS = 500;

/** Hyperliquid perp coin names — strip display suffixes like BTC-PERP. */
export function resolveHlCoin(coin: string): string {
  const trimmed = coin.trim();
  if (!trimmed) return "BTC";
  const withoutSuffix = trimmed.replace(/-(PERP|SPOT)$/i, "");
  const base = withoutSuffix.includes("/") ? withoutSuffix.split("/")[0]! : withoutSuffix;
  return base.toUpperCase();
}

export function chartTimeframeToHlInterval(tf: ChartTimeframe): HlCandleInterval | null {
  return TF_TO_HL[tf];
}

const HL_TO_TF = Object.fromEntries(
  Object.entries(TF_TO_HL).filter(([, iv]) => iv != null).map(([tf, iv]) => [iv, tf]),
) as Record<string, ChartTimeframe>;

export function chartIntervalToTimeframe(interval: string | null): ChartTimeframe | null {
  if (!interval) return null;
  return HL_TO_TF[interval] ?? null;
}

export function hlIntervalMs(interval: HlCandleInterval): number {
  return INTERVAL_MS[interval];
}

export function hlIntervalSeconds(interval: string): number | null {
  if (interval in INTERVAL_MS) {
    return INTERVAL_MS[interval as HlCandleInterval] / 1000;
  }
  return null;
}

type RawHlCandle = {
  t: number;
  o: number | string;
  h: number | string;
  l: number | string;
  c: number | string;
  v: number | string;
};

export async function fetchCandleSnapshot(
  coin: string,
  interval: HlCandleInterval,
  startTime: number,
  endTime: number,
): Promise<NormalizedCandle[]> {
  const res = await fetch(HL_INFO_HTTP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "candleSnapshot",
      req: { coin, interval, startTime, endTime },
    }),
  });
  if (!res.ok) throw new Error(`Hyperliquid candleSnapshot error: ${res.status}`);
  const raw = (await res.json()) as RawHlCandle[] | null;
  if (!raw || !Array.isArray(raw)) {
    throw new Error("Hyperliquid candleSnapshot returned no data");
  }
  return finalizeHlCandles(normalizeCandlesBatch(raw));
}

function alignedHistoryWindow(
  interval: HlCandleInterval,
  barCount: number,
  endTime = Date.now(),
): { startTime: number; endTime: number } {
  const intervalMs = hlIntervalMs(interval);
  const rawStart = endTime - barCount * intervalMs;
  const startTime = Math.floor(rawStart / intervalMs) * intervalMs;
  return { startTime, endTime };
}

export { alignedHistoryWindow };

export async function fetchCandleHistory(
  coin: string,
  timeframe: ChartTimeframe,
  barCount = DEFAULT_CANDLE_HISTORY_BARS,
): Promise<NormalizedCandle[]> {
  const interval = chartTimeframeToHlInterval(timeframe);
  if (!interval) return [];

  const hlCoin = resolveHlCoin(coin);
  const { startTime, endTime } = alignedHistoryWindow(interval, barCount);
  return fetchCandleSnapshot(hlCoin, interval, startTime, endTime);
}

/** Client fetch via same-origin API (rate-limited, works if HL CORS blocks browser). */
export async function fetchCandleHistoryViaApi(
  coin: string,
  timeframe: ChartTimeframe,
  barCount = DEFAULT_CANDLE_HISTORY_BARS,
): Promise<NormalizedCandle[]> {
  const interval = chartTimeframeToHlInterval(timeframe);
  if (!interval) return [];

  const params = new URLSearchParams({
    coin: resolveHlCoin(coin),
    interval,
    bars: String(barCount),
  });
  const res = await fetch(`/api/market/candles?${params}`);
  if (!res.ok) throw new Error(`Candle history API error: ${res.status}`);
  const body = (await res.json()) as { candles?: NormalizedCandle[] };
  return body.candles ?? [];
}

export async function loadChartCandleHistory(
  coin: string,
  timeframe: ChartTimeframe,
  barCount = DEFAULT_CANDLE_HISTORY_BARS,
): Promise<NormalizedCandle[]> {
  if (chartTimeframeToHlInterval(timeframe) == null) return [];

  const [direct, viaApi] = await Promise.allSettled([
    fetchCandleHistory(coin, timeframe, barCount),
    fetchCandleHistoryViaApi(coin, timeframe, barCount),
  ]);

  for (const result of [direct, viaApi]) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      return result.value;
    }
  }

  return [];
}
