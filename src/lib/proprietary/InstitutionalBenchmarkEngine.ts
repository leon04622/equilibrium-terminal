import { MarketCoverageRegistry } from "@/lib/coverage/MarketCoverageRegistry";
import { ExecutionRoutingEngine } from "@/lib/integrations/ExecutionRoutingEngine";
import type { InstitutionalBenchmark } from "@/types/proprietary-intelligence";

export class InstitutionalBenchmarkEngine {
  static rankings(): InstitutionalBenchmark[] {
    const venues = MarketCoverageRegistry.list();
    const routes = ExecutionRoutingEngine.routes().filter((r) => r.active);
    const benchmarks: InstitutionalBenchmark[] = [];

    venues
      .filter((v) => v.status === "live" || v.status === "degraded")
      .forEach((v, i) => {
        const score = v.status === "live" ? 92 - (v.latencyMs ?? 0) * 0.1 : 65;
        benchmarks.push({
          id: `bench-ex-${v.id}`,
          category: "exchange_reliability",
          entity: v.name,
          rank: i + 1,
          score: Math.round(Math.max(40, score)),
          delta7d: v.status === "live" ? 2 : -4,
          label: v.status.toUpperCase(),
        });
        benchmarks.push({
          id: `bench-liq-${v.id}`,
          category: "liquidity_quality",
          entity: v.name,
          rank: i + 1,
          score: Math.round(Math.max(50, score - 5)),
          delta7d: 1,
          label: `${v.assetsTracked} assets`,
        });
      });

    routes.forEach((r, i) => {
      benchmarks.push({
        id: `bench-exec-${r.id}`,
        category: "execution_quality",
        entity: r.venue,
        rank: i + 1,
        score: Math.round(r.fillRatePct),
        delta7d: -r.avgSlippageBps,
        label: `${r.avgSlippageBps.toFixed(1)}bps slip`,
      });
    });

    const depthRank = ["BTC", "ETH", "HYPE", "SOL"];
    depthRank.forEach((coin, i) => {
      benchmarks.push({
        id: `bench-depth-${coin}`,
        category: "market_depth",
        entity: coin,
        rank: i + 1,
        score: 95 - i * 8,
        delta7d: i === 0 ? 3 : -1,
        label: "DEPTH RANK",
      });
    });

    ["BTC", "ETH", "HYPE"].forEach((coin, i) => {
      benchmarks.push({
        id: `bench-vol-${coin}`,
        category: "volatility_stability",
        entity: coin,
        rank: i + 1,
        score: 88 - i * 12,
        delta7d: i === 2 ? -6 : 2,
        label: "VOL STABILITY",
      });
    });

    return benchmarks.sort((a, b) => a.category.localeCompare(b.category) || a.rank - b.rank);
  }
}
