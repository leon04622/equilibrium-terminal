import { ResearchDistributionEngine } from "@/lib/collaboration/ResearchDistributionEngine";
import { DeskAnnotationEngine } from "@/lib/collaboration/DeskAnnotationEngine";
import type { OrganizationalMemoryItem } from "@/types/collaboration";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";

export class OrganizationalMemoryEngine {
  static archive(): OrganizationalMemoryItem[] {
    const net = useNetworkGraphStore.getState();
    const now = Date.now();

    const fromResearch: OrganizationalMemoryItem[] = ResearchDistributionEngine.publications().map(
      (pub) => ({
        id: `mem-${pub.id}`,
        kind: pub.kind === "thesis" ? "thesis_evolution" : "research",
        title: pub.title,
        summary: pub.summary,
        coin: pub.coins[0] ?? null,
        archivedAt: pub.publishedAt,
        authorHandle: pub.authorHandle,
        tags: [...pub.sectors, ...pub.coins],
      }),
    );

    const fromAnnotations: OrganizationalMemoryItem[] = DeskAnnotationEngine.list()
      .filter((a) => a.pinned)
      .map((ann) => ({
        id: `mem-${ann.id}`,
        kind: "annotation" as const,
        title: ann.label,
        summary: ann.body,
        coin: ann.coin,
        archivedAt: ann.timestamp,
        authorHandle: ann.authorHandle,
        tags: ann.tags,
      }));

    const seeded: OrganizationalMemoryItem[] = [
      {
        id: "mem-event-01",
        kind: "event_analysis",
        title: "BTC ETF flow shock — desk post-mortem",
        summary: "Desk reaction analysis archived. Execution slippage contained via limit routing.",
        coin: "BTC",
        archivedAt: now - 604_800_000,
        authorHandle: "MACRO_LEAD",
        tags: ["ETF", "macro", "execution"],
      },
      {
        id: "mem-react-01",
        kind: "market_reaction",
        title: "HYPE funding squeeze — reaction archive",
        summary: "Price +12% in 4h post funding flip. Desk PnL attribution logged.",
        coin: "HYPE",
        archivedAt: now - 432_000_000,
        authorHandle: "PERP_DESK_A",
        tags: ["funding", "reaction"],
      },
    ];

    return [...fromResearch, ...fromAnnotations, ...seeded]
      .sort((a, b) => b.archivedAt - a.archivedAt)
      .slice(0, 16);
  }
}
