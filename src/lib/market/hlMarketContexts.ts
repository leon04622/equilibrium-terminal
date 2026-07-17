import type { MarketContextRow } from "@/types/market-search";
import type { TerminalAsset } from "@/types/terminal-schema";
import type { HlPerpAssetCtx } from "@/types/hyperliquid";
import { perpDisplayPair } from "@/lib/hyperliquid/coin";
import type { HlUniverseBundle } from "@/lib/market/hlUniverse";

const TRADFI_COINS = new Set([
  "SPCX",
  "SPX",
  "S&P500",
  "US500",
  "USA500",
  "NDX",
  "DJI",
  "GOLD",
  "SILVER",
  "WTIOIL",
  "CL",
  "EUR",
  "JPY",
  "AAPL",
  "TSLA",
  "NVDA",
  "AMZN",
  "META",
  "GOOG",
  "MSFT",
]);

function parseNum(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export function isTradfiCoin(coin: string, symbol: string): boolean {
  const base = (coin.includes(":") ? coin.split(":")[1] : coin).split(/[-/]/)[0]?.toUpperCase() ?? coin;
  if (TRADFI_COINS.has(base)) return true;
  if (TRADFI_COINS.has(symbol.toUpperCase())) return true;
  return /^(SP|NDX|DJI|GOLD|SILVER|WTI|OIL|EUR|JPY|US500|USA500)/i.test(base);
}

export function displayPair(asset: TerminalAsset): string {
  if (asset.market === "spot") return asset.symbol;
  return perpDisplayPair(asset.coin);
}

export function buildMarketContextRowsFromUniverse(bundle: HlUniverseBundle): MarketContextRow[] {
  const { assets, perpCtxByCoin, spotCtxByCoin, leverageByCoin } = bundle;

  return assets.map((asset) => {
    const perpCtx = asset.market === "perp" ? perpCtxByCoin.get(asset.coin) : undefined;
    const spotCtx = asset.market === "spot" ? spotCtxByCoin.get(asset.coin) : undefined;
    const mark = parseNum(perpCtx?.markPx ?? spotCtx?.markPx) ?? parseNum(perpCtx?.midPx ?? spotCtx?.midPx);
    const oracle = parseNum(perpCtx?.oraclePx) ?? mark;
    const prev = parseNum(perpCtx?.prevDayPx ?? spotCtx?.prevDayPx);
    const last = mark ?? oracle;
    const changeAbs = last != null && prev != null ? last - prev : null;
    const changePct =
      changeAbs != null && prev != null && prev !== 0 ? (changeAbs / prev) * 100 : null;
    const fundingHourly = perpCtx ? parseNum(perpCtx.funding) : null;
    const funding8hPct = fundingHourly != null ? fundingHourly * 8 * 100 : null;
    const oi = perpCtx ? parseNum(perpCtx.openInterest) : null;
    const oiUsd = asset.market === "perp" && mark != null && oi != null ? oi * mark : null;
    const volume = parseNum(perpCtx?.dayNtlVlm ?? spotCtx?.dayNtlVlm);

    const isHip3 = asset.market === "perp" && (asset.isHip3 === true || asset.dex !== "main");
    const dex = isHip3 && asset.dex && asset.dex !== "main" ? asset.dex : null;

    return {
      coin: asset.coin,
      symbol: asset.symbol,
      market: asset.market,
      displayName: displayPair(asset),
      maxLeverage: asset.market === "perp" ? leverageByCoin.get(asset.coin) ?? null : null,
      isHip3,
      dex,
      lastPrice: last,
      markPrice: mark,
      oraclePrice: oracle,
      change24hAbs: changeAbs,
      change24hPct: changePct,
      funding8hPct,
      volume24hUsd: volume,
      openInterestUsd: oiUsd,
    };
  });
}

export function filterMarketRows(
  rows: MarketContextRow[],
  tab: import("@/types/market-search").MarketSearchTab,
  favoriteCoins: Set<string>,
  query: string,
  strict: boolean,
): MarketContextRow[] {
  let out = rows;

  switch (tab) {
    case "favorites":
      out = out.filter((r) => favoriteCoins.has(r.coin));
      break;
    case "perps":
      out = out.filter((r) => r.market === "perp");
      break;
    case "spot":
      out = out.filter((r) => r.market === "spot");
      break;
    case "crypto":
      out = out.filter(
        (r) => r.market === "perp" && !r.isHip3 && !isTradfiCoin(r.coin, r.symbol),
      );
      break;
    case "tradfi":
      out = out.filter((r) => isTradfiCoin(r.coin, r.symbol));
      break;
    case "hip3":
      out = out.filter((r) => r.isHip3);
      break;
    case "trending":
      out = [...out].sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0)).slice(0, 80);
      break;
    case "prelaunch":
      out = [];
      break;
    case "all":
    default:
      break;
  }

  const q = query.trim().toLowerCase();
  if (q) {
    out = out.filter((r) => {
      const hay = `${r.displayName} ${r.coin} ${r.symbol} ${r.dex ?? ""}`.toLowerCase();
      if (strict) {
        return (
          r.coin.toLowerCase() === q ||
          r.symbol.toLowerCase() === q ||
          r.displayName.toLowerCase() === q
        );
      }
      return hay.includes(q);
    });
  }

  return out;
}

export function fundingCountdownMs(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setUTCMinutes(0, 0, 0);
  nextHour.setUTCHours(now.getUTCHours() + 1);
  return Math.max(0, nextHour.getTime() - now.getTime());
}

export function formatFundingCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatUsd(value: number | null, decimals = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPriceHl(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (abs >= 1) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

/** @deprecated use buildMarketContextRowsFromUniverse */
export function buildMarketContextRows(
  assets: TerminalAsset[],
  _perpMeta: unknown,
  ctxs: import("@/types/hyperliquid").HlPerpAssetCtx[],
  perpUniverse: Array<{ name: string; maxLeverage?: number }>,
): MarketContextRow[] {
  const perpCtxByCoin = new Map<string, HlPerpAssetCtx>();
  const leverageByCoin = new Map<string, number>();
  perpUniverse.forEach((u, i) => {
    if (u.maxLeverage != null) leverageByCoin.set(u.name, u.maxLeverage);
    const ctx = ctxs[i];
    if (ctx) perpCtxByCoin.set(u.name, ctx);
  });
  return buildMarketContextRowsFromUniverse({
    assets,
    perpCtxByCoin,
    spotCtxByCoin: new Map(),
    leverageByCoin,
  });
}
