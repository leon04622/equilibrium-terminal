import { NextResponse } from "next/server";
import { GlobalIntelOrchestrator } from "@/lib/global-intel-desk/GlobalIntelOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "global_intel_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = GlobalIntelOrchestrator.snapshot();
    return NextResponse.json({
      globalScore: snap.globalScore,
      telemetry: snap.telemetry,
      globalBrief: snap.globalBrief,
      wireCount: snap.newsFeed.length,
      eventCount: snap.macroEvents.length,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "global_intel_vitals_failed" }, { status: 500 });
  }
}
