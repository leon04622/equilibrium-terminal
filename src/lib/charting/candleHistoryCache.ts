import type { ChartTimeframe } from "@/types/chart-analytics";
import type { NormalizedCandle } from "@/types/terminal-schema";

const SESSION_KEY = "eq-candle-cache-v1";
const MEMORY = new Map<string, { candles: NormalizedCandle[]; at: number }>();

/** Shorter TTL for intraday intervals; longer for higher TFs. */
function cacheTtlMs(tf: ChartTimeframe): number {
  if (tf === "1m" || tf === "3m" || tf === "5m") return 60_000;
  if (tf === "15m" || tf === "30m" || tf === "1h") return 180_000;
  return 600_000;
}

function cacheKey(coin: string, tf: ChartTimeframe): string {
  return `${coin.toUpperCase()}:${tf}`;
}

type CacheBlob = Record<string, { candles: NormalizedCandle[]; at: number }>;

function readSession(): CacheBlob {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheBlob;
  } catch {
    return {};
  }
}

function writeSession(blob: CacheBlob): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(blob));
  } catch {
    /* quota */
  }
}

export function isCacheFresh(coin: string, tf: ChartTimeframe): boolean {
  return getCachedCandleHistory(coin, tf) != null;
}

/** Stale-while-revalidate: return cached bars even past TTL so TF switches stay instant. */
export function getCachedCandleHistoryStale(
  coin: string,
  tf: ChartTimeframe,
): NormalizedCandle[] | null {
  const key = cacheKey(coin, tf);
  const mem = MEMORY.get(key);
  if (mem && mem.candles.length > 0) return mem.candles;

  const blob = readSession();
  const hit = blob[key];
  if (hit && hit.candles.length > 0) {
    MEMORY.set(key, hit);
    return hit.candles;
  }
  return null;
}

export function getCachedCandleHistory(
  coin: string,
  tf: ChartTimeframe,
): NormalizedCandle[] | null {
  const key = cacheKey(coin, tf);
  const ttl = cacheTtlMs(tf);
  const now = Date.now();

  const mem = MEMORY.get(key);
  if (mem && mem.candles.length > 0 && now - mem.at < ttl) {
    return mem.candles;
  }

  const blob = readSession();
  const hit = blob[key];
  if (hit && hit.candles.length > 0 && now - hit.at < ttl) {
    MEMORY.set(key, hit);
    return hit.candles;
  }

  return null;
}

export function setCachedCandleHistory(
  coin: string,
  tf: ChartTimeframe,
  candles: NormalizedCandle[],
): void {
  if (!candles.length) return;
  const key = cacheKey(coin, tf);
  const entry = { candles, at: Date.now() };
  MEMORY.set(key, entry);

  const blob = readSession();
  blob[key] = entry;
  const keys = Object.keys(blob);
  if (keys.length > 48) {
    keys
      .sort((a, b) => (blob[a]?.at ?? 0) - (blob[b]?.at ?? 0))
      .slice(0, keys.length - 24)
      .forEach((k) => delete blob[k]);
  }
  writeSession(blob);
}
