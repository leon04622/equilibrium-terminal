import type { InstitutionalNewsHeadline } from "@/types/institutional-news";
import { HL_INFO_HTTP_URL } from "@/lib/hyperliquid/constants";

const CACHE_MS = 30_000;
const WATCH_ASSETS = ["BTC", "ETH", "SOL", "HYPE"] as const;

interface HlAssetCtx {
  funding?: string;
  premium?: string;
  openInterest?: string;
  markPx?: string;
  dayNtlVlm?: string;
}

let cache: { at: number; items: InstitutionalNewsHeadline[] } | null = null;
let lastLiveCount = 0;

function fundingBps(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n * 10_000 : null;
}

function formatUsdCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

export async function fetchHlDerivativesWireHeadlines(
  limit = 8,
): Promise<InstitutionalNewsHeadline[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    lastLiveCount = cache.items.length;
    return cache.items.slice(0, limit);
  }

  try {
    const res = await fetch(HL_INFO_HTTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      lastLiveCount = 0;
      return cache?.items.slice(0, limit) ?? [];
    }

    const body = (await res.json()) as [
      { universe: Array<{ name: string }> },
      HlAssetCtx[],
    ];
    const universe = body[0]?.universe ?? [];
    const ctxs = body[1] ?? [];

    const rows = universe
      .map((asset, i) => {
        const ctx = ctxs[i];
        if (!ctx) return null;
        const funding = fundingBps(ctx.funding);
        const mark = Number.parseFloat(ctx.markPx ?? "0");
        const oi = Number.parseFloat(ctx.openInterest ?? "0");
        const oiUsd = mark > 0 && oi > 0 ? oi * mark : 0;
        return {
          coin: asset.name,
          funding,
          premium: Number.parseFloat(ctx.premium ?? "0"),
          oiUsd,
          dayNtlVlm: Number.parseFloat(ctx.dayNtlVlm ?? "0"),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null && row.funding != null);

    const headlines: InstitutionalNewsHeadline[] = [];
    const now = Date.now();

    for (const coin of WATCH_ASSETS) {
      const row = rows.find((r) => r.coin === coin);
      if (!row || row.funding == null) continue;
      const bps = row.funding;
      const sign = bps >= 0 ? "+" : "";
      headlines.push({
        id: `HL-FUND-${coin}-${now}`,
        headline: `HL perps · ${coin} funding ${sign}${bps.toFixed(2)} bps · OI ${formatUsdCompact(row.oiUsd)}`,
        detail: `Hyperliquid mainnet mark ${row.oiUsd > 0 ? formatUsdCompact(row.oiUsd) : "—"} open interest · 8h funding snapshot.`,
        source: "HYPERLIQUID",
        tier: "hl",
        timestamp: now,
        coin,
        url: "https://app.hyperliquid.xyz/trade",
        verified: true,
        priority: 93,
      });
    }

    const stress = [...rows]
      .sort((a, b) => Math.abs(b.funding ?? 0) - Math.abs(a.funding ?? 0))
      .filter((row) => !WATCH_ASSETS.some((w) => w === row.coin))
      .slice(0, 4);

    for (const row of stress) {
      if (row.funding == null) continue;
      const bps = row.funding;
      if (Math.abs(bps) < 3) continue;
      headlines.push({
        id: `HL-STRESS-${row.coin}-${now}`,
        headline: `HL crowding · ${row.coin} funding ${bps >= 0 ? "+" : ""}${bps.toFixed(1)} bps`,
        detail: `Elevated perp funding on Hyperliquid · OI ${formatUsdCompact(row.oiUsd)}.`,
        source: "HYPERLIQUID",
        tier: "hl",
        timestamp: now,
        coin: row.coin,
        url: "https://app.hyperliquid.xyz/trade",
        verified: true,
        priority: 91 + Math.min(4, Math.floor(Math.abs(bps) / 5)),
      });
    }

    const merged = headlines
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);

    lastLiveCount = merged.length;
    cache = { at: Date.now(), items: merged.length > 0 ? merged : cache?.items ?? [] };
    return cache.items.slice(0, limit);
  } catch {
    lastLiveCount = 0;
    return cache?.items.slice(0, limit) ?? [];
  }
}

export function getHlDerivativesWireStatus(): { live: boolean; count: number } {
  return { live: lastLiveCount > 0, count: lastLiveCount };
}
