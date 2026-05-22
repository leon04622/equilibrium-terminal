import { ExecutionRoutingEngine } from "@/lib/integrations/ExecutionRoutingEngine";
import type { ExecutionAnalyticsRow } from "@/types/crypto-ecosystem";

export class ExecutionAnalyticsEngine {
  static analytics(): ExecutionAnalyticsRow[] {
    return ExecutionRoutingEngine.routes()
      .filter((r) => r.active)
      .map((r, i) => ({
        venue: r.venue,
        asset: r.asset,
        fillRatePct: r.fillRatePct,
        avgSlippageBps: r.avgSlippageBps,
        latencyMs: 8 + i * 3,
        liquidityScore: r.liquidityScore,
        rank: i + 1,
      }));
  }
}
