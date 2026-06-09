import { NextResponse } from "next/server";
import { LiveExecOrchestrator } from "@/lib/live-exec-desk/LiveExecOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "live_exec_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = LiveExecOrchestrator.snapshot();
    return NextResponse.json({
      liveExecScore: snap.liveExecScore,
      telemetry: snap.telemetry,
      liveBrief: snap.liveBrief,
      activeDesk: snap.activeDesk,
      asset: snap.asset,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "live_exec_vitals_failed" }, { status: 500 });
  }
}
