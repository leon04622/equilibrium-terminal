import {
  fetchFrontendOpenOrders,
  fetchUserFills,
  type HlFrontendOpenOrder,
  type HlUserFill,
} from "@/lib/hyperliquid/api";
import type { LiveBlotterSnapshot, LiveFill, LiveOpenOrder } from "@/types/institutional-capabilities";

function mapOpenOrder(raw: HlFrontendOpenOrder): LiveOpenOrder {
  return {
    oid: raw.oid,
    coin: raw.coin,
    side: raw.side === "B" ? "buy" : "sell",
    limitPx: Number.parseFloat(raw.limitPx),
    sz: Number.parseFloat(raw.sz),
    origSz: Number.parseFloat(raw.origSz),
    timestamp: raw.timestamp,
    orderType: raw.orderType ?? "limit",
    reduceOnly: Boolean(raw.reduceOnly),
  };
}

function mapFill(raw: HlUserFill): LiveFill {
  return {
    id: `${raw.tid}-${raw.oid}`,
    coin: raw.coin,
    side: raw.side === "B" ? "buy" : "sell",
    px: Number.parseFloat(raw.px),
    sz: Number.parseFloat(raw.sz),
    fee: Number.parseFloat(raw.fee),
    closedPnl: Number.parseFloat(raw.closedPnl),
    time: raw.time,
    crossed: raw.crossed,
    dir: raw.dir,
  };
}

export class LiveBlotterEngine {
  static async snapshot(wallet: string | null): Promise<LiveBlotterSnapshot> {
    if (!wallet) {
      return {
        wallet: null,
        openOrders: [],
        fills: [],
        lastRefreshAt: Date.now(),
        error: "Wallet not connected",
      };
    }

    try {
      const [openOrders, fills] = await Promise.all([
        fetchFrontendOpenOrders(wallet),
        fetchUserFills(wallet),
      ]);

      return {
        wallet,
        openOrders: openOrders.map(mapOpenOrder).sort((a, b) => b.timestamp - a.timestamp),
        fills: fills.map(mapFill).sort((a, b) => b.time - a.time).slice(0, 100),
        lastRefreshAt: Date.now(),
        error: null,
      };
    } catch (e) {
      return {
        wallet,
        openOrders: [],
        fills: [],
        lastRefreshAt: Date.now(),
        error: e instanceof Error ? e.message : "Blotter refresh failed",
      };
    }
  }
}
