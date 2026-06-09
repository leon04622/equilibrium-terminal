import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import type { CrossVenueQuote, ExchangeId } from "@/types/multi-exchange";

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

export async function fetchBinanceTopOfBook(asset: string): Promise<void> {
  const symbol = `${asset.toUpperCase()}USDT`;
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`binance ${res.status}`);
  const data = (await res.json()) as { bidPrice: string; askPrice: string };
  multiExchangeMarketState.upsert(
    quote("binance", asset, parseFloat(data.bidPrice), parseFloat(data.askPrice)),
  );
}

export async function fetchBybitTopOfBook(asset: string): Promise<void> {
  const symbol = `${asset.toUpperCase()}USDT`;
  const url = `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`bybit ${res.status}`);
  const json = (await res.json()) as {
    result?: { list?: Array<{ bid1Price: string; ask1Price: string; fundingRate?: string; openInterest?: string; turnover24h?: string }> };
  };
  const row = json.result?.list?.[0];
  if (!row) throw new Error("bybit empty");
  multiExchangeMarketState.upsert(
    quote("bybit", asset, parseFloat(row.bid1Price), parseFloat(row.ask1Price), {
      fundingRate: row.fundingRate ? parseFloat(row.fundingRate) : null,
      openInterestUsd: row.openInterest ? parseFloat(row.openInterest) : null,
      volume24hUsd: row.turnover24h ? parseFloat(row.turnover24h) : null,
    }),
  );
}

export async function fetchOkxTopOfBook(asset: string): Promise<void> {
  const instId = `${asset.toUpperCase()}-USDT-SWAP`;
  const url = `https://www.okx.com/api/v5/market/ticker?instId=${instId}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`okx ${res.status}`);
  const json = (await res.json()) as {
    data?: Array<{ bidPx: string; askPx: string; fundingRate?: string; openInterest?: string; volCcy24h?: string }>;
  };
  const row = json.data?.[0];
  if (!row) throw new Error("okx empty");
  multiExchangeMarketState.upsert(
    quote("okx", asset, parseFloat(row.bidPx), parseFloat(row.askPx), {
      fundingRate: row.fundingRate ? parseFloat(row.fundingRate) : null,
      openInterestUsd: row.openInterest ? parseFloat(row.openInterest) : null,
      volume24hUsd: row.volCcy24h ? parseFloat(row.volCcy24h) : null,
    }),
  );
}

export async function fetchCoinbaseTopOfBook(asset: string): Promise<void> {
  const product = `${asset.toUpperCase()}-USD`;
  const res = await fetch(
    `https://api.exchange.coinbase.com/products/${product}/ticker`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`coinbase ${res.status}`);
  const data = (await res.json()) as { bid: string; ask: string };
  multiExchangeMarketState.upsert(
    quote("coinbase", asset, parseFloat(data.bid), parseFloat(data.ask)),
  );
}

const POLLERS: Array<{ id: ExchangeId; fn: (asset: string) => Promise<void> }> = [
  { id: "binance", fn: fetchBinanceTopOfBook },
  { id: "bybit", fn: fetchBybitTopOfBook },
  { id: "okx", fn: fetchOkxTopOfBook },
  { id: "coinbase", fn: fetchCoinbaseTopOfBook },
];

export async function pollPublicVenues(asset: string): Promise<Record<ExchangeId, VenueFeedStatus>> {
  const status: Partial<Record<ExchangeId, VenueFeedStatus>> = {};
  await Promise.all(
    POLLERS.map(async ({ id, fn }) => {
      try {
        await fn(asset);
        status[id] = "live";
      } catch {
        status[id] = "degraded";
      }
    }),
  );
  return status as Record<ExchangeId, VenueFeedStatus>;
}

type VenueFeedStatus = CrossVenueQuote["status"];
