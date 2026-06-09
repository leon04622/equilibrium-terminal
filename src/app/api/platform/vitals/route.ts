import { NextResponse } from "next/server";
import { PlatformDeskOrchestrator } from "@/lib/platform-desk/PlatformDeskOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "platform_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    const snap = PlatformDeskOrchestrator.snapshot(asset);
    return NextResponse.json({
      platformScore: snap.platformScore,
      telemetry: snap.telemetry,
      liveEndpoints: snap.telemetry.liveEndpoints,
      gatewayCount: snap.gateway.length,
      sdkCount: snap.sdks.length,
      integrationBrief: snap.integrationBrief,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "platform_vitals_failed" }, { status: 500 });
  }
}
