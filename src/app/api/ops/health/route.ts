import { NextResponse } from "next/server";
import { resolveDeploymentEnvironment } from "@/config/environments";
import { serverOpsVitals } from "@/lib/devops/server/opsState";

export const runtime = "nodejs";

/** Liveness / readiness for load balancers and external monitors. */
export async function GET() {
  const vitals = serverOpsVitals();
  const env = resolveDeploymentEnvironment();
  const ready = vitals.operationalScore >= 70;

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      environment: env,
      uptimeSec: vitals.processUptimeSec,
      operationalScore: vitals.operationalScore,
      timestamp: Date.now(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "cache-control": "no-store",
        "x-eq-env": env,
      },
    },
  );
}
