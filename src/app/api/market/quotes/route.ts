import { NextResponse } from "next/server";
import { pollPublicVenues } from "@/lib/multi-exchange/adapters/publicRestAdapters";
import { MarketDataInternalApi } from "@/lib/ingest/MarketDataInternalApi";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "market_quotes", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get("asset") ?? "BTC").toUpperCase();

  try {
    await pollPublicVenues(asset);
  } catch {
    /* client workers may already have fresher data */
  }

  return NextResponse.json({
    asset,
    quotes: MarketDataInternalApi.quotes(asset),
    updatedAt: Date.now(),
  });
}
