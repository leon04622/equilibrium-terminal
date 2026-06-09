import { NextResponse } from "next/server";
import { GraphIngestPipeline } from "@/lib/knowledge-graph/GraphIngestPipeline";
import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "systemic_vitals", 120, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const asset = searchParams.get("asset") ?? "BTC";

  try {
    GraphIngestPipeline.run();
    const snap = SystemicIntelligenceOrchestrator.snapshot(asset);
    return NextResponse.json({
      systemicScore: snap.systemicScore,
      systemicRisk: snap.systemicRisk,
      relationshipMetrics: snap.relationshipMetrics,
      narratives: snap.narratives,
      alerts: snap.alerts,
      telemetry: snap.telemetry,
      aiContextSummary: snap.aiContextSummary,
      updatedAt: snap.updatedAt,
    });
  } catch {
    return NextResponse.json({ error: "systemic_vitals_failed" }, { status: 500 });
  }
}
