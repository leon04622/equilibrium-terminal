import { NextResponse } from "next/server";
import { resolveDeploymentEnvironment } from "@/config/environments";
import { DeploymentOrchestrator } from "@/lib/devops/DeploymentOrchestrator";
import { GlobalRoutingEngine } from "@/lib/devops/GlobalRoutingEngine";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";
import { readGatewayMetrics } from "@/lib/infrastructure/server/gatewayMetrics";
import { serverOpsVitals, recordRequest } from "@/lib/devops/server/opsState";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "ops_vitals", 120, 60_000);
  if (limited) return limited;

  try {
    const gw = readGatewayMetrics();
    const server = serverOpsVitals();
    recordRequest(true);

    return NextResponse.json({
      environment: resolveDeploymentEnvironment(),
      release: DeploymentOrchestrator.currentRelease(),
      regions: GlobalRoutingEngine.regions({ "us-east": gw.gatewayLatencyMs }),
      gateway: gw,
      server,
      cicdStatus: DeploymentOrchestrator.cicdStatus(),
      updatedAt: Date.now(),
    });
  } catch {
    recordRequest(false);
    return NextResponse.json({ error: "ops_vitals_failed" }, { status: 500 });
  }
}
