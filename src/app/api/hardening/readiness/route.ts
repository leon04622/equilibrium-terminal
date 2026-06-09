import { NextResponse } from "next/server";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "hardening_readiness", 60, 60_000);
  if (limited) return limited;

  try {
    const snapshot = HardeningOrchestrator.snapshot();
    return NextResponse.json({
      launchReadinessScore: snapshot.launchReadinessScore,
      launchApproved: snapshot.launchApproved,
      blockers: snapshot.blockers,
      integrationScore: snapshot.integrationScore,
      workflowScore: snapshot.workflowScore,
      gates: snapshot.gates,
      updatedAt: snapshot.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "hardening_readiness_failed" }, { status: 500 });
  }
}
