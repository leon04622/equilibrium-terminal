import { NextResponse } from "next/server";
import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "memory_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";
  const q = searchParams.get("q") ?? "";

  try {
    const snap = MarketMemoryOrchestrator.snapshot(asset, q);
    return NextResponse.json({
      memoryScore: snap.memoryScore,
      currentRegime: snap.currentRegime,
      replay: snap.replay,
      analogs: snap.analogs,
      archiveCount: snap.archive.length,
      telemetry: snap.telemetry,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "memory_vitals_failed" }, { status: 500 });
  }
}
