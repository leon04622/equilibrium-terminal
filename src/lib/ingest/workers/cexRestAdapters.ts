/** CEX REST top-of-book + derivatives metadata — client-side pollers. */
import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import type { CrossVenueQuote, ExchangeId } from "@/types/multi-exchange";

export { fetchBinanceTopOfBook, fetchBybitTopOfBook, fetchOkxTopOfBook, fetchCoinbaseTopOfBook } from "@/lib/multi-exchange/adapters/publicRestAdapters";

function spreadBps(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null || bid <= 0) return null;
  const mid = (bid + ask) / 2;
  return mid > 0 ? ((ask - bid) / mid) * 10_000 : null;
}

function quote(
  exchange: ExchangeId,
  asset: string,
  bid: number | null,
  ask: number | null,
  extra: Partial<CrossVenueQuote> = {},
): CrossVenueQuote {
  const mid = bid != null && ask != null ? (bid + ask) / 2 : null;
  return {
    exchange,
    asset: asset.toUpperCase(),
    bid,
    ask,
    mid,
    spreadBps: spreadBps(bid, ask),
    fundingRate: null,
    openInterestUsd: null,
    volume24hUsd: null,
    timestamp: Date.now(),
    status: "live",
    ...extra,
  };
}

export async function fetchKrakenTopOfBook(asset: string): Promise<void> {
  const pair = asset.toUpperCase() === "BTC" ? "XBTUSD" : `${asset.toUpperCase()}USD`;
  const res = await fetch(
    `https://api.kraken.com/0/public/Ticker?pair=${pair}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`kraken ${res.status}`);
  const json = (await res.json()) as {
    result?: Record<string, { b: string[]; a: string[] }>;
  };
  const row = json.result ? Object.values(json.result)[0] : undefined;
  if (!row) throw new Error("kraken empty");
  multiExchangeMarketState.upsert(
    quote("kraken", asset, parseFloat(row.b[0]!), parseFloat(row.a[0]!)),
  );
}

export async function fetchDeribitTopOfBook(asset: string): Promise<void> {
  const name = asset.toUpperCase() === "BTC" ? "BTC-PERPETUAL" : `${asset.toUpperCase()}-PERPETUAL`;
  const res = await fetch(
    `https://www.deribit.com/api/v2/public/ticker?instrument_name=${name}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`deribit ${res.status}`);
  const json = (await res.json()) as {
    result?: {
      best_bid_price: number;
      best_ask_price: number;
      funding_8h?: number;
      open_interest?: number;
      mark_price?: number;
    };
  };
  const row = json.result;
  if (!row) throw new Error("deribit empty");
  multiExchangeMarketState.upsert(
    quote("deribit", asset, row.best_bid_price, row.best_ask_price, {
      fundingRate: row.funding_8h ?? null,
      openInterestUsd: row.open_interest ?? null,
    }),
  );
}
