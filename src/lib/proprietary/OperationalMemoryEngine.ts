import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { OrganizationalMemoryEngine } from "@/lib/collaboration/OrganizationalMemoryEngine";
import type { OperationalMemoryEntry } from "@/types/proprietary-intelligence";

export class OperationalMemoryEngine {
  static archive(): OperationalMemoryEntry[] {
    const intel = IntelligenceOrchestrator.snapshot();
    const collabMemory = OrganizationalMemoryEngine.archive();
    const now = Date.now();

    const fromIntel: OperationalMemoryEntry[] = intel.events.slice(0, 4).map((e) => ({
      id: `mem-intel-${e.id}`,
      kind: "event",
      title: e.summary,
      summary: e.detail,
      analogDate: null,
      relevanceScore: e.compositeScore,
      archivedAt: e.timestamp,
    }));

    const seeded: OperationalMemoryEntry[] = [
      {
        id: "mem-vol-01",
        kind: "vol_analog",
        title: "Vol spike analog — Mar 2024 liquidation cascade",
        summary: `Current regime ${intel.marketState.regime} maps to elevated vol analog with 78% structural similarity.`,
        analogDate: "2024-03-12",
        relevanceScore: 78,
        archivedAt: now - 604_800_000,
      },
      {
        id: "mem-liq-01",
        kind: "liquidity_regime",
        title: "Thin liquidity regime — HYPE perp Q1 pattern",
        summary: "Liquidity migration from alts to majors; fragmentation index elevated.",
        analogDate: "2025-01-15",
        relevanceScore: 72,
        archivedAt: now - 432_000_000,
      },
      {
        id: "mem-macro-01",
        kind: "macro_reaction",
        title: "ETF flow shock — desk reaction archive",
        summary: "BTC beta +0.4 on flow headline; alt lag 4–6h historical pattern.",
        analogDate: "2025-11-08",
        relevanceScore: 85,
        archivedAt: now - 259_200_000,
      },
      {
        id: "mem-nar-01",
        kind: "narrative",
        title: intel.sectorNarratives[0]?.sector ?? "L1 rotation narrative evolution",
        summary: intel.sectorNarratives[0]?.summary ?? "Narrative tracking active.",
        analogDate: null,
        relevanceScore: intel.sectorNarratives[0]?.velocity ?? 50,
        archivedAt: now - 86_400_000,
      },
    ];

    const fromCollab: OperationalMemoryEntry[] = collabMemory.slice(0, 3).map((m) => ({
      id: `mem-collab-${m.id}`,
      kind: m.kind === "market_reaction" ? "macro_reaction" : "event",
      title: m.title,
      summary: m.summary,
      analogDate: null,
      relevanceScore: 65,
      archivedAt: m.archivedAt,
    }));

    return [...fromIntel, ...seeded, ...fromCollab]
      .sort((a, b) => b.archivedAt - a.archivedAt)
      .slice(0, 16);
  }
}
