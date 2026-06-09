import { NextResponse } from "next/server";
import { MobileDeskOrchestrator } from "@/lib/mobile-desk/MobileDeskOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "mobile_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    const snap = MobileDeskOrchestrator.snapshot(asset);
    return NextResponse.json({
      awarenessScore: snap.awarenessScore,
      telemetry: snap.telemetry,
      alertCount: snap.alerts.length,
      incidentActive: snap.incidentMode !== null,
      awarenessBrief: snap.awarenessBrief,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "mobile_vitals_failed" }, { status: 500 });
  }
}
