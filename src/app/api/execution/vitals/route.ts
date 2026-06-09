import { NextResponse } from "next/server";
import { ExecutionAnalyticsOrchestrator } from "@/lib/execution-analytics/ExecutionAnalyticsOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "execution_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    const snap = ExecutionAnalyticsOrchestrator.snapshot(asset);
    return NextResponse.json({
      analyticsScore: snap.analyticsScore,
      executionConfidence: snap.executionConfidence,
      orderFlow: snap.orderFlow,
      quality: snap.quality,
      alerts: snap.alerts,
      telemetry: snap.telemetry,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "execution_vitals_failed" }, { status: 500 });
  }
}
