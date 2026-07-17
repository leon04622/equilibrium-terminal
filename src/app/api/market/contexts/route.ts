import { NextResponse } from "next/server";
import { buildMarketContextRowsFromUniverse } from "@/lib/market/hlMarketContexts";
import { loadHyperliquidUniverse } from "@/lib/market/hlUniverse";
import type { MarketContextRow } from "@/types/market-search";

export const dynamic = "force-dynamic";

let cache: { at: number; body: MarketContextRow[] } | null = null;
const CACHE_MS = 20_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json({ rows: cache.body, updatedAt: cache.at });
    }

    const bundle = await loadHyperliquidUniverse();
    const rows = buildMarketContextRowsFromUniverse(bundle);
    cache = { at: Date.now(), body: rows };

    return NextResponse.json({ rows, updatedAt: cache.at });
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_failed";
    return NextResponse.json({ rows: [], updatedAt: Date.now(), error: message }, { status: 500 });
  }
}
