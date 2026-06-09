import { AnnotationInfrastructureEngine } from "@/lib/research-desk/AnnotationInfrastructureEngine";
import { MarketJournalEngine } from "@/lib/research-desk/MarketJournalEngine";
import { ThesisTrackingEngine } from "@/lib/research-desk/ThesisTrackingEngine";
import { CollaborativeAnalystEngine } from "@/lib/research-desk/CollaborativeAnalystEngine";
import type { ResearchSearchHit } from "@/types/research-operating";

export class ResearchSearchEngine {
  static search(asset: string, query = ""): ResearchSearchHit[] {
    const q = query.toLowerCase().trim();
    const hits: ResearchSearchHit[] = [];

    const score = (text: string, base: number) => {
      if (!q) return base;
      return text.toLowerCase().includes(q) ? base + 30 : 0;
    };

    for (const j of MarketJournalEngine.entries(asset)) {
      const s = score(`${j.title} ${j.body}`, 50);
      if (s > 0 || !q)
        hits.push({
          id: j.id,
          category: "journal",
          title: j.title,
          snippet: j.body.slice(0, 80),
          score: s || 40,
          timestamp: j.createdAt,
        });
    }

    for (const t of ThesisTrackingEngine.theses(asset)) {
      const s = score(`${t.thesis} ${t.invalidation}`, 55);
      if (s > 0 || !q)
        hits.push({
          id: t.id,
          category: "thesis",
          title: t.thesis.slice(0, 48),
          snippet: t.invalidation,
          score: s || 45,
          timestamp: t.updatedAt,
        });
    }

    for (const a of AnnotationInfrastructureEngine.list(asset)) {
      const s = score(`${a.label} ${a.body}`, 48);
      if (s > 0 || !q)
        hits.push({
          id: a.id,
          category: "annotation",
          title: a.label,
          snippet: a.body.slice(0, 80),
          score: s || 38,
          timestamp: a.timestamp,
        });
    }

    for (const c of CollaborativeAnalystEngine.commentary(asset)) {
      const s = score(`${c.headline} ${c.body}`, 42);
      if (s > 0 || !q)
        hits.push({
          id: c.id,
          category: "commentary",
          title: c.headline,
          snippet: c.body.slice(0, 80),
          score: s || 35,
          timestamp: c.timestamp,
        });
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, 24);
  }
}
