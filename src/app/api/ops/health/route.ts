import { NextResponse } from "next/server";
import { resolveDeploymentEnvironment } from "@/config/environments";
import { serverOpsVitals } from "@/lib/devops/server/opsState";

export const runtime = "nodejs";

/** Liveness / readiness for load balancers and external monitors. */
export async function GET() {
  const vitals = serverOpsVitals();
  const env = resolveDeploymentEnvironment();
  const ready = vitals.operationalScore >= 70;

  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.NEXT_PUBLIC_EQ_GIT_SHA ??
    null;

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      environment: env,
      gitSha,
      uptimeSec: vitals.processUptimeSec,
      operationalScore: vitals.operationalScore,
      timestamp: Date.now(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        "cache-control": "no-store",
        "x-eq-env": env,
        "x-eq-git": gitSha ?? "unknown",
      },
    },
  );
}
