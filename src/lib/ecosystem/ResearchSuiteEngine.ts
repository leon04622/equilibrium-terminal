import { ResearchDistributionEngine } from "@/lib/collaboration/ResearchDistributionEngine";
import { OperationalMemoryEngine } from "@/lib/proprietary/OperationalMemoryEngine";
import type { ResearchSuiteItem } from "@/types/crypto-ecosystem";

export class ResearchSuiteEngine {
  static items(): ResearchSuiteItem[] {
    const pubs = ResearchDistributionEngine.publications();
    const memory = OperationalMemoryEngine.archive();

    const fromPubs: ResearchSuiteItem[] = pubs.map((p) => ({
      id: `res-${p.id}`,
      kind: p.kind === "thesis" ? "thesis" : "publish",
      title: p.title,
      author: p.authorHandle,
      status: "active",
      updatedAt: p.publishedAt,
    }));

    const fromMemory: ResearchSuiteItem[] = memory
      .filter((m) => m.kind === "vol_analog" || m.kind === "narrative")
      .map((m) => ({
        id: `mem-${m.id}`,
        kind: m.kind === "vol_analog" ? "replay" : "narrative_archive",
        title: m.title,
        author: "DESK",
        status: "archived",
        updatedAt: m.archivedAt,
      }));

    return [...fromPubs, ...fromMemory].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
  }
}
