import { NextResponse } from "next/server";
import { OperatorAiOrchestrator } from "@/lib/operator-ai-desk/OperatorAiOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "operator_ai_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = OperatorAiOrchestrator.snapshot();
    return NextResponse.json({
      assistantScore: snap.assistantScore,
      telemetry: snap.telemetry,
      operatorBrief: snap.operatorBrief,
      contextSources: snap.systemContext.length,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "operator_ai_vitals_failed" }, { status: 500 });
  }
}
