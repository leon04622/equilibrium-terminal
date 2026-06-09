import { NextResponse } from "next/server";
import { PortfolioDeskOrchestrator } from "@/lib/portfolio-desk/PortfolioDeskOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "portfolio_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    const snap = PortfolioDeskOrchestrator.snapshot(asset);
    return NextResponse.json({
      portfolioHealthScore: snap.portfolioHealthScore,
      risk: snap.risk,
      treasury: snap.treasury,
      analytics: snap.analytics,
      alerts: snap.alerts,
      telemetry: snap.telemetry,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "portfolio_vitals_failed" }, { status: 500 });
  }
}
