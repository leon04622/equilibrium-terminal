import { NextResponse } from "next/server";
import { DerivativesIntelligenceOrchestrator } from "@/lib/derivatives/DerivativesIntelligenceOrchestrator";
import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "derivatives_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    await OptionsIngestionEngine.ingest(asset);
    const snap = DerivativesIntelligenceOrchestrator.snapshot(asset);
    return NextResponse.json({
      derivativesScore: snap.derivativesScore,
      volatility: snap.volatility,
      funding: snap.funding,
      marketState: snap.marketState,
      alerts: snap.alerts,
      telemetry: snap.telemetry,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "derivatives_vitals_failed" }, { status: 500 });
  }
}
