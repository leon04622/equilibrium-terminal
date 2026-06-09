import { NextResponse } from "next/server";
import { AlphaOrchestrator } from "@/lib/alpha/AlphaOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "alpha_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snapshot = AlphaOrchestrator.snapshot();
    return NextResponse.json({
      operationalScore: snapshot.operationalScore,
      cohort: snapshot.cohort,
      rolloutPct: snapshot.rolloutPct,
      retention: snapshot.retention,
      successIndicators: snapshot.successIndicators,
      killSwitchActive: snapshot.killSwitchActive,
      updatedAt: snapshot.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "alpha_vitals_failed" }, { status: 500 });
  }
}
