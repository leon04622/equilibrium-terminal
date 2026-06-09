import { NextResponse } from "next/server";
import { DeskOpsOrchestrator } from "@/lib/desk-ops/DeskOpsOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "desk_ops_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = DeskOpsOrchestrator.snapshot();
    return NextResponse.json({
      orgScore: snap.orgScore,
      telemetry: snap.telemetry,
      orgBrief: snap.orgBrief,
      workspaceCount: snap.workspaces.length,
      alertCount: snap.orgAlerts.length,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "desk_ops_vitals_failed" }, { status: 500 });
  }
}
