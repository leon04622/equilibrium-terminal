import { NextResponse } from "next/server";
import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "commercial_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snapshot = CommercialOrchestrator.snapshot();
    return NextResponse.json({
      marketReadinessScore: snapshot.marketReadinessScore,
      trustScore: snapshot.trustScore,
      productTier: snapshot.productTier,
      subscription: snapshot.subscription,
      release: snapshot.release,
      analytics: snapshot.analytics,
      updatedAt: snapshot.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "commercial_vitals_failed" }, { status: 500 });
  }
}
