import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthEngine } from "@/lib/infrastructure/AuthEngine";
import { getJwtSecret } from "@/lib/infrastructure/jwt";
import { buildVitalsFromWorker } from "@/lib/infrastructure/server/persistenceWorker";
import { listWorkspaceIds } from "@/lib/infrastructure/server/workspaceStore";
import {
  readGatewayMetrics,
  reportGatewayMetrics,
} from "@/lib/infrastructure/server/gatewayMetrics";
import type { SubscriptionTier } from "@/types/production-platform";

export const runtime = "nodejs";

const authEngine = new AuthEngine({ jwtSecret: getJwtSecret() });

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_session")?.value;
  let tier: SubscriptionTier = "desk";
  let deskCount = 1;

  if (token) {
    const claims = await authEngine.verifyAccessToken(token);
    if (claims) {
      tier = claims.tier;
      deskCount = Math.max(1, listWorkspaceIds(claims.sub).length);
    }
  }

  const { gatewayLatencyMs, gatewayFanoutClients } = readGatewayMetrics();
  const vitals = buildVitalsFromWorker(
    gatewayLatencyMs,
    1,
    gatewayFanoutClients,
    tier,
    deskCount,
  );

  return NextResponse.json(vitals);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      gatewayLatencyMs?: number;
      gatewayFanoutClients?: number;
    };
    const current = readGatewayMetrics();
    reportGatewayMetrics(
      typeof body.gatewayLatencyMs === "number"
        ? body.gatewayLatencyMs
        : current.gatewayLatencyMs,
      typeof body.gatewayFanoutClients === "number"
        ? body.gatewayFanoutClients
        : current.gatewayFanoutClients,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
}
