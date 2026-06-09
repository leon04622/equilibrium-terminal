import { NextResponse } from "next/server";
import { GlobalRoutingEngine } from "@/lib/devops/GlobalRoutingEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "ops_regions", 60, 60_000);
  if (limited) return limited;

  const regions = GlobalRoutingEngine.regions();
  return NextResponse.json({
    active: GlobalRoutingEngine.pickActiveRegion(regions),
    regions,
  });
}
