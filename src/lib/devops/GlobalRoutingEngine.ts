import type { RegionHealth, RegionId, RegionStatus } from "@/types/devops-operations";

const REGIONS: RegionStatus[] = [
  {
    id: "us-east",
    label: "US East (IAD)",
    provider: "Vercel / AWS",
    health: "healthy",
    latencyMs: 12,
    trafficPct: 45,
    failoverTarget: "eu-west",
  },
  {
    id: "eu-west",
    label: "EU West",
    provider: "Vercel Edge",
    health: "healthy",
    latencyMs: 28,
    trafficPct: 30,
    failoverTarget: "us-east",
  },
  {
    id: "ap-singapore",
    label: "AP Singapore",
    provider: "Vercel Edge",
    health: "healthy",
    latencyMs: 42,
    trafficPct: 15,
    failoverTarget: "us-east",
  },
  {
    id: "edge-global",
    label: "Global CDN",
    provider: "Cloudflare",
    health: "healthy",
    latencyMs: 8,
    trafficPct: 10,
    failoverTarget: null,
  },
];

export class GlobalRoutingEngine {
  static regions(overrideLatency?: Partial<Record<RegionId, number>>): RegionStatus[] {
    return REGIONS.map((r) => ({
      ...r,
      latencyMs: overrideLatency?.[r.id] ?? r.latencyMs,
      health: GlobalRoutingEngine.healthForLatency(overrideLatency?.[r.id] ?? r.latencyMs),
    }));
  }

  static pickActiveRegion(regions: RegionStatus[]): RegionId {
    const healthy = regions.filter((r) => r.health === "healthy" || r.health === "degraded");
    if (!healthy.length) return "us-east";
    return healthy.sort((a, b) => a.latencyMs - b.latencyMs)[0]!.id;
  }

  private static healthForLatency(ms: number): RegionHealth {
    if (ms > 200) return "failover";
    if (ms > 80) return "degraded";
    return "healthy";
  }
}
