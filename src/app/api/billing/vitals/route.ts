import { NextResponse } from "next/server";
import { BillingDeskOrchestrator } from "@/lib/billing-desk/BillingDeskOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "billing_vitals", 60, 60_000);
  if (limited) return limited;

  try {
    const snap = BillingDeskOrchestrator.snapshot();
    return NextResponse.json({
      commercialScore: snap.commercialScore,
      telemetry: snap.telemetry,
      plans: snap.plans.map((p) => ({ id: p.id, label: p.label, status: p.status })),
      commercialBrief: snap.commercialBrief,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "billing_vitals_failed" }, { status: 500 });
  }
}
