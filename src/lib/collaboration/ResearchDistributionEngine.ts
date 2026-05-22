import type { ResearchPublication } from "@/types/collaboration";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";

export class ResearchDistributionEngine {
  static publications(): ResearchPublication[] {
    const net = useNetworkGraphStore.getState();
    const deskId = net.activeDeskId;
    const now = Date.now();

    const pubs: ResearchPublication[] = [
      {
        id: "res-thesis-01",
        deskId,
        kind: "thesis",
        title: "HYPE Perp — Funding Compression Setup",
        summary: "OI build + negative funding skew suggests crowded short unwind potential into weekly close.",
        authorId: "trader-01",
        authorHandle: "MACRO_LEAD",
        sectors: ["DeFi", "Perps"],
        coins: ["HYPE"],
        visibility: "team",
        publishedAt: now - 86_400_000,
        version: 2,
      },
      {
        id: "res-sector-01",
        deskId,
        kind: "sector_report",
        title: "L1 Beta Rotation — Q2 Desk View",
        summary: "Relative strength shifting from SOL ecosystem into ETH L2 volume leaders.",
        authorId: "trader-03",
        authorHandle: "FLOW_SCOUT",
        sectors: ["L1", "L2"],
        coins: ["ETH", "SOL"],
        visibility: "team",
        publishedAt: now - 172_800_000,
        version: 1,
      },
      {
        id: "res-macro-01",
        deskId,
        kind: "macro_briefing",
        title: "Weekly Macro Brief — Rates & Crypto Beta",
        summary: "Real yields stable; desk maintains risk-on posture with hedged BTC core.",
        authorId: "trader-01",
        authorHandle: "MACRO_LEAD",
        sectors: ["Macro"],
        coins: ["BTC"],
        visibility: "org",
        publishedAt: now - 259_200_000,
        version: 1,
      },
      {
        id: "res-recap-01",
        deskId,
        kind: "market_recap",
        title: "Asia Session Recap",
        summary: "Thin liquidity overnight; HYPE led alt beta with 4.2% range expansion.",
        authorId: "trader-02",
        authorHandle: "PERP_DESK_A",
        sectors: ["Market Structure"],
        coins: ["HYPE", "BTC"],
        visibility: "team",
        publishedAt: now - 43_200_000,
        version: 1,
      },
    ];

    return pubs.sort((a, b) => b.publishedAt - a.publishedAt);
  }
}
