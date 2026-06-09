import { NextResponse } from "next/server";
import { OperatorGuideOrchestrator } from "@/lib/operator-guide/OperatorGuideOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "operator_guide_vitals", 120, 60_000);
  if (limited) return limited;

  try {
    const snap = OperatorGuideOrchestrator.snapshot();
    return NextResponse.json({
      guideScore: snap.guideScore,
      telemetry: snap.telemetry,
      explainModeActive: snap.explainModeActive,
      scenarioCount: snap.scenarios.length,
      registrySize: snap.registry.length,
      activeMode: snap.activeMode,
      asset: snap.asset,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "operator_guide_failed" }, { status: 500 });
  }
}
