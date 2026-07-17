import { NextResponse } from "next/server";
import { buildMarketContextRows, type HlRawAssetCtx } from "@/lib/market/hlMarketContexts";
import { loadHyperliquidAssets } from "@/lib/assets";
import { fetchPerpMeta } from "@/lib/hyperliquid/api";
import { HL_INFO_HTTP_URL } from "@/lib/hyperliquid/constants";
import type { HlPerpMeta } from "@/types/hyperliquid";

export const dynamic = "force-dynamic";

let cache: { at: number; body: ReturnType<typeof buildMarketContextRows> } | null = null;
const CACHE_MS = 15_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json({ rows: cache.body, updatedAt: cache.at });
    }

    const [assets, perpMeta, ctxRes] = await Promise.all([
      loadHyperliquidAssets(),
      fetchPerpMeta(),
      fetch(HL_INFO_HTTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs" }),
        next: { revalidate: 15 },
      }),
    ]);

    if (!ctxRes.ok) {
      return NextResponse.json({ rows: [], updatedAt: Date.now(), error: "hl_unavailable" }, { status: 502 });
    }

    const ctxBody = (await ctxRes.json()) as [HlPerpMeta, HlRawAssetCtx[]];
    const universe = ctxBody[0]?.universe ?? perpMeta.universe;
    const ctxs = ctxBody[1] ?? [];

    const rows = buildMarketContextRows(assets, perpMeta, ctxs, universe);
    cache = { at: Date.now(), body: rows };

    return NextResponse.json({ rows, updatedAt: cache.at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_failed";
    return NextResponse.json({ rows: [], updatedAt: Date.now(), error: message }, { status: 500 });
  }
}
