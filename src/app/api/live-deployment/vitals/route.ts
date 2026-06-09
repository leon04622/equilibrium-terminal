import { NextResponse } from "next/server";
import { LiveDeploymentOrchestrator } from "@/lib/live-deployment/LiveDeploymentOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "live_deployment_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = LiveDeploymentOrchestrator.snapshot();
    return NextResponse.json({
      deploymentScore: snap.deploymentScore,
      telemetry: snap.telemetryMeta,
      deploymentBrief: snap.deploymentBrief,
      iterationFocus: snap.iterationFocus,
      activeMode: snap.activeMode,
      asset: snap.asset,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "live_deployment_vitals_failed" }, { status: 500 });
  }
}
