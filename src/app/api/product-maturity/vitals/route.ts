import { NextResponse } from "next/server";
import { ProductMaturityOrchestrator } from "@/lib/product-maturity/ProductMaturityOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "product_maturity_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = ProductMaturityOrchestrator.snapshot();
    return NextResponse.json({
      polishScore: snap.polishScore,
      telemetry: snap.telemetry,
      maturityBrief: snap.maturityBrief,
      activeMode: snap.activeMode,
      asset: snap.asset,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "product_maturity_vitals_failed" }, { status: 500 });
  }
}
