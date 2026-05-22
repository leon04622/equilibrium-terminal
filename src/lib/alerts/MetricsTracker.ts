import type { MarketEvent } from "@/types/alerts";
import type { NormalizedTrade } from "@/types/terminal-schema";

interface CoinMetrics {
  oiProxy: number;
  fundingRate: number;
  lastLargeSells: Array<{ t: number; n: number }>;
  volumeWindow: Array<{ t: number; n: number }>;
}

const state = new Map<string, CoinMetrics>();

function get(coin: string): CoinMetrics {
  let m = state.get(coin);
  if (!m) {
    m = {
      oiProxy: 1_000_000,
      fundingRate: 0.0001,
      lastLargeSells: [],
      volumeWindow: [],
    };
    state.set(coin, m);
  }
  return m;
}

export function ingestTradeForAlerts(trade: NormalizedTrade): MarketEvent[] {
  const events: MarketEvent[] = [];
  const m = get(trade.coin);
  const now = trade.time;

  if (trade.notionalUsd >= 75_000) {
    events.push({
      id: `whale-${trade.id}`,
      type: "ON_CHAIN_WHALE_TRANSFER",
      coin: trade.coin,
      timestamp: now,
      metrics: {
        notionalUsd: trade.notionalUsd,
        px: trade.price,
        midPx: trade.price,
      },
      meta: { side: trade.side },
    });
  }

  m.volumeWindow.push({ t: now, n: trade.notionalUsd });
  m.volumeWindow = m.volumeWindow.filter((x) => now - x.t < 300_000);
  const volSum = m.volumeWindow.reduce((a, b) => a + b.n, 0);
  const prevOi = m.oiProxy;
  m.oiProxy = m.oiProxy * 0.98 + volSum * 0.02;
  const oiChangePct = prevOi > 0 ? ((m.oiProxy - prevOi) / prevOi) * 100 : 0;

  if (oiChangePct > 8) {
    events.push({
      id: `oi-${trade.coin}-${now}`,
      type: "HL_OPEN_INTEREST_SPIKE",
      coin: trade.coin,
      timestamp: now,
      metrics: { oiChangePct, oiProxy: m.oiProxy, notionalUsd: trade.notionalUsd },
    });
  }

  const prevFunding = m.fundingRate;
  const drift = trade.side === "buy" ? 0.00005 : -0.00005;
  m.fundingRate = Math.max(-0.01, Math.min(0.01, m.fundingRate + drift));
  if (prevFunding >= 0 && m.fundingRate < 0) {
    events.push({
      id: `fund-${trade.coin}-${now}`,
      type: "HL_FUNDING_FLIP",
      coin: trade.coin,
      timestamp: now,
      metrics: {
        fundingRate: m.fundingRate,
        fundingRatePrev: prevFunding,
      },
    });
  }

  if (trade.side === "sell" && trade.notionalUsd >= 40_000) {
    m.lastLargeSells.push({ t: now, n: trade.notionalUsd });
  }
  m.lastLargeSells = m.lastLargeSells.filter((x) => now - x.t < 60_000);
  const clusterCount = m.lastLargeSells.length;
  const clusterNotionalUsd = m.lastLargeSells.reduce((a, b) => a + b.n, 0);
  if (clusterCount >= 3 && clusterNotionalUsd >= 250_000) {
    events.push({
      id: `liq-${trade.coin}-${now}`,
      type: "LIQUIDATION_CLUSTER_HIT",
      coin: trade.coin,
      timestamp: now,
      metrics: { clusterCount, clusterNotionalUsd },
    });
  }

  return events;
}
