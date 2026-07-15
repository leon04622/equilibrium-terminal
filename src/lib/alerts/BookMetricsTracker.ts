import type { MarketEvent } from "@/types/alerts";
import type { NormalizedOrderBook } from "@/types/terminal-schema";

interface BookTrack {
  lastMid: number;
  lastSpreadBps: number;
}

const state = new Map<string, BookTrack>();

function get(coin: string): BookTrack {
  let m = state.get(coin);
  if (!m) {
    m = { lastMid: 0, lastSpreadBps: 0 };
    state.set(coin, m);
  }
  return m;
}

/** Book-driven alerts: spread widening and short-horizon vol spikes. */
export function ingestBookForAlerts(coin: string, book: NormalizedOrderBook): MarketEvent[] {
  const events: MarketEvent[] = [];
  const now = Date.now();
  const m = get(coin);
  const mid = book.mid;
  if (mid == null || mid <= 0) return events;

  const spreadBps = book.spreadBps ?? 0;
  if (spreadBps >= 12) {
    events.push({
      id: `spread-${coin}-${now}`,
      type: "HL_SPREAD_WIDE",
      coin,
      timestamp: now,
      metrics: { spreadBps, midPx: mid },
    });
  }

  if (m.lastMid > 0) {
    const midMoveBps = (Math.abs(mid - m.lastMid) / m.lastMid) * 10_000;
    if (midMoveBps >= 25) {
      events.push({
        id: `vol-${coin}-${now}`,
        type: "HL_VOL_SPIKE",
        coin,
        timestamp: now,
        metrics: { midMoveBps, midPx: mid, spreadBps },
      });
    }
  }

  m.lastMid = mid;
  m.lastSpreadBps = spreadBps;
  return events;
}
