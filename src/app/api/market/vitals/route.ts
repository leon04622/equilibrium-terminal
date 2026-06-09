import { NextResponse } from "next/server";
import { MarketDataBackboneOrchestrator } from "@/lib/ingest/MarketDataBackboneOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "market_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    const snap = MarketDataBackboneOrchestrator.platformSnapshot(asset);
    return NextResponse.json({
      ingestScore: snap.ingestScore,
      backboneScore: snap.backbone.backboneScore,
      liveWorkers: snap.backbone.liveWorkerCount,
      crossVenueQuotes: snap.backbone.crossVenueQuoteCount,
      quality: snap.quality,
      streams: snap.backbone.streams,
      workers: snap.backbone.workers,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "market_vitals_failed" }, { status: 500 });
  }
}
