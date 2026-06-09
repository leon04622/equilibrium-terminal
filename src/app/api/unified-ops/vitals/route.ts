import { NextResponse } from "next/server";
import { UnifiedOpsOrchestrator } from "@/lib/unified-ops/UnifiedOpsOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "unified_ops_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = UnifiedOpsOrchestrator.snapshot();
    return NextResponse.json({
      unifiedScore: snap.unifiedScore,
      telemetry: snap.telemetry,
      unifiedBrief: snap.unifiedBrief,
      activeTerminalMode: snap.activeTerminalMode,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "unified_ops_vitals_failed" }, { status: 500 });
  }
}
