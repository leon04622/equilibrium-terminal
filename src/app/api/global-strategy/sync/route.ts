import { NextResponse } from "next/server";
import {
  getGlobalStrategyVitals,
  syncGlobalStrategyState,
} from "@/lib/infrastructure/server/globalStrategyStore";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getGlobalStrategyVitals());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      infrastructureTrustScore?: number;
      globalReadinessScore?: number;
      moatCompositeScore?: number;
    };
    syncGlobalStrategyState({
      infrastructureTrustScore: body.infrastructureTrustScore ?? 0,
      globalReadinessScore: body.globalReadinessScore ?? 0,
      moatCompositeScore: body.moatCompositeScore ?? 0,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}
