import { NextResponse } from "next/server";
import { MarketDataInternalApi } from "@/lib/ingest/MarketDataInternalApi";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "market_quotes", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  return NextResponse.json({
    asset: asset.toUpperCase(),
    quotes: MarketDataInternalApi.quotes(asset),
    updatedAt: Date.now(),
  });
}
