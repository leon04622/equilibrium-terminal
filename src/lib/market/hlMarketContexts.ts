import type { HlPerpMeta } from "@/types/hyperliquid";
import type { MarketContextRow } from "@/types/market-search";
import type { TerminalAsset } from "@/types/terminal-schema";

export interface HlRawAssetCtx {
  funding?: string;
  premium?: string;
  openInterest?: string;
  markPx?: string;
  midPx?: string;
  oraclePx?: string;
  prevDayPx?: string;
  dayNtlVlm?: string;
}

const TRADFI_COINS = new Set([
  "SPCX",
  "SPX",
  "NDX",
  "DJI",
  "GOLD",
  "SILVER",
  "WTIOIL",
  "CL",
  "EUR",
  "JPY",
]);

function parseNum(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function isHip3Coin(name: string): boolean {
  return name.includes(":") || name.startsWith("xyz:");
}

function isTradfiCoin(coin: string): boolean {
  const base = coin.split(/[-/:]/)[0]?.toUpperCase() ?? coin.toUpperCase();
  if (TRADFI_COINS.has(base)) return true;
  return /^(SP|NDX|DJI|GOLD|SILVER|WTI|OIL|EUR|JPY)/i.test(base);
}

export function displayPair(asset: TerminalAsset): string {
  if (asset.market === "spot") return asset.symbol;
  return `${asset.symbol}-USDC`;
}

export function buildMarketContextRows(
  assets: TerminalAsset[],
  perpMeta: HlPerpMeta | null,
  ctxs: HlRawAssetCtx[],
  perpUniverse: Array<{ name: string; maxLeverage?: number }>,
): MarketContextRow[] {
  const leverageByCoin = new Map<string, number>();
  for (const u of perpUniverse) {
    if (u.maxLeverage != null) leverageByCoin.set(u.name, u.maxLeverage);
  }

  const ctxByCoin = new Map<string, HlRawAssetCtx>();
  perpUniverse.forEach((u, i) => {
    const ctx = ctxs[i];
    if (ctx) ctxByCoin.set(u.name, ctx);
  });

  return assets.map((asset) => {
    const ctx = asset.market === "perp" ? ctxByCoin.get(asset.coin) : undefined;
    const mark = parseNum(ctx?.markPx) ?? parseNum(ctx?.midPx);
    const oracle = parseNum(ctx?.oraclePx) ?? mark;
    const prev = parseNum(ctx?.prevDayPx);
    const last = mark ?? oracle;
    const changeAbs = last != null && prev != null ? last - prev : null;
    const changePct =
      changeAbs != null && prev != null && prev !== 0 ? (changeAbs / prev) * 100 : null;
    const fundingHourly = parseNum(ctx?.funding);
    const funding8hPct = fundingHourly != null ? fundingHourly * 8 * 100 : null;
    const oi = parseNum(ctx?.openInterest);
    const oiUsd = mark != null && oi != null ? oi * mark : null;
    const volume = parseNum(ctx?.dayNtlVlm);

    return {
      coin: asset.coin,
      symbol: asset.symbol,
      market: asset.market,
      displayName: displayPair(asset),
      maxLeverage: asset.market === "perp" ? leverageByCoin.get(asset.coin) ?? null : null,
      isHip3: asset.market === "perp" && isHip3Coin(asset.coin),
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
      out = out.filter((r) => r.market === "perp" && !isTradfiCoin(r.coin) && !r.isHip3);
      break;
    case "tradfi":
      out = out.filter((r) => isTradfiCoin(r.coin));
      break;
    case "hip3":
      out = out.filter((r) => r.isHip3);
      break;
    case "trending":
      out = [...out].sort((a, b) => (b.volume24hUsd ?? 0) - (a.volume24hUsd ?? 0)).slice(0, 40);
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
      const hay = `${r.displayName} ${r.coin} ${r.symbol}`.toLowerCase();
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
