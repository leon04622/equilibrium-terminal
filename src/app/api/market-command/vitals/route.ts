import { NextResponse } from "next/server";
import { MarketCommandOrchestrator } from "@/lib/market-command/MarketCommandOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "market_command_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = MarketCommandOrchestrator.snapshot();
    return NextResponse.json({
      situationalScore: snap.situationalScore,
      telemetry: snap.telemetry,
      situationalBrief: snap.situationalBrief,
      aiSummary: snap.aiSummary,
      activeMode: snap.activeMode,
      asset: snap.asset,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "market_command_vitals_failed" }, { status: 500 });
  }
}
