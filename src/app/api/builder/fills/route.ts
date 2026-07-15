import { NextResponse } from "next/server";
import { EQUILIBRIUM_BUILDER_ADDRESS } from "@/lib/hyperliquid/builder";
import { fetchBuilderFillAnalytics } from "@/lib/infrastructure/server/builderFillsStats";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days");
  const days = daysParam ? Number.parseInt(daysParam, 10) : 7;
  const builder = (searchParams.get("builder") ?? EQUILIBRIUM_BUILDER_ADDRESS).toLowerCase();

  try {
    const analytics = await fetchBuilderFillAnalytics(builder, days);
    return NextResponse.json(analytics);
  } catch (err) {
    const message = err instanceof Error ? err.message : "builder_fills_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
